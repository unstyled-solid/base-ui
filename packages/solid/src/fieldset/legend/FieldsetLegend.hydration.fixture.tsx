import { Fieldset } from '../index';

// Shared source markup for independently compiled server/client hydration.
export function FieldsetLegendHydrationFixture() {
  return <Fieldset.Root data-testid="fieldset">
    <Fieldset.Legend data-testid="legend">Legend</Fieldset.Legend>
  </Fieldset.Root>;
}
