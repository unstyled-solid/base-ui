var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { createSignal, createUniqueId, onCleanup, onSettled, omit, For } from 'solid-js';
import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import type { JSX, ComponentProps } from '@solidjs/web';
import { Toolbar } from 'baseui-solid2/toolbar';
import { ToggleGroup } from 'baseui-solid2/toggle-group';
import { Toggle } from 'baseui-solid2/toggle';
import { Select } from 'baseui-solid2/select';
import styles from './index.module.css';

export default function ExampleToolbar() {
  return (
    <Toolbar.Root class={styles.Toolbar}>
      <ToggleGroup class={styles.Group} aria-label="Alignment">
        <Toolbar.Button
          render={(renderProps) => <Toggle {...renderProps}  />}
          aria-label="Align left"
          value="align-left"
          class={styles.Button}
        >
          Align Left
        </Toolbar.Button>
        <Toolbar.Button
          render={(renderProps) => <Toggle {...renderProps}  />}
          aria-label="Align right"
          value="align-right"
          class={styles.Button}
        >
          Align Right
        </Toolbar.Button>
      </ToggleGroup>
      <Toolbar.Separator class={styles.Separator} />
      <Toolbar.Group class={styles.Group} aria-label="Numerical format">
        <Toolbar.Button class={styles.Button} aria-label="Format as currency">
          $
        </Toolbar.Button>
        <Toolbar.Button class={styles.Button} aria-label="Format as percent">
          %
        </Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Separator class={styles.Separator} />
      <Select.Root defaultValue="Helvetica">
        <Toolbar.Button render={(renderProps) => <Select.Trigger {...renderProps}  />} class={styles.Button}>
          <Select.Value />
          <Select.Icon>
            <CaretUpDownIcon />
          </Select.Icon>
        </Toolbar.Button>
        <Select.Portal>
          <Select.Positioner
            class={styles.Positioner}
            sideOffset={4}
            alignItemWithTrigger={false}
          >
            <Select.Popup class={styles.Popup}>
              <Select.Item class={styles.Item} value="Helvetica">
                <Select.ItemIndicator class={styles.ItemIndicator}>
                  <CheckIcon />
                </Select.ItemIndicator>
                <Select.ItemText class={styles.ItemText}>Helvetica</Select.ItemText>
              </Select.Item>
              <Select.Item class={styles.Item} value="Arial">
                <Select.ItemIndicator class={styles.ItemIndicator}>
                  <CheckIcon />
                </Select.ItemIndicator>
                <Select.ItemText class={styles.ItemText}>Arial</Select.ItemText>
              </Select.Item>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
      <Toolbar.Separator class={styles.Separator} />
      <Toolbar.Link class={styles.Link} href="#">
        Edited 51m ago
      </Toolbar.Link>
    </Toolbar.Root>
  );
}

function CaretUpDownIcon(props: ComponentProps<'svg'>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      {...props}
      style={{ display: 'block', ...(typeof props.style === 'object' ? props.style : {}) }}
    >
      <path d="M11 10H5l3 3.5zm0-4H5l3-3.5z" />
    </svg>
  );
}

function CheckIcon(props: ComponentProps<'svg'>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      {...props}
      style={{ display: 'block', ...(typeof props.style === 'object' ? props.style : {}) }}
    >
      <path d="m2.5 8.5 4 4 7-9" />
    </svg>
  );
}
`;export{e as default};