import { FC } from 'react';

import { registerUserEmail } from '@/service/firebaseEmailAuth';

import { Form } from '@/components';

const Register: FC = () => {
  return (
    <Form
      submitForm={(email: string, password: string) => {
        registerUserEmail(email, password);
      }}
      childrenButton='Register'
    />
  );
};

export default Register;
