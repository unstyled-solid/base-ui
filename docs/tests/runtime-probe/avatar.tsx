import { render } from '@solidjs/web';
import { Avatar } from 'baseui-solid2/avatar';

/** Real library parts, mounted directly without docs runtime or a demo loader. */
export function mountAvatarProbe(host: HTMLElement) {
  return render(() => <Avatar.Root>
    <Avatar.Image src="data:image/png;base64,invalid" />
    <Avatar.Fallback>LT</Avatar.Fallback>
  </Avatar.Root>, host);
}
