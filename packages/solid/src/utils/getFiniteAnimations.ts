/** Infinite animations cannot participate in completion. Base UI, MIT. */
export function getFiniteAnimations(element: Element, options?: GetAnimationsOptions): Animation[] {
  return element.getAnimations(options).filter((animation) => {
    const timing = animation.effect?.getTiming();
    return timing?.duration !== Infinity && timing?.iterations !== Infinity;
  });
}
