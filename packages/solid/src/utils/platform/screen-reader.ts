import { os } from './os';
/** Platform eligibility only; actual screen reader activation cannot be detected. */
export const screenReader = { get voiceOver() { return os.apple; } };
