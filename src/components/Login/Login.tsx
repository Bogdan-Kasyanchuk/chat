import { FC } from 'react';

import { loginUserEmail } from '@/service/firebaseEmailAuth';

import { Form } from '@/components';

const Login: FC = () => {
  return (
    <Form
      submitForm={(email: string, password: string) => {
        loginUserEmail(email, password);
      }}
      childrenButton='Login'
    />
  );
};

export default Login;
