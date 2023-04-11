import type { FC } from 'react';

import { registerUserEmail } from '@/service/firebase';

import { Form } from '@/components';

import { ICredential } from '@/interfaces';

const Register: FC = () => {
  return (
    <Form
      submitForm={(email: ICredential['email'], password: ICredential['email']) => {
        registerUserEmail(email, password);
      }}
      childrenButton='Register'
    />
  );
};

export default Register;
