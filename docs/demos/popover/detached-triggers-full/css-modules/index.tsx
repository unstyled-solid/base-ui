import type { Component } from 'solid-js';
import { Dynamic } from '@solidjs/web';
import { Popover } from 'baseui-solid2/popover';
import { Avatar } from 'baseui-solid2/avatar';
import baseStyles from '../../_index.module.css';
import styles from './index.module.css';



export default function PopoverDetachedTriggersFullDemo() {
const demoPopover = Popover.createHandle<Component>();

  return (
    <div class={styles.Container}>
      <Popover.Trigger
        class={baseStyles.Button}
        handle={demoPopover}
        payload={NotificationsPanel}
      >
        Notifications
      </Popover.Trigger>

      <Popover.Trigger class={baseStyles.Button} handle={demoPopover} payload={ActivityPanel}>
        Activity
      </Popover.Trigger>

      <Popover.Trigger class={baseStyles.Button} handle={demoPopover} payload={ProfilePanel}>
        Profile
      </Popover.Trigger>

      <Popover.Root handle={demoPopover}>
        {(demoState) => (
          <Popover.Portal>
            <Popover.Positioner sideOffset={8} class={styles.Positioner}>
              <Popover.Popup class={styles.Popup}>
                <Popover.Arrow class={styles.Arrow} />

                <Popover.Viewport class={styles.Viewport}>
                  {demoState.payload !== undefined && <Dynamic component={demoState.payload} />}
                </Popover.Viewport>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        )}
      </Popover.Root>
    </div>
  );
}

function NotificationsPanel() {
  return (
    <div class={styles.Stack}>
      <Popover.Title class={styles.Title}>Notifications</Popover.Title>
      <Popover.Description class={styles.Description}>
        You are all caught up. Good job!
      </Popover.Description>
    </div>
  );
}

function ProfilePanel() {
  return (
    <div class={styles.ProfilePanel}>
      <Popover.Title class={styles.Title}>Jason Eventon</Popover.Title>
      <Avatar.Root class={styles.Avatar}>
        <Avatar.Image
          src="https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=128&h=128&dpr=2&q=80"
          width="48"
          height="48"
          class={styles.AvatarImage}
        />
      </Avatar.Root>
      <span class={styles.Plan}>Pro plan</span>
      <div class={styles.ProfileActions}>
        <a href="#">Profile settings</a>
        <a href="#">Log out</a>
      </div>
    </div>
  );
}

function ActivityPanel() {
  return (
    <div class={styles.Stack}>
      <Popover.Title class={styles.Title}>Activity</Popover.Title>
      <Popover.Description class={styles.Description}>
        Nothing interesting happened recently.
      </Popover.Description>
    </div>
  );
}
