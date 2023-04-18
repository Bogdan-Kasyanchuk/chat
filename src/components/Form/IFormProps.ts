import type { ICredential } from '@/interfaces';

export default interface IFormProps {
  submitForm: (email: ICredential['password'], password: ICredential['password']) => void;
  childrenButton: string;
}
