import type { FC } from 'react';

import { loginUserEmail } from '@/service/firebase';

import { Form } from '@/components';

import { ICredential } from '@/interfaces';

const Login: FC = () => {
  return (
    <Form
      submitForm={(email: ICredential['email'], password: ICredential['email']) => {
        loginUserEmail(email, password);
      }}
      childrenButton='Login'
    />
  );
};

export default Login;
