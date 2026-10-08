import type { Accessor, Context } from 'solid-js';
import type { JSX } from '@solidjs/web';

export type Cleanup = () => void;
/** Stable getter-backed view, not a snapshot or a deep reactive proxy. */
export type Live<T> = Readonly<T>;
/** Raw identity is retained. Allocate resources in setup, never in a ref callback. */
export type ElementAccessor<T extends Element = HTMLElement> = Accessor<T | null>;
/** Public RC.13 ref spelling, including assignment refs and ref arrays. */
export type NativeRef<T extends Element> = JSX.Ref<T>;
/** Imperative metadata only; do not use a cell to replace a reactive accessor. */
export interface MutableCell<T> { current: T }
export type TransitionStatus = 'starting' | 'ending' | 'idle' | undefined;
export type Orientation = 'horizontal' | 'vertical';
export type Direction = 'ltr' | 'rtl';
/** createContext<T>(); useContext throws without a provider. */
export type RequiredContext<T> = Context<T>;
/** createContext<T | null>(null); absence is deliberate, never caught-and-ignored. */
export type OptionalContext<T> = Context<T | null>;
export type Simplify<T> = T extends (...args: never[]) => unknown ? T : { [K in keyof T]: T[K] };
export type RequiredExcept<T, K extends keyof T> = Required<Omit<T, K>> & Pick<T, K>;

export interface NativeButtonProps { nativeButton?: boolean | undefined }
export interface NonNativeButtonProps { nativeButton?: boolean | undefined }
