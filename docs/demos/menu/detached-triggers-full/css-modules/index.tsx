// Adapted from Base UI (MIT), source SHA 19511bb171f3b360b006c94cf6d07e53cb446505.
import type { ComponentProps } from '@solidjs/web';
import { Menu } from 'baseui-solid2/menu';
import styles from '../../_index.module.css';
import transitionStyles from './index.module.css';

type MenuContent = {
  heading: string;
  groups: string[][];
};

const MENUS = {
  library: {
    heading: 'Library',
    groups: [
      ['Add to library', 'Add to favorites'],
      ['Create playlist', 'Create station'],
    ],
  },
  playback: {
    heading: 'Playback',
    groups: [
      ['Play now', 'Add to queue'],
      ['Play next', 'Play last', 'Sleep timer'],
    ],
  },
  share: {
    heading: 'Share',
    groups: [
      ['Copy link', 'Copy embed code'],
      ['Share to contacts', 'Share to social'],
    ],
  },
} as const satisfies Record<string, MenuContent>;

type MenuKey = keyof typeof MENUS;


export default function MenuDetachedTriggersFullDemo() {
  const demoMenu = Menu.createHandle<MenuKey>();
  return (
    <div class={styles.Container}>
      <Menu.Trigger class={styles.Button} handle={demoMenu} payload="library">
        Library
      </Menu.Trigger>
      <Menu.Trigger class={styles.Button} handle={demoMenu} payload="playback">
        Playback
      </Menu.Trigger>
      <Menu.Trigger class={styles.Button} handle={demoMenu} payload="share">
        Share
      </Menu.Trigger>

      <Menu.Root handle={demoMenu} modal={false}>
        {(state) => (
          <Menu.Portal>
            <Menu.Positioner
              sideOffset={8}
              align="start"
              class={`${styles.Positioner} ${transitionStyles.Positioner}`}
            >
              <Menu.Popup class={`${styles.Popup} ${transitionStyles.Popup}`}>
                <Menu.Viewport class={transitionStyles.Viewport}>
                  {state.payload &&
                    MENUS[state.payload].groups.map((group, groupIndex) => (
                      <>
                        <Menu.Group>
                          {groupIndex === 0 && (
                            <Menu.GroupLabel class={styles.Label}>
                              {state.payload && MENUS[state.payload].heading}
                            </Menu.GroupLabel>
                          )}
                          {group.map((item) => (
                            <Menu.Item class={styles.Item}>
                              {item}
                            </Menu.Item>
                          ))}
                        </Menu.Group>
                        {state.payload && groupIndex < MENUS[state.payload].groups.length - 1 && (
                          <Menu.Separator class={styles.Separator} />
                        )}
                      </>
                    ))}
                </Menu.Viewport>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        )}
      </Menu.Root>
    </div>
  );
}
