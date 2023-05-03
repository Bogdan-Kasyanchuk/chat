import type { FC } from 'react';

import { joiResolver, useForm } from '@mantine/form';

import { registerUserEmail } from '@/service/firebase';
import { registerUserJoiSchema } from '@/service/joi';

import { Form } from '@/components';

const Register: FC = () => {
  const form = useForm({
    // validate: joiResolver(registerUserJoiSchema),
    // validateInputOnChange: true,
    // validateInputOnBlur: true,
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  return (
    <Form form={form} submitForm={registerUserEmail} isRegister childrenButton='Registration' />
  );
};

export default Register;
