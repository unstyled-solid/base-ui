import type { JSX } from '@solidjs/web';
import type { TransitionStatus } from './contracts/core';
import { DISABLED_TRANSITIONS_STYLE } from './constants';
export function getDisabledMountTransitionStyles(status: TransitionStatus): { style?: JSX.CSSProperties } { return status === 'starting' ? DISABLED_TRANSITIONS_STYLE : {}; }
