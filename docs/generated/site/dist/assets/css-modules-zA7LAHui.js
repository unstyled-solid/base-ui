var e=`import { createSignal } from 'solid-js';
import { Field } from 'baseui-solid2/field';
import { Form } from 'baseui-solid2/form';
import { Button } from 'baseui-solid2/button';
import styles from './index.module.css';

interface FormState {
  serverErrors?: Form.Props['errors'];
}

export default function ActionStateForm() {
  const [state, setState] = createSignal<FormState>({});
  const [loading, setLoading] = createSignal(false);
  let pending = false;

  return (
    <Form
      errors={state().serverErrors}
      onSubmit={async (event) => {
        event.preventDefault();
        if (pending) return;
        const form = event.currentTarget;
        const formData = new FormData(form);
        pending = true;
        setLoading(true);
        try {
          const nextState = await submitForm(state(), formData);
          setState(nextState);
          // Explicitly reset native form fields after the simulated response resolves.
          form.reset();
        } finally {
          pending = false;
          setLoading(false);
        }
      }}
      class={styles.Form}
    >
      <Field.Root name="username" class={styles.Field}>
        <Field.Label class={styles.Label}>Username</Field.Label>
        <Field.Control
          type="text"
          autocomplete="username"
          required
          defaultValue="admin"
          placeholder="e.g. alice132"
          class={styles.Input}
        />
        <Field.Error class={styles.Error} />
      </Field.Root>
      <Button type="submit" disabled={loading()} focusableWhenDisabled class={styles.Button}>
        Submit
      </Button>
    </Form>
  );
}

// Called by the native submit handler; validation runs locally, without a network request.
async function submitForm(_previousState: FormState, formData: FormData) {
  // Simulate an asynchronous server response with a one-second delay.
  await new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });

  try {
    const username = formData.get('username') as string | null;

    if (username === 'admin') {
      return { success: false, serverErrors: { username: "'admin' is reserved for system use" } };
    }

    // 50% chance the username is taken
    const success = Math.random() > 0.5;

    if (!success) {
      return {
        serverErrors: { username: \`\${username} is unavailable\` },
      };
    }
  } catch {
    return { serverErrors: { username: 'A server error has occurred' } };
  }

  return {};
}
`;export{e as default};