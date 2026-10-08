import { describe } from 'vitest';
import { createSignal } from 'solid-js';
import { describeConformance } from '../../test';
import type { ConformantComponentProps } from '../../test/describeConformance';
import { Combobox } from './index';

// The generated host/event/ref cases correspond to each pinned small-part
// describeConformance suite; factories retain live props and native Solid refs.
describe('Combobox source part conformance', () => {
  describe('Input', () => describeConformance<Combobox.Input.State, Combobox.Input.Props & ConformantComponentProps<Combobox.Input.State>>(
    (props) => <Combobox.Root><Combobox.Input {...props} /></Combobox.Root>, { initialProps: {}, refInstanceof: HTMLInputElement, testRenderPropWith: 'input' }));
  describe('InputGroup', () => describeConformance<Combobox.InputGroup.State, Combobox.InputGroup.Props & ConformantComponentProps<Combobox.InputGroup.State>>(
    (props) => <Combobox.Root><Combobox.InputGroup {...props} /></Combobox.Root>, { initialProps: {}, refInstanceof: HTMLDivElement }));
  describe('Trigger', () => describeConformance<Combobox.Trigger.State, Combobox.Trigger.Props & ConformantComponentProps<Combobox.Trigger.State>>(
    (props) => <Combobox.Root open={false}><Combobox.Trigger {...props} /></Combobox.Root>, { initialProps: {}, refInstanceof: HTMLButtonElement, button: true }));
  describe('Clear', () => describeConformance<Combobox.Clear.State, Combobox.Clear.Props & ConformantComponentProps<Combobox.Clear.State>>(
    (props) => <Combobox.Root value="apple"><Combobox.Clear {...props} /></Combobox.Root>, { initialProps: {}, refInstanceof: HTMLButtonElement, button: true }));
  describe('List', () => describeConformance<Combobox.List.State, Combobox.List.Props & ConformantComponentProps<Combobox.List.State>>(
    (props) => <Combobox.Root open><Combobox.List {...props} /></Combobox.Root>, { initialProps: {}, refInstanceof: HTMLDivElement }));
  describe('Item', () => describeConformance<Combobox.Item.State, Combobox.Item.Props & ConformantComponentProps<Combobox.Item.State>>(
    (props) => <Combobox.Root open><Combobox.List><Combobox.Item {...props} /></Combobox.List></Combobox.Root>, { initialProps: {}, refInstanceof: HTMLDivElement, button: true }));
  describe('ItemIndicator', () => describeConformance<Combobox.ItemIndicator.State, Combobox.ItemIndicator.Props & ConformantComponentProps<Combobox.ItemIndicator.State>>(
    (props) => <Combobox.Root open value="apple"><Combobox.List><Combobox.Item value="apple"><Combobox.ItemIndicator {...props} /></Combobox.Item></Combobox.List></Combobox.Root>, { initialProps: {}, refInstanceof: HTMLSpanElement }));
  describe('Group', () => describeConformance<Combobox.Group.State, Combobox.Group.Props & ConformantComponentProps<Combobox.Group.State>>(
    (props) => <Combobox.Root><Combobox.Group {...props} /></Combobox.Root>, { initialProps: {}, refInstanceof: HTMLDivElement }));
  describe('GroupLabel', () => describeConformance<Combobox.GroupLabel.State, Combobox.GroupLabel.Props & ConformantComponentProps<Combobox.GroupLabel.State>>(
    (props) => <Combobox.Root><Combobox.Group><Combobox.GroupLabel {...props} /></Combobox.Group></Combobox.Root>, { initialProps: {}, refInstanceof: HTMLDivElement }));
  describe('Row', () => describeConformance<Combobox.Row.State, Combobox.Row.Props & ConformantComponentProps<Combobox.Row.State>>(
    (props) => <Combobox.Root grid><Combobox.Row {...props} /></Combobox.Root>, { initialProps: {}, refInstanceof: HTMLDivElement }));
  describe('Chips', () => describeConformance<Combobox.Chips.State, Combobox.Chips.Props & ConformantComponentProps<Combobox.Chips.State>>(
    (props) => <Combobox.Root multiple><Combobox.Chips {...props} /></Combobox.Root>, { initialProps: {}, refInstanceof: HTMLDivElement }));
  describe('Chip', () => describeConformance<Combobox.Chip.State, Combobox.Chip.Props & ConformantComponentProps<Combobox.Chip.State>>(
    (props) => <Combobox.Root multiple><Combobox.Chips><Combobox.Chip {...props} /></Combobox.Chips></Combobox.Root>, { initialProps: {}, refInstanceof: HTMLDivElement }));
  describe('ChipRemove', () => describeConformance<Combobox.ChipRemove.State, Combobox.ChipRemove.Props & ConformantComponentProps<Combobox.ChipRemove.State>>(
    (props) => <Combobox.Root multiple value={['apple']}><Combobox.Chips><Combobox.Chip><Combobox.ChipRemove {...props} /></Combobox.Chip></Combobox.Chips></Combobox.Root>, { initialProps: {}, refInstanceof: HTMLButtonElement, button: true }));
  describe('Popup', () => describeConformance<Combobox.Popup.State, Combobox.Popup.Props & ConformantComponentProps<Combobox.Popup.State>>(
    (props) => <Combobox.Root open><Combobox.Positioner><Combobox.Popup {...props} /></Combobox.Positioner></Combobox.Root>, { initialProps: {}, refInstanceof: HTMLDivElement }));
  describe('Positioner', () => describeConformance<Combobox.Positioner.State, Combobox.Positioner.Props & ConformantComponentProps<Combobox.Positioner.State>>(
    (props) => <Combobox.Root open><Combobox.Positioner {...props} /></Combobox.Root>, { initialProps: {}, refInstanceof: HTMLDivElement }));
  describe('Arrow', () => describeConformance<Combobox.Arrow.State, Combobox.Arrow.Props & ConformantComponentProps<Combobox.Arrow.State>>(
    (props) => <Combobox.Root open><Combobox.Positioner><Combobox.Arrow {...props} /></Combobox.Positioner></Combobox.Root>, { initialProps: {}, refInstanceof: HTMLDivElement }));
  describe('Backdrop', () => describeConformance<Combobox.Backdrop.State, Combobox.Backdrop.Props & ConformantComponentProps<Combobox.Backdrop.State>>(
    (props) => <Combobox.Root open><Combobox.Backdrop {...props} /></Combobox.Root>, { initialProps: {}, refInstanceof: HTMLDivElement }));
  describe('Icon', () => describeConformance<Combobox.Icon.State, Combobox.Icon.Props & ConformantComponentProps<Combobox.Icon.State>>(
    (props) => <Combobox.Root><Combobox.Icon {...props} /></Combobox.Root>, { initialProps: {}, refInstanceof: HTMLSpanElement }));
  describe('Status', () => describeConformance<Combobox.Status.State, Combobox.Status.Props & ConformantComponentProps<Combobox.Status.State>>(
    (props) => <Combobox.Status {...props} />, { initialProps: {}, refInstanceof: HTMLDivElement }));
  describe('Empty', () => describeConformance<Combobox.Empty.State, Combobox.Empty.Props & ConformantComponentProps<Combobox.Empty.State>>(
    (props) => <Combobox.Root items={[]}><Combobox.Empty {...props} /></Combobox.Root>, { initialProps: {}, refInstanceof: HTMLDivElement }));
  describe('Label', () => describeConformance<Combobox.Label.State, Combobox.Label.Props & ConformantComponentProps<Combobox.Label.State>>(
    (props) => <Combobox.Root><Combobox.Label {...props} /><Combobox.Trigger /></Combobox.Root>, { initialProps: {}, refInstanceof: HTMLDivElement }));
  describe('Portal', () => describeConformance<Combobox.Portal.State, Combobox.Portal.Props & ConformantComponentProps<Combobox.Portal.State>>(
    (props) => {
      const [target, setTarget] = createSignal<HTMLDivElement | null>(null);
      return <><div ref={setTarget} /><Combobox.Root open><Combobox.Portal {...props} container={target} /></Combobox.Root></>;
    }, { initialProps: {}, refInstanceof: HTMLDivElement }));
  describe('Separator', () => describeConformance<Combobox.Separator.State, Combobox.Separator.Props & ConformantComponentProps<Combobox.Separator.State>>(
    (props) => <Combobox.Separator {...props} />, { initialProps: {}, refInstanceof: HTMLDivElement }));
});
