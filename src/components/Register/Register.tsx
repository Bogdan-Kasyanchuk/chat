import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { Center, Flex } from '@mantine/core';
import { joiResolver, useForm } from '@mantine/form';

import { registerUserEmail } from '@/service/firebase';
import { registerUserJoiSchema } from '@/service/joi';

import { Button, Form } from '@/components';

const Register: FC = () => {
  const navigate = useNavigate();
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
    <Center h='100%'>
      <Flex
        gap={40}
        p={20}
        direction='column'
        maw={360}
        bg='white'
        w='100%'
        sx={{ boxShadow: '0px 4px 5px 2px rgba(18, 18, 18, 0.35)' }}
      >
        <Form form={form} submitForm={registerUserEmail} isRegister childrenButton='Registration' />
        <Button
          type='button'
          variant='outline'
          size='lg'
          uppercase
          color='dark.5'
          onClick={() => {
            navigate('/');
          }}
        >
          Back to home page
        </Button>
      </Flex>
    </Center>
  );
};

export default Register;
