import { Progress, ProgressRootDataAttributes, ProgressIndicatorDataAttributes,
  ProgressLabelDataAttributes, ProgressTrackDataAttributes, ProgressValueDataAttributes } from './index';
import type { ProgressRootProps, ProgressRootState, ProgressStatus, ProgressValueProps } from './index';

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;
export type ProgressTypeChecks = [
  Assert<Equal<Progress.Status, ProgressStatus>>,
  Assert<Equal<Progress.Root.Props, ProgressRootProps>>,
  Assert<Equal<Progress.Root.State, ProgressRootState>>,
  Assert<Equal<Progress.Value.Props, ProgressValueProps>>,
  Assert<Equal<Progress.Label.State, ProgressRootState>>,
  Assert<Equal<Progress.Track.State, ProgressRootState>>,
  Assert<Equal<Progress.Indicator.State, ProgressRootState>>,
  Assert<Equal<typeof ProgressRootDataAttributes.complete, 'data-complete'>>,
  Assert<Equal<typeof ProgressLabelDataAttributes.progressing, 'data-progressing'>>,
  Assert<Equal<typeof ProgressValueDataAttributes.indeterminate, 'data-indeterminate'>>,
  Assert<Equal<typeof ProgressTrackDataAttributes.complete, 'data-complete'>>,
  Assert<Equal<typeof ProgressIndicatorDataAttributes.complete, 'data-complete'>>,
];

export function ProgressConsumer() {
  return <Progress.Root value={null} locale={['de-DE']} format={{ style: 'percent' }}
    getAriaValueText={(formatted, raw) => `${formatted}:${raw}`}
    class={(state) => ['progress', { complete: state.status === 'complete' }]}
    style={(state) => ({ opacity: state.status === 'indeterminate' ? .5 : 1 })}
    render={(props, state) => <section class={props.class} style={props.style} data-status={state.status}>{props.children}</section>}>
    <Progress.Label ref={(element: HTMLSpanElement) => { element.title = 'label'; }}>Task</Progress.Label>
    <Progress.Track ref={(element: HTMLDivElement) => { element.title = 'track'; }}>
      <Progress.Indicator />
    </Progress.Track>
    <Progress.Value>{(formatted, raw) => <span>{formatted}:{raw}</span>}</Progress.Value>
  </Progress.Root>;
}

// @ts-expect-error value is required
const missingValue: Progress.Root.Props = {};
// @ts-expect-error source only supports a number or null
const invalidValue: Progress.Root.Props = { value: '30' };
// @ts-expect-error static Value children are not part of the source API
const invalidChildren: Progress.Value.Props = { children: '30%' };
// @ts-expect-error invalid progress status
const invalidStatus: Progress.Status = 'loading';
void [missingValue, invalidValue, invalidChildren, invalidStatus];
