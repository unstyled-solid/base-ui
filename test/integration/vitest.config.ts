import { defineConfig, mergeConfig } from 'vitest/config';
import shared from '../../vitest.config.ts';

// Use the actual harness/compiler/diagnostic setup while the setup owner wires
// this directory into the default command. No parallel browser-global setup.
export default mergeConfig(shared, defineConfig({ test: {
  include: process.env.HARNESS_TARGET === 'ssr'
    ? ['test/integration/**/*.ssr.test.{ts,tsx}']
    : ['test/integration/**/*.test.{ts,tsx}'],
} }));
