import { expectType } from '../../test';
import { RadioGroup } from './RadioGroup';
import { Radio } from '../radio';

const strings = ['a', 'b', 'c'];
<RadioGroup value={strings[0]} onValueChange={(value) => expectType<string, typeof value>(value)} />;
const choices = ['a', 'b', 'c'] as const;
type Choice = typeof choices[number];
const index: number = 0;
<RadioGroup value={choices[index]} onValueChange={(value) => expectType<Choice, typeof value>(value)} />;
<RadioGroup defaultValue={choices[index]} onValueChange={(value) => expectType<Choice, typeof value>(value)} />;
<RadioGroup<Choice> value={choices[index]} onValueChange={(value) => expectType<Choice, typeof value>(value)} />;
<RadioGroup<string | null> onValueChange={(value) => expectType<string | null, typeof value>(value)} />;
<RadioGroup value={null} onValueChange={(value) => expectType<null, typeof value>(value)} />;
<RadioGroup defaultValue={null} onValueChange={(value) => expectType<null, typeof value>(value)} />;
<Radio.Root value={{ id: 1 }} class={(state) => [state.checked && 'checked', { disabled: state.disabled }]} />;
<Radio.Root value="a" />;
<Radio.Root value={1} />;
<Radio.Root value={null} />;
<Radio.Root<string | null> value={null} />;
// @ts-expect-error value must match the explicit generic type
<Radio.Root<'a' | 'b'> value="c" />;
// @ts-expect-error an identifying value is required
<Radio.Root />;
// @ts-expect-error typed group values cannot be numbers
<RadioGroup<Choice> value={42} />;
