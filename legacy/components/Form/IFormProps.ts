import type { UseFormReturnType } from '@mantine/form';

import type { ICredential } from '@/interfaces';

export default interface IFormProps {
  form: UseFormReturnType<any, (values: any) => any>;
  isRegister?: boolean;
  submitForm: ({ email, password }: ICredential) => void;
  childrenButton: string;
}
