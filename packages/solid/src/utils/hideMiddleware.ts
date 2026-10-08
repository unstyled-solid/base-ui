import { detectOverflow, type Middleware } from '@floating-ui/dom';
export const hide: Middleware = {
  name: 'hide',
  async fn(state) {
    const { width, height, x, y } = state.rects.reference;
    const overflow = await detectOverflow(state, { elementContext: 'reference' });
    return { data: { referenceHidden: (width === 0 && height === 0 && x === 0 && y === 0) || overflow.top - height >= 0 || overflow.right - width >= 0 || overflow.bottom - height >= 0 || overflow.left - width >= 0 } };
  },
};
