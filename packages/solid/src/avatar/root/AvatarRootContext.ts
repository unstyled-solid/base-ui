import { createContext, useContext, type Accessor } from 'solid-js';
import type { ImageLoadingStatus } from './AvatarRoot';

export interface AvatarRootContext {
  readonly imageLoadingStatus: ImageLoadingStatus;
  registerImage(status: Accessor<ImageLoadingStatus>): { activate(): void; dispose(): void };
}

export const AvatarRootContext = createContext<AvatarRootContext>();
export function useAvatarRootContext() {
  return useContext(AvatarRootContext);
}
