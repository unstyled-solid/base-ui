// Adapted from Base UI's useCollapsiblePanel (MIT), baseline 19511bb171f3b360b006c94cf6d07e53cb446505.
import { createEffect, createMemo, createSignal, onCleanup, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createAnimationsFinished } from '../../internals/createAnimationsFinished';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import type { TransitionStatus } from '../../internals/createTransitionStatus';
import { createMergedRefsN } from '../../utils/createMergedRefs';
import { createAnimationFrame } from '../../utils/createAnimationFrame';
import { createTimeout } from '../../utils/createTimeout';
import { ownerWindow } from '../../utils/owner';
import { warn } from '../../utils/warn';
import type { CollapsibleRootChangeEventDetails } from '../root/CollapsibleRoot';

type AnimationType = 'css-transition' | 'css-animation' | 'none';
interface Dimensions { height: number | undefined; width: number | undefined }
const EMPTY: Dimensions = { height: undefined, width: undefined };

export function createCollapsiblePanel(p: UseCollapsiblePanelParameters): UseCollapsiblePanelReturnValue {
  const [element, setElement] = createSignal<HTMLDivElement | null>(null);
  // Layout is an external input, measured after DOM commit. Re-reading the same
  // pixel size in the close/ending passes must not publish a new dimensions value.
  const [dimensions, setDimensions] = createSignal<Dimensions>(EMPTY, {
    equals: (previous, next) => previous.height === next.height && previous.width === next.width,
  });
  const [animationType, setAnimationType] = createSignal<AnimationType | null>(null);
  const [preventMountAnimation, setPreventMountAnimation] = createSignal(untrack(() => p.open));
  const [forceIdle, setForceIdle] = createSignal(false);
  let measured: Dimensions = EMPTY;
  let skipNextOpen = false;
  let restoreTemporary: (() => void) | undefined;
  const layoutFrame = createAnimationFrame();
  const endingFrame = createAnimationFrame();
  const revertFrame = createAnimationFrame();
  const revealDecision = createTimeout();
  const panelRef = (node: HTMLDivElement | null) => { setElement(node); };
  const ref = createMergedRefsN<HTMLDivElement>(() => [p.externalRef, panelRef]);
  const hidden = () => !p.open && !p.mounted;
  const status = () => p.open && forceIdle() ? 'idle' : p.transitionStatus;
  const preventAnimation = () => p.open && preventMountAnimation();
  const measure = (panel: HTMLElement) => {
    measured = { height: panel.scrollHeight, width: panel.scrollWidth };
    setDimensions(measured);
  };
  const restoreMotion = () => { restoreTemporary?.(); restoreTemporary = undefined; };
  onCleanup(restoreMotion);

  createEffect(() => ({ forced: forceIdle(), status: p.transitionStatus }), ({ forced, status: transition }) => {
    if (forced && transition !== 'starting') setForceIdle(false);
  });

  createEffect(() => ({ panel: element(), open: p.open, mounted: p.mounted,
    transition: p.transitionStatus, suppressed: preventAnimation() }),
  ({ panel, open, mounted, transition, suppressed }) => {
    if (!panel) return;
    if (!open) {
      restoreMotion();
      setPreventMountAnimation(false);
    }
    const mode = getAnimationType(panel, suppressed);
    setAnimationType(mode);
    if (open && transition === 'idle' && suppressed && mode === 'css-animation') {
      measured = { height: panel.scrollHeight, width: panel.scrollWidth };
      return;
    }
    if (open && transition === 'starting') {
      const skip = skipNextOpen;
      skipNextOpen = false;
      let restoreLayout: (() => void) | undefined;
      if (mode === 'css-transition') {
        const restores = ['justify-content', 'align-items', 'align-content', 'justify-items']
          .map((key) => temporaryStyle(panel, key, 'initial', 'important'));
        restoreLayout = () => { layoutFrame.cancel(); restores.forEach((restore) => restore()); };
        layoutFrame.request(restoreLayout);
      }
      measure(panel);
      if (mode === 'none' || skip) {
        if (mode !== 'none') {
          restoreMotion();
          restoreTemporary = temporaryStyle(panel,
            mode === 'css-transition' ? 'transition-duration' : 'animation-duration', '0s');
        }
        setForceIdle(true);
      }
      if (mode === 'css-animation') temporaryStyle(panel, 'animation-name', 'none')();
      return restoreLayout;
    }
    if (!open && mounted) {
      if (mode === 'none') {
        setDimensions(EMPTY);
        p.setMounted(false);
        return;
      }
      measure(panel);
      if (transition === 'ending') {
        if (measured.height === 0 && measured.width === 0) {
          p.setMounted(false);
          return;
        }
        if (mode === 'css-animation') temporaryStyle(panel, 'animation-name', 'none')();
      }
    }
  });

  createAnimationsFinished({
    element,
    enabled: () => p.open && p.mounted && status() === 'idle',
    onFinished() {
      // A completion queued before close must not erase its pixel measurement.
      if (untrack(() => p.open)) setDimensions(EMPTY);
    },
  });
  // Upstream starts the close watcher imperatively after the ending-style frame.
  // A reactive "ready" relay adds no state here: cleanup owns both the frame and
  // the pending animation completion, including interrupted closes.
  const runCloseAnimationsFinished = createAnimationsFinished(element);
  createEffect(() => ({ panel: element(), open: p.open, mounted: p.mounted, transition: status() }),
    ({ panel, open, mounted, transition }) => {
      if (!panel || open || !mounted || transition !== 'ending') return;
      const controller = new AbortController();
      // Observe after ending attributes have committed, including sibling Accordion changes.
      endingFrame.request(() => {
        runCloseAnimationsFinished(() => {
          if (untrack(() => p.open)) return;
          p.setMounted(false);
          setDimensions(EMPTY);
        }, controller.signal);
      });
      return () => { endingFrame.cancel(); controller.abort(); };
    });

  createEffect(element, (panel) => {
    if (!panel) return;
    const revert = (restoreStarting: boolean, clearSkip: boolean) => {
      revealDecision.start(0, () => {
        if (untrack(() => p.open)) return;
        revertFrame.request(() => {
          if (untrack(() => p.open)) return;
          if (clearSkip) skipNextOpen = false;
          if (restoreStarting) panel.setAttribute('data-starting-style', '');
          panel.setAttribute('hidden', 'until-found');
        });
      });
    };
    const beforeMatch = (event: Event) => {
      const details = createChangeEventDetails('none', event);
      untrack(() => p.onOpenChange(true, details));
      if (details.isCanceled) { revert(false, false); return; }
      skipNextOpen = true;
      const hadStartingStyle = panel.hasAttribute('data-starting-style');
      // Native find-in-page measures in THIS task. An ordinary staged Solid write
      // cannot satisfy this requirement; remove only the collapsed DOM style now.
      panel.removeAttribute('data-starting-style');
      p.setOpen(true);
      revert(hadStartingStyle, true);
    };
    panel.addEventListener('beforematch', beforeMatch);
    return () => {
      panel.removeEventListener('beforematch', beforeMatch);
      revealDecision.clear();
      revertFrame.cancel();
      restoreMotion();
    };
  });

  // Height and width share this policy, and open/mounted can change while the
  // resulting dimensions stay equal. Keep external measurement in its effect.
  const renderedDimensions = createMemo(() => {
    const current = dimensions();
    // Open/mounted/motion only select the cached keyframe fallback after the live
    // size was cleared to auto; they do not change an existing pixel measurement.
    if (current.height !== undefined || current.width !== undefined) return current;
    return animationType() === 'css-animation' && !p.open && p.mounted ? measured : current;
  }, { equals: (previous, next) => previous.height === next.height && previous.width === next.width });
  const persistStartingStyle = () => p.hiddenUntilFound && hidden() && animationType() !== 'css-animation';
  // Absence is significant to Base UI merging: an explicit undefined would mask
  // the opening transition attribute supplied by either Collapsible or Accordion.
  const panelProps: UseCollapsiblePanelReturnValue['props'] = new Proxy({}, {
    ownKeys: () => persistStartingStyle() ? ['id', 'hidden', 'data-starting-style'] : ['id', 'hidden'],
    has: (_, key) => key === 'id' || key === 'hidden' || key === 'data-starting-style' && persistStartingStyle(),
    getOwnPropertyDescriptor: (_, key) => key === 'id' || key === 'hidden' || key === 'data-starting-style' && persistStartingStyle()
      ? { configurable: true, enumerable: true, get: () => panelProps[key as keyof typeof panelProps] } : undefined,
    get(_, key) {
      if (key === 'id') return p.id;
      if (key === 'hidden') return hidden() ? p.hiddenUntilFound ? 'until-found' : true : false;
      if (key === 'data-starting-style') return persistStartingStyle() ? '' : undefined;
      return undefined;
    },
  });
  return {
    ref,
    get shouldRender() { return p.keepMounted || p.hiddenUntilFound || p.mounted || p.open; },
    get shouldPreventOpenAnimation() { return preventAnimation(); },
    get transitionStatus() { return status(); },
    get height() { return renderedDimensions().height; },
    get width() { return renderedDimensions().width; },
    props: panelProps,
  };
}

