import type { FC } from 'react';

import { joiResolver, useForm } from '@mantine/form';

import { loginUserEmail } from '@/service/firebase';
import { loginUserJoiSchema } from '@/service/joi';

import { Form } from '@/components';

const Login: FC = () => {
  const form = useForm({
    // validate: joiResolver(loginUserJoiSchema),
    // validateInputOnChange: true,
    // validateInputOnBlur: true,
    initialValues: {
      email: '',
      password: '',
    },
  });

  return <Form form={form} submitForm={loginUserEmail} childrenButton='Login' />;
};

export default Login;
