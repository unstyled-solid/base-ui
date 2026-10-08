import type { ConformantComponentProps } from '../../test/describeConformance';

/** Harness handlers accept generic native targets; public handlers also expose Base UI cancellation. */
export type ToolbarConformanceProps<Props, State> = Props & ConformantComponentProps<State>;
