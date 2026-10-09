var e=`import { createSignal } from 'solid-js';
import { Field } from 'baseui-solid2/field';
import { Form } from 'baseui-solid2/form';
import { Button } from 'baseui-solid2/button';

interface FormState {
  serverErrors?: Form.Props['errors'];
}

export default function ActionStateForm() {
  const [state, setState] = createSignal<FormState>({});
  const [loading, setLoading] = createSignal(false);
  let pending = false;

  return (
    <Form
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
      errors={state().serverErrors}
      class="flex w-full max-w-64 flex-col gap-4"
    >
      <Field.Root name="username" class="flex flex-col items-start gap-1">
        <Field.Label class="text-sm font-bold text-neutral-950 dark:text-white">
          Username
        </Field.Label>
        <Field.Control
          type="text"
          autocomplete="username"
          required
          defaultValue="admin"
          placeholder="e.g. alice132"
          class="h-8 w-full border border-neutral-950 bg-white dark:bg-neutral-950 px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 placeholder:text-neutral-500 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white dark:placeholder:text-neutral-400"
        />
        <Field.Error class="text-sm text-red-700 dark:text-red-400" />
      </Field.Root>
      <Button
        type="submit"
        disabled={loading()}
        focusableWhenDisabled
        class="flex h-8 items-center justify-center gap-2 rounded-none border border-neutral-950 bg-white px-3 text-sm leading-none whitespace-nowrap font-normal text-neutral-950 select-none hover:not-data-disabled:bg-neutral-100 active:not-data-disabled:bg-neutral-200 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-neutral-950 dark:focus-visible:outline-white data-disabled:border-neutral-500 data-disabled:text-neutral-500 disabled:border-neutral-500 disabled:text-neutral-500 dark:border-white dark:bg-neutral-950 dark:text-white dark:hover:not-data-disabled:bg-neutral-800 dark:active:not-data-disabled:bg-neutral-700 dark:data-disabled:border-neutral-400 dark:data-disabled:text-neutral-400"
      >
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