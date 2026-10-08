import { dynamic, generateHydrationScript, isServer, renderToString } from "@solidjs/web";
import { children, createContext, createEffect, createMemo, createSignal, createUniqueId, merge, omit, onCleanup, onSettled, runWithOwner, untrack, useContext } from "solid-js";
//#region packages/solid/src/merge-props/mergeProps.ts
/** Native Event brand check works for iframe events and never brands value callbacks. */
function isNativeEvent(value) {
	if (value == null || typeof value !== "object" || typeof Event === "undefined") return false;
	try {
		Object.getOwnPropertyDescriptor(Event.prototype, "type").get.call(value);
		return true;
	} catch {
		return false;
	}
}
var preventionAttempts = /* @__PURE__ */ new WeakSet();
var enhancedEvents = /* @__PURE__ */ new WeakSet();
function makeEventPreventable(event) {
	const result = event;
	if (!enhancedEvents.has(event)) {
		enhancedEvents.add(event);
		const preventDefault = event.preventDefault;
		const descriptor = Object.getOwnPropertyDescriptor(event, "preventDefault");
		if (!descriptor || descriptor.writable || descriptor.set) event.preventDefault = function() {
			preventionAttempts.add(event);
			preventDefault.call(this);
		};
		else if (descriptor.configurable) Object.defineProperty(event, "preventDefault", {
			configurable: true,
			enumerable: descriptor.enumerable,
			writable: descriptor.writable ?? false,
			value: function() {
				preventionAttempts.add(event);
				preventDefault.call(this);
			}
		});
	}
	result.preventBaseUIHandler = () => {
		result.baseUIHandlerPrevented = true;
	};
	return result;
}
function eventKey(key) {
	const third = key.charCodeAt(2);
	return key.startsWith("on") && third >= 65 && third <= 90;
}
function mergeClassNames(ours, theirs) {
	if (!theirs) return ours;
	if (!ours) return theirs;
	return typeof ours === "string" && typeof theirs === "string" ? `${theirs} ${ours}` : [theirs, ours];
}
/** CSS strings are native Solid input; preserve their cascade when mixed with objects. */
function mergeStyles(ours, theirs) {
	if (typeof theirs === "symbol") return theirs;
	if (typeof ours === "symbol") return theirs ?? ours;
	if (theirs === false) return false;
	if (ours === false) return theirs ?? false;
	if (theirs == null) return ours;
	if (ours == null) return theirs;
	if (typeof ours !== "string" && typeof theirs !== "string") return {
		...ours,
		...theirs
	};
	const css = (value) => typeof value === "string" ? value : Object.entries(value).filter(([, entry]) => entry != null).map(([key, entry]) => `${key}:${entry}`).join(";");
	return `${css(ours)};${css(theirs)}`;
}
function isBoundHandler(handler) {
	return handler !== null && typeof handler === "object" && typeof Reflect.get(handler, "0") === "function" && "1" in handler;
}
function call(handler, args) {
	if (isBoundHandler(handler)) return handler[0](handler[1], ...args);
	if (typeof handler === "function") return handler(...args);
}
function handlerValue(value) {
	return value === void 0 || typeof value === "function" || isBoundHandler(value);
}
/** Each stage is read-through: getter receivers stay on their source objects. */
function mergeStage(previous, source) {
	const handlers = /* @__PURE__ */ new Map();
	const result = new Proxy({}, {
		ownKeys: () => [.../* @__PURE__ */ new Set([...Object.keys(previous), ...Object.keys(source)])],
		has: (_, key) => typeof key === "string" && (key in source || key in previous),
		getOwnPropertyDescriptor: (_, key) => typeof key === "string" && (key in source || key in previous) ? {
			configurable: true,
			enumerable: true,
			get: () => result[key]
		} : void 0,
		get(_, key) {
			if (typeof key !== "string") return void 0;
			if (!(key in source)) return previous[key];
			const next = source[key];
			if (key === "class") return mergeClassNames(previous[key], next);
			if (key === "style") return mergeStyles(previous[key], next);
			if (eventKey(key) && handlerValue(next)) {
				if (next === void 0) return previous[key];
				if (!handlers.has(key)) handlers.set(key, (...args) => {
					const current = source[key];
					if (current === void 0) return call(previous[key], args);
					if (isNativeEvent(args[0])) makeEventPreventable(args[0]);
					const result = call(current, args);
					if (!isNativeEvent(args[0]) || !args[0].baseUIHandlerPrevented) call(previous[key], args);
					return result;
				});
				return handlers.get(key);
			}
			return next;
		}
	});
	return result;
}
function mergePropsN(inputs) {
	let result = {};
	for (const input of inputs) {
		if (!input) continue;
		result = typeof input === "function" ? input(result) : mergeStage(result, input);
	}
	return result;
}
//#endregion
//#region packages/solid/src/utils/createMergedRefs.ts
function flatten(refs) {
	return refs.flatMap((ref) => Array.isArray(ref) ? flatten(ref) : ref == null ? [] : [ref]);
}
/** Create during setup. The returned callback is safe in an ownerless renderer ref.
* Callback returns follow RC13 (ignored). Composed callbacks must tolerate a null
* detach notification, supplied by this owner because the renderer does not send it.
*/
function createMergedRefsN(refs) {
	const read = () => [...new Set(flatten(typeof refs === "function" ? refs() : refs))];
	let current = null;
	let attached = [];
	let disposed = false;
	function apply(ref, element) {
		untrack(() => runWithOwner(null, () => {
			if (typeof ref === "function") ref(element);
			else if (ref != null && typeof ref === "object" && "current" in ref) ref.current = element;
		}));
	}
	function detach() {
		const previous = attached;
		attached = [];
		for (const ref of previous) apply(ref, null);
	}
	function attach(next) {
		if (current === null) return;
		attached = next;
		for (const ref of attached) apply(ref, current);
	}
	onCleanup(() => {
		disposed = true;
		detach();
		current = null;
	});
	const sameRefs = (a, b) => a.length === b.length && a.every((ref, i) => ref === b[i]);
	const inputs = createMemo(read, {
		equals: sameRefs,
		transparent: true
	});
	createEffect(inputs, (next) => {
		if (!sameRefs(next, attached)) {
			detach();
			attach(next);
		}
	}, { transparent: true });
	const callback = (element) => {
		if (disposed || element === current) return;
		detach();
		current = element;
		attach(untrack(read));
	};
	return Object.defineProperty(callback, "current", { get: () => current });
}
//#endregion
//#region packages/solid/src/utils/resolveClass.ts
function resolveClass(value, state) {
	return typeof value === "function" ? value(state) : value;
}
//#endregion
//#region packages/solid/src/utils/resolveStyle.ts
function resolveStyle(value, state) {
	return typeof value === "function" ? value(state) : value;
}
//#endregion
//#region packages/solid/src/internals/getStateAttributesProps.ts
function getStateAttributesProps(state, mapping) {
	const result = {};
	for (const key in state) {
		const value = state[key];
		if (mapping && Object.hasOwn(mapping, key)) {
			const custom = mapping[key](value);
			if (custom != null) Object.assign(result, custom);
		} else if (value === true) result[`data-${key.toLowerCase()}`] = "";
		else if (value) result[`data-${key.toLowerCase()}`] = String(value);
	}
	return result;
}
//#endregion
//#region packages/solid/src/internals/createRenderElement.tsx
var EMPTY_CHILDREN = {};
/** Setup-owned stable host. Only the actual render target/enabled value controls identity. */
function createRenderElement(element, componentProps, params = {}) {
	const state = new Proxy({}, {
		get: (_, key) => {
			const source = params.state ?? {};
			return Reflect.get(source, key, source);
		},
		ownKeys: () => Reflect.ownKeys(params.state ?? {}),
		has: (_, key) => key in (params.state ?? {}),
		getOwnPropertyDescriptor: (_, key) => key in (params.state ?? {}) ? {
			enumerable: true,
			configurable: true
		} : void 0
	});
	const tag = () => typeof element === "function" ? element() : element;
	const valueProperty = () => !isServer && componentProps.render === void 0 && (tag() === "input" || tag() === "textarea");
	const childrenProps = createMemo(() => {
		if (params.enabled === false) return EMPTY_CHILDREN;
		const inputs = params.props;
		let accumulated = {}, source;
		for (const input of Array.isArray(inputs) ? inputs : [inputs]) {
			if (!input) continue;
			if (typeof input === "function") {
				accumulated = input(accumulated);
				source = "children" in accumulated ? accumulated : void 0;
			} else {
				accumulated = mergePropsN([accumulated, input]);
				if ("children" in input) source = input;
			}
		}
		return source ?? EMPTY_CHILDREN;
	}, { transparent: true });
	const resolved = createMemo(() => {
		if (params.enabled === false) return {};
		const defaults = componentProps.render === void 0 ? tag() === "button" ? { type: "button" } : tag() === "img" ? { alt: "" } : {} : {};
		const stateProps = getStateAttributesProps(state, params.stateAttributesMapping);
		const inputs = params.props;
		const merged = mergePropsN([
			defaults,
			stateProps,
			...Array.isArray(inputs) ? inputs : [inputs]
		]);
		return params.propGetter ? params.propGetter(merged) : merged;
	}, { transparent: true });
	const [node, setNode] = createSignal(null, { ownedWrite: true });
	const report = (element) => {
		setNode(() => element);
	};
	const ref = createMergedRefsN(() => [
		report,
		resolved().ref,
		...Array.isArray(params.ref) ? params.ref : [params.ref]
	]);
	let projectedValue;
	const projection = createMemo(() => ({
		element: node(),
		value: resolved().value,
		render: componentProps.render
	}), {
		transparent: true,
		equals: (before, next) => before.element === next.element && Object.is(before.value, next.value) && before.render === next.render
	});
	createEffect(projection, (next) => {
		projectedValue = next.element && ["INPUT", "TEXTAREA"].includes(next.element.tagName) ? {
			element: next.element,
			value: next.element.value
		} : void 0;
	});
	const restoreInput = (element) => {
		if (!element || !["INPUT", "TEXTAREA"].includes(element.tagName)) return;
		const declared = untrack(() => resolved().value);
		if (declared === void 0 || declared === null) return;
		const value = untrack(() => componentProps.render !== void 0 && projectedValue?.element === element ? projectedValue.value : declared);
		if (value !== void 0 && value !== null && element.value !== String(value)) element.value = String(value);
	};
	createEffect(node, (element) => {
		if (!element) return;
		const root = element.getRootNode();
		if (root === element) return;
		const Observer = element.ownerDocument.defaultView?.MutationObserver;
		if (!Observer) return;
		const observer = new Observer(() => {
			if (ref.current === element && !element.isConnected && !root.contains(element)) ref(null);
		});
		observer.observe(root, {
			childList: true,
			subtree: true
		});
		return () => observer.disconnect();
	});
	createEffect(node, (element) => {
		if (!element || !["INPUT", "TEXTAREA"].includes(element.tagName)) return;
		const input = (event) => {
			if (element.disabled) untrack(() => live.onInput?.(event));
			queueMicrotask(() => queueMicrotask(() => {
				if (ref.current === element) restoreInput(element);
			}));
		};
		element.addEventListener("input", input);
		return () => element.removeEventListener("input", input);
	});
	const handlers = /* @__PURE__ */ new Map();
	const live = new Proxy({}, {
		ownKeys: () => [.../* @__PURE__ */ new Set([
			...Object.keys(resolved()).map((key) => valueProperty() && key === "value" ? "prop:value" : key),
			"class",
			"style",
			"ref"
		])],
		has: (_, key) => typeof key === "string" && (key === "class" || key === "style" || key === "ref" || (key === "children" ? key in childrenProps() : (key === "prop:value" ? "value" : key) in resolved())),
		getOwnPropertyDescriptor: (_, key) => typeof key === "string" && untrack(() => key === "class" || key === "style" || key === "ref" || (key === "children" ? key in childrenProps() : (key === "prop:value" ? "value" : key) in resolved())) ? {
			configurable: true,
			enumerable: true,
			get: () => live[key]
		} : void 0,
		get(_, key) {
			if (typeof key !== "string") return void 0;
			if (key === "ref") return ref;
			if (key === "children") return childrenProps().children;
			if (key === "class") return mergeClassNames(resolved().class, resolveClass(componentProps.class, state));
			if (key === "style") return mergeStyles(resolved().style, resolveStyle(componentProps.style, state));
			if (key === "prop:value") return resolved().value;
			const value = resolved()[key];
			if (key.startsWith("aria-") && typeof value === "boolean") return String(value);
			if (typeof key === "string" && /^on[A-Z]/.test(key) && typeof value === "function") {
				if (!handlers.has(key)) handlers.set(key, (...args) => {
					const dispatch = () => {
						const result = resolved()[key]?.(...args);
						if (key === "onInput") {
							const element = ref.current;
							queueMicrotask(() => {
								if (ref.current === element) restoreInput(element);
							});
						}
						return result;
					};
					return isNativeEvent(args[0]) ? untrack(dispatch) : dispatch();
				});
				return handlers.get(key);
			}
			return value;
		}
	});
	const outputProps = merge(() => live);
	const targets = /* @__PURE__ */ new WeakMap();
	const hosts = /* @__PURE__ */ new Map();
	const ownedHost = (render) => () => {
		let element = null;
		let alive = true;
		let committed = false;
		const hostRef = (next) => {
			element = next;
			if (!next || next.ownerDocument.defaultView) ref(next);
			else if (committed) queueMicrotask(() => {
				if (alive && element === next) ref(next);
			});
		};
		if (!isServer) onSettled(() => {
			committed = true;
			if (alive && element && ref.current !== element) ref(element);
		});
		onCleanup(() => {
			alive = false;
			if (element && ref.current === element) ref(null);
		});
		return render(merge(outputProps, { ref: hostRef }));
	};
	const Host = dynamic(() => {
		if (params.enabled === false) return void 0;
		const render = componentProps.render;
		if (render !== void 0) {
			if (typeof render !== "function") throw new Error("Base UI: render must be a Solid render callback. Pass (props, state) => JSX to compose the host.");
			let target = targets.get(render);
			if (!target) {
				target = ownedHost((props) => render(props, state));
				targets.set(render, target);
			}
			return target;
		}
		const name = tag() ?? "div";
		let host = hosts.get(name);
		if (!host) {
			const NativeHost = dynamic(() => name, { static: true });
			host = ownedHost((props) => {
				const content = children(() => props.children);
				const attributes = merge(props, { get children() {
					return content();
				} });
				const target = () => NativeHost(attributes);
				return dynamic(() => {
					content();
					return target;
				})({});
			});
			hosts.set(name, host);
		}
		return host;
	});
	const end = isServer ? void 0 : document.createTextNode("");
	return [Host(outputProps), end];
}
//#endregion
//#region packages/solid/src/avatar/root/AvatarRootContext.ts
var AvatarRootContext = createContext();
function useAvatarRootContext() {
	return useContext(AvatarRootContext);
}
//#endregion
//#region packages/solid/src/avatar/root/stateAttributesMapping.ts
var avatarStateAttributesMapping = { imageLoadingStatus: () => null };
//#endregion
//#region packages/solid/src/avatar/root/AvatarRoot.tsx
var _m$$2 = Symbol();
var _d$$2 = {
	get() {
		const Host = this[_m$$2];
		return Host({});
	},
	enumerable: true,
	configurable: true
};
function _P$$2(_p, _p2) {
	this[_m$$2] = _p;
	this.value = _p2;
	Object.defineProperty(this, "children", _d$$2);
}
_P$$2.prototype = Object.prototype;
/** Displays a user's profile picture, initials, or fallback icon. Renders a `<span>`. */
function AvatarRoot(componentProps) {
	const [imageLoadingStatus, setImageLoadingStatus] = createSignal("idle");
	const state = { get imageLoadingStatus() {
		return imageLoadingStatus();
	} };
	const context = {
		get imageLoadingStatus() {
			return imageLoadingStatus();
		},
		setImageLoadingStatus
	};
	const elementProps = omit(componentProps, "class", "style", "render");
	const Host = () => createRenderElement("span", componentProps, {
		state,
		props: elementProps,
		stateAttributesMapping: avatarStateAttributesMapping
	});
	return AvatarRootContext(new _P$$2(Host, context));
}
//#endregion
//#region packages/solid/src/utils/createAnimationFrame.ts
var Scheduler = class {
	callbacks = /* @__PURE__ */ new Map();
	nextId = 1;
	nativeId = null;
	cancelNative;
	requestNative;
	tick = (timestamp) => {
		this.nativeId = null;
		const callbacks = this.callbacks;
		this.callbacks = /* @__PURE__ */ new Map();
		for (const callback of callbacks.values()) callback(timestamp);
	};
	request(fn) {
		const id = this.nextId++;
		this.callbacks.set(id, fn);
		if (this.nativeId === null || this.requestNative !== globalThis.requestAnimationFrame) {
			this.requestNative = globalThis.requestAnimationFrame;
			this.cancelNative = globalThis.cancelAnimationFrame.bind(globalThis);
			this.nativeId = globalThis.requestAnimationFrame(this.tick);
		}
		return id;
	}
	cancel(id) {
		this.callbacks.delete(id);
		if (this.callbacks.size === 0 && this.nativeId !== null) {
			this.cancelNative?.(this.nativeId);
			this.nativeId = null;
		}
	}
	reset() {
		this.callbacks.clear();
		if (this.nativeId !== null) this.cancelNative?.(this.nativeId);
		this.nativeId = null;
	}
};
var scheduler = new Scheduler();
var AnimationFrame = class AnimationFrame {
	static create() {
		return new AnimationFrame();
	}
	static request(fn) {
		return scheduler.request(fn);
	}
	static cancel(id) {
		scheduler.cancel(id);
	}
	currentId = null;
	request(fn) {
		this.cancel();
		const id = scheduler.request(() => {
			if (this.currentId !== id) return;
			this.currentId = null;
			fn();
		});
		this.currentId = id;
	}
	cancel = () => {
		if (this.currentId !== null) {
			scheduler.cancel(this.currentId);
			this.currentId = null;
		}
	};
	disposeEffect = () => this.cancel;
};
function createAnimationFrame() {
	const frame = AnimationFrame.create();
	onCleanup(frame.cancel);
	return frame;
}
//#endregion
//#region packages/solid/src/internals/createTransitionStatus.ts
/** Getter-backed result, not accessor-valued fields. All inputs remain live. */
function createTransitionStatus(open, enableIdleState = () => false, deferEndingState = () => false, animateInitialOpen = false) {
	const frame = createAnimationFrame();
	const [manual, setManual] = createSignal(void 0);
	const [tick, setTick] = createSignal(0);
	const snapshot = createMemo((previous) => {
		const isOpen = open(), idle = enableIdleState(), defer = deferEndingState();
		const request = manual(), frameTick = tick();
		let mounted = previous?.mounted ?? isOpen;
		let status = previous?.status;
		let pending = false;
		if (!previous) status = isOpen ? animateInitialOpen ? "starting" : idle ? "idle" : void 0 : void 0;
		if (request !== previous?.manual && request) mounted = request.value;
		if (isOpen && !mounted) {
			mounted = true;
			status = "starting";
		}
		if (previous && isOpen !== previous.open) {
			if (isOpen) status = idle || !mounted ? "starting" : status;
			else if (mounted && !defer) status = "ending";
		}
		if (!isOpen && mounted && status !== "ending") {
			if (!defer || previous?.pending && frameTick !== previous.tick) status = "ending";
			else pending = true;
		}
		if (!isOpen && !mounted) status = void 0;
		if (isOpen && previous && frameTick !== previous.tick) status = idle ? "idle" : void 0;
		if (isOpen && status !== (idle ? "idle" : void 0)) pending = true;
		return {
			open: isOpen,
			mounted,
			status,
			manual: request,
			tick: frameTick,
			pending
		};
	});
	createEffect(() => {
		const current = snapshot();
		return {
			open: current.open,
			pending: current.pending,
			status: current.status
		};
	}, (next) => {
		if (!next.pending) return;
		frame.request(() => setTick((value) => value + 1));
		return frame.cancel;
	});
	const setMounted = ((value) => {
		setManual((previous) => ({ value: typeof value === "function" ? value(previous?.value ?? snapshot().mounted) : value }));
	});
	return {
		get mounted() {
			return snapshot().mounted;
		},
		get transitionStatus() {
			return snapshot().status;
		},
		setMounted
	};
}
//#endregion
//#region packages/solid/src/utils/getFiniteAnimations.ts
/** Infinite animations cannot participate in completion. Base UI, MIT. */
function getFiniteAnimations(element, options) {
	return element.getAnimations(options).filter((animation) => {
		const timing = animation.effect?.getTiming();
		return timing?.duration !== Infinity && timing?.iterations !== Infinity;
	});
}
//#endregion
//#region packages/solid/src/internals/createAnimationsFinished.ts
var pendingCompletions = [];
var completionScheduled = false;
/** Default source completions commit separately. RC13 stages ordinary writes,
* so let its commit checkpoint run before delivering the next ready callback. */
function enqueueCompletion(callback) {
	pendingCompletions.push(callback);
	if (completionScheduled) return;
	completionScheduled = true;
	const next = () => {
		try {
			pendingCompletions.shift()?.();
		} finally {
			if (pendingCompletions.length) queueMicrotask(next);
			else completionScheduled = false;
		}
	};
	queueMicrotask(next);
}
function createAnimationsFinished(input, wait = false, batch = false) {
	const frame = createAnimationFrame();
	let cancelCurrent = () => {};
	onCleanup(() => cancelCurrent());
	const element = typeof input === "function" ? input : input.element;
	const run = (callback, signal) => {
		cancelCurrent();
		const node = untrack(element);
		if (!node || signal?.aborted) return;
		let active = true;
		let observer;
		const cancel = () => {
			active = false;
			frame.cancel();
			observer?.disconnect();
			signal?.removeEventListener("abort", cancel);
		};
		cancelCurrent = cancel;
		signal?.addEventListener("abort", cancel, { once: true });
		const finish = (immediate = false) => {
			const deliver = () => {
				if (!active || signal?.aborted) return;
				cancel();
				untrack(callback);
			};
			if (immediate) deliver();
			else if (typeof input === "function" ? batch : input.batch) queueMicrotask(deliver);
			else enqueueCompletion(deliver);
		};
		if (typeof node.getAnimations !== "function" || globalThis.BASE_UI_ANIMATIONS_DISABLED) {
			finish(true);
			return;
		}
		const execute = () => {
			if (!active || signal?.aborted) return;
			Promise.all(getFiniteAnimations(node).map((animation) => animation.finished.then(() => void 0))).then(() => {
				if (active && !signal?.aborted) finish();
			}, () => {
				if (!active || signal?.aborted) return;
				if (getFiniteAnimations(node).some((animation) => animation.pending || animation.playState !== "finished")) execute();
				else finish();
			});
		};
		if (untrack(() => typeof input === "function" ? typeof wait === "function" ? wait() : wait : input.waitForStartingStyleRemoved?.() ?? false) && node.hasAttribute("data-starting-style")) {
			const Observer = node.ownerDocument.defaultView?.MutationObserver;
			if (Observer) {
				observer = new Observer(() => {
					if (!node.hasAttribute("data-starting-style")) {
						observer?.disconnect();
						execute();
					}
				});
				observer.observe(node, {
					attributes: true,
					attributeFilter: ["data-starting-style"]
				});
				return;
			}
		}
		frame.request(execute);
	};
	if (typeof input === "function") return run;
	createEffect(() => ({
		element: input.element(),
		enabled: input.enabled?.() ?? true,
		wait: input.waitForStartingStyleRemoved?.() ?? false
	}), (next) => {
		if (!next.enabled || !next.element) return;
		const controller = new AbortController();
		run(() => input.onFinished(), controller.signal);
		return () => controller.abort();
	});
}
//#endregion
//#region packages/solid/src/internals/createOpenChangeComplete.ts
function read(value, fallback) {
	return typeof value === "function" ? value() : value ?? fallback;
}
function createOpenChangeComplete(params) {
	const run = createAnimationsFinished(params.ref, () => read(params.open, false), params.batch);
	createEffect(() => ({
		enabled: read(params.enabled, true),
		open: read(params.open, false),
		element: params.ref()
	}), (next) => {
		if (!next.enabled || !next.element) return;
		const controller = new AbortController();
		run(() => {
			queueMicrotask(() => {
				if (controller.signal.aborted) return;
				const current = untrack(() => ({
					enabled: read(params.enabled, true),
					open: read(params.open, false),
					element: params.ref()
				}));
				if (!current.enabled || current.open !== next.open || current.element !== next.element) return;
				untrack(() => params.onComplete());
			});
		}, controller.signal);
		return () => controller.abort();
	});
}
//#endregion
//#region packages/solid/src/internals/TransitionStatusDataAttributes.ts
var startingStyle = "data-starting-style";
var endingStyle = "data-ending-style";
//#endregion
//#region packages/solid/src/internals/stateAttributesMapping.ts
var starting = { [startingStyle]: "" };
var ending = { [endingStyle]: "" };
var transitionStatusMapping = { transitionStatus: (value) => value === "starting" ? starting : value === "ending" ? ending : null };
//#endregion
//#region packages/solid/src/utils/createStableCallback.ts
/** Pass a getter of the current handler, e.g. () => props.onChange.
* Read at invocation, never captured by a relay effect. For imperative/event use.
*/
function createStableCallback(callback) {
	return (...args) => untrack(() => callback()?.(...args));
}
//#endregion
//#region packages/solid/src/avatar/image/createImageLoadingStatus.ts
/** A source-scoped probe; cache hits resolve in the same turn as request setup. */
function createImageLoadingStatus(src, options, enabled) {
	const state = createSignal("idle");
	const setStatus = state[1];
	const request = createMemo(() => ({
		enabled: enabled(),
		src: src(),
		srcSet: options.srcSet,
		sizes: options.sizes,
		crossOrigin: options.crossOrigin,
		referrerPolicy: options.referrerPolicy
	}), { equals: (a, b) => a.enabled === b.enabled && a.src === b.src && a.srcSet === b.srcSet && a.sizes === b.sizes && a.crossOrigin === b.crossOrigin && a.referrerPolicy === b.referrerPolicy });
	createEffect(request, (request) => {
		if (!request.enabled) return;
		if (!request.src && !request.srcSet) {
			setStatus("error");
			return;
		}
		let active = true;
		const image = new window.Image();
		const update = (status) => {
			if (active) setStatus(status);
		};
		setStatus("loading");
		image.onload = () => update("loaded");
		image.onerror = () => update("error");
		if (request.referrerPolicy) image.referrerPolicy = request.referrerPolicy;
		image.crossOrigin = typeof request.crossOrigin === "string" ? request.crossOrigin : null;
		if (request.sizes) image.sizes = request.sizes;
		if (request.srcSet) image.srcset = request.srcSet;
		if (request.src) image.src = request.src;
		if (image.complete) update(image.naturalWidth > 0 ? "loaded" : "error");
		return () => {
			active = false;
			image.onload = null;
			image.onerror = null;
		};
	});
	return state;
}
//#endregion
//#region packages/solid/src/avatar/image/AvatarImage.tsx
var stateAttributesMapping = {
	...avatarStateAttributesMapping,
	...transitionStatusMapping
};
/** The avatar image. Renders an `<img>` after preloading, or in place with keepMounted. */
function AvatarImage(componentProps) {
	const context = useAvatarRootContext();
	const requestOptions = {
		get srcSet() {
			return componentProps.srcSet !== void 0 ? componentProps.srcSet : componentProps.srcset;
		},
		get crossOrigin() {
			return componentProps.crossOrigin !== void 0 ? componentProps.crossOrigin : componentProps.crossorigin;
		},
		get referrerPolicy() {
			return componentProps.referrerPolicy !== void 0 ? componentProps.referrerPolicy : componentProps.referrerpolicy;
		},
		get sizes() {
			return componentProps.sizes;
		}
	};
	const [status, setStatus] = createImageLoadingStatus(() => typeof componentProps.src === "string" ? componentProps.src : void 0, requestOptions, () => !componentProps.keepMounted);
	const visible = () => status() === "loaded";
	const presence = createTransitionStatus(visible);
	const [image, setImage] = createSignal(null);
	let initialCommit = true;
	let disposed = false;
	onCleanup(() => {
		disposed = true;
		if (!isServer) context.setImageLoadingStatus("idle");
	});
	const renderedRequest = createMemo(() => ({
		keepMounted: componentProps.keepMounted,
		image: image(),
		src: componentProps.src,
		srcSet: requestOptions.srcSet,
		sizes: requestOptions.sizes,
		crossOrigin: requestOptions.crossOrigin,
		referrerPolicy: requestOptions.referrerPolicy,
		render: componentProps.render
	}), { equals: (a, b) => a.keepMounted === b.keepMounted && a.image === b.image && a.src === b.src && a.srcSet === b.srcSet && a.sizes === b.sizes && a.crossOrigin === b.crossOrigin && a.referrerPolicy === b.referrerPolicy && a.render === b.render });
	createEffect(renderedRequest, (request) => {
		if (!request.keepMounted) return;
		const node = request.image;
		if (!node) return;
		const isInitialCommit = initialCommit;
		initialCommit = false;
		const inspect = (initial) => {
			if (!node.complete) {
				setStatus("loading");
				return;
			}
			const next = node.naturalWidth > 0 ? "loaded" : "error";
			setStatus(next);
			if (next === "loaded" && initial) presence.setMounted(true);
		};
		inspect(isInitialCommit);
		const observer = new node.ownerDocument.defaultView.MutationObserver(() => inspect(false));
		observer.observe(node, {
			attributes: true,
			attributeFilter: [
				"src",
				"srcset",
				"sizes",
				"crossorigin",
				"referrerpolicy"
			]
		});
		return () => observer.disconnect();
	});
	const notifyLoadingStatus = createStableCallback(() => componentProps.onLoadingStatusChange);
	createEffect(status, (next) => {
		if (next !== "idle") {
			notifyLoadingStatus(next);
			context.setImageLoadingStatus(next);
		}
	});
	createOpenChangeComplete({
		get enabled() {
			return !visible();
		},
		get open() {
			return visible();
		},
		ref: image,
		onComplete() {
			if (!visible()) presence.setMounted(false);
		}
	});
	const state = {
		get imageLoadingStatus() {
			return status();
		},
		get transitionStatus() {
			const transition = presence.transitionStatus;
			return componentProps.keepMounted && transition === "ending" ? void 0 : transition;
		}
	};
	const elementProps = omit(componentProps, "class", "style", "render", "onLoadingStatusChange", "keepMounted", "sizes", "srcSet", "srcset", "src", "crossOrigin", "referrerPolicy");
	return createRenderElement("img", componentProps, {
		state,
		ref: setImage,
		get props() {
			const configuration = {};
			if ("crossOrigin" in componentProps || "crossorigin" in componentProps) configuration.crossorigin = requestOptions.crossOrigin;
			if ("referrerPolicy" in componentProps || "referrerpolicy" in componentProps) configuration.referrerpolicy = requestOptions.referrerPolicy;
			if ("aria-hidden" in componentProps) configuration["aria-hidden"] = componentProps["aria-hidden"] === false ? "false" : componentProps["aria-hidden"];
			const source = {};
			if (componentProps.sizes !== void 0) source.sizes = componentProps.sizes;
			if (requestOptions.srcSet !== void 0) source.srcset = requestOptions.srcSet;
			if (componentProps.src !== void 0) source.src = componentProps.src;
			return [
				componentProps.keepMounted ? {
					"data-loading": status() === "loading" ? "" : void 0,
					"data-error": status() === "error" ? "" : void 0,
					"aria-hidden": status() !== "loaded" ? "true" : void 0,
					onLoad() {
						if (!disposed) setStatus("loaded");
					},
					onError() {
						if (!disposed) setStatus("error");
					}
				} : void 0,
				elementProps,
				configuration,
				source
			];
		},
		stateAttributesMapping,
		get enabled() {
			return !!componentProps.keepMounted || presence.mounted;
		}
	});
}
//#endregion
//#region packages/solid/src/utils/createTimeout.ts
/** Imperative timeout. Derived from Base UI (MIT), pinned source in upstream/base-ui. */
var Timeout = class Timeout {
	static create() {
		return new Timeout();
	}
	currentId = 0;
	start(delay, fn) {
		this.clear();
		this.currentId = setTimeout(() => {
			this.currentId = 0;
			fn();
		}, delay);
	}
	isStarted() {
		return this.currentId !== 0;
	}
	clear = () => {
		if (this.currentId !== 0) {
			clearTimeout(this.currentId);
			this.currentId = 0;
		}
	};
	disposeEffect = () => this.clear;
};
/** Allocate during setup; cleanup also covers disposal before the first settle. */
function createTimeout() {
	const timeout = Timeout.create();
	onCleanup(timeout.clear);
	return timeout;
}
//#endregion
//#region packages/solid/src/avatar/fallback/AvatarFallback.tsx
/** Shown while the image is unavailable. Renders a `<span>`. */
function AvatarFallback(componentProps) {
	const context = useAvatarRootContext();
	const [delayPassed, setDelayPassed] = createSignal(untrack(() => (componentProps.delay ?? 0) === 0));
	const timeout = createTimeout();
	createEffect(() => componentProps.delay ?? 0, (delay) => {
		if (delay > 0) timeout.start(delay, () => {
			setDelayPassed(true);
		});
		else setDelayPassed(true);
		return timeout.clear;
	});
	return createRenderElement("span", componentProps, {
		state: { get imageLoadingStatus() {
			return context.imageLoadingStatus;
		} },
		props: omit(componentProps, "class", "style", "render", "delay"),
		stateAttributesMapping: avatarStateAttributesMapping,
		get enabled() {
			return context.imageLoadingStatus !== "loaded" && ((componentProps.delay ?? 0) === 0 || delayPassed());
		}
	});
}
//#endregion
//#region packages/solid/src/avatar/fixtures/imageSource.ts
var AVATAR_IMAGE_URL = "/packages/solid/src/avatar/fixtures/avatar.svg";
//#endregion
//#region packages/solid/src/avatar/fixtures/AvatarHydrationFixture.tsx
var _m$$1 = Symbol();
var _m$2 = Symbol();
var _d$$1 = {
	get() {
		return this[_m$$1].keepMounted;
	},
	enumerable: true,
	configurable: true
};
var _d$2 = {
	get() {
		return this[_m$$1].onLoadingStatusChange;
	},
	enumerable: true,
	configurable: true
};
function _P$$1(_p, _p2, _p3, _p4, _p5) {
	this[_m$$1] = _p;
	this.id = _p2;
	this["data-testid"] = _p3;
	Object.defineProperty(this, "keepMounted", _d$$1);
	this.src = _p4;
	this.alt = _p5;
	Object.defineProperty(this, "onLoadingStatusChange", _d$2);
}
_P$$1.prototype = Object.prototype;
var _d$3 = {
	get() {
		const props = this[_m$$1];
		const id = this[_m$2];
		return [AvatarImage(new _P$$1(props, `${id}-image`, "image", AVATAR_IMAGE_URL, "Jane Doe")), AvatarFallback({
			id: `${id}-fallback`,
			children: "JD"
		})];
	},
	enumerable: true,
	configurable: true
};
function _P$2(_p6, _p7, _p8, _p9) {
	this[_m$$1] = _p6;
	this[_m$2] = _p7;
	this.id = _p8;
	this["data-testid"] = _p9;
	Object.defineProperty(this, "children", _d$3);
}
_P$2.prototype = Object.prototype;
/** Compiled independently for server and browser by the qualification fixture. */
function AvatarHydrationFixture(props) {
	const id = createUniqueId();
	return AvatarRoot(new _P$2(props, id, id, "avatar-root"));
}
//#endregion
//#region packages/solid/src/avatar/fixtures/ssr.tsx
var _m$ = Symbol();
var _d$ = {
	get() {
		return this[_m$].keepMounted;
	},
	enumerable: true,
	configurable: true
};
function _P$(_p) {
	this[_m$] = _p;
	Object.defineProperty(this, "keepMounted", _d$);
}
_P$.prototype = Object.prototype;
/** Called only from an independently compiled server module, never the browser bundle. */
function renderFixture(options) {
	if (!isServer || typeof document !== "undefined") throw new Error("Avatar fixture requires independent server compilation");
	return {
		isServer,
		renderId: options.renderId,
		html: renderToString(() => AvatarHydrationFixture(new _P$(options)), { renderId: options.renderId }),
		bootstrap: generateHydrationScript({ eventNames: [] })
	};
}
//#endregion
//#region packages/solid/src/avatar/fixtures/emit.tsx
for (const keepMounted of [false, true]) {
	const renderId = keepMounted ? "avatar-kept" : "avatar-preloaded";
	process.stdout.write(JSON.stringify(renderFixture({
		renderId,
		keepMounted
	})) + "\n");
}
var $$moduleUrl = "packages/solid/src/avatar/fixtures/emit.tsx";
//#endregion
export { $$moduleUrl };
