import { Form, type FormActions, type FormProps, type FormValidationMode } from './index';

const mode: Form.ValidationMode = 'onSubmit' satisfies FormValidationMode;
const values: Form.Values<{ otp: string }> = { otp: '123456' };
const validate = (actions: Form.Actions | null) => actions?.validate('otp');
const actions: FormActions = { validate() {} };
const props: FormProps<typeof values> = {
  validationMode: mode,
  noValidate: false,
  actionsRef: validate,
  onFormSubmit(next, details) {
    const otp: string = next.otp;
    const event: Event = details.event;
    const reason: Form.SubmitEventReason = details.reason;
    void [otp, event, reason];
  },
};
export const formConsumer = <Form {...props} />;
interface Values { name: string; age: number }
export const sourceGenericConsumer = <Form<Values> onFormSubmit={(next) => {
  const name: string = next.name;
  const age: number = next.age;
  // @ts-expect-error Unknown fields must not be accepted by the generic API.
  next.email.startsWith('a');
  void [name, age];
}} />;
export const sourceRenderConsumer = <Form render={(native) => {
  const noValidate: boolean | undefined = native.noValidate;
  void noValidate;
  return <form {...native} />;
}} />;
void actions;