function getAnimationType(panel: HTMLElement, suppressed: boolean): AnimationType {
  const style = ownerWindow(panel).getComputedStyle(panel);
  const nonzero = (value: string) => value.split(',').some((part) => Number.parseFloat(part) > 0);
  const animation = (suppressed || style.animationName.split(',').some((name) => name.trim() !== '' && name.trim() !== 'none'))
    && nonzero(style.animationDuration);
  const transition = nonzero(style.transitionDuration);
  if (animation && transition && process.env.NODE_ENV !== 'production') {
    warn('CSS transitions and CSS animations both detected on Collapsible or Accordion panel.', 'Only one of either animation type should be used.');
  }
  return transition ? 'css-transition' : animation ? 'css-animation' : 'none';
}
function temporaryStyle(element: HTMLElement, property: string, value: string, priority = '') {
  const previous = element.style.getPropertyValue(property);
  const previousPriority = element.style.getPropertyPriority(property);
  element.style.setProperty(property, value, priority);
  return () => {
    if (previous === '') element.style.removeProperty(property);
    else element.style.setProperty(property, previous, previousPriority);
  };
}
export interface UseCollapsiblePanelParameters {
  externalRef?: JSX.Ref<HTMLDivElement>;
  hiddenUntilFound: boolean;
  id: string | undefined;
  keepMounted: boolean;
  mounted: boolean;
  open: boolean;
  onOpenChange(open: boolean, details: CollapsibleRootChangeEventDetails): void;
  setMounted(mounted: boolean): void;
  setOpen(open: boolean): void;
  transitionStatus: TransitionStatus;
}
export interface UseCollapsiblePanelReturnValue {
  readonly height: number | undefined;
  readonly width: number | undefined;
  readonly props: JSX.HTMLAttributes<HTMLDivElement> & { 'data-starting-style'?: string };
  readonly ref: JSX.Ref<HTMLDivElement>;
  readonly shouldPreventOpenAnimation: boolean;
  readonly shouldRender: boolean;
  readonly transitionStatus: TransitionStatus;
}
export { createCollapsiblePanel as useCollapsiblePanel };
