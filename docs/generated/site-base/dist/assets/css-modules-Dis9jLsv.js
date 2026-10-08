var e=`// Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT.
import { useRender } from 'baseui-solid2/use-render';
import { mergeProps } from 'baseui-solid2/merge-props';
import styles from './index.module.css';

interface TextProps extends useRender.ComponentProps<'p'> {}
function Text(props: TextProps) {
  return useRender({
    defaultTagName: 'p',
    get render() { return props.render; },
    props: () => mergeProps<'p'>({ class: styles.Text }, props),
  });
}
export default function ExampleText() {
  return <div>
    <Text>Text component rendered as a paragraph tag</Text>
    <Text render={(props) => <strong {...props} />}>Text component rendered as a strong tag</Text>
  </div>;
}
`;export{e as default};