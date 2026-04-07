import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { Center, Flex } from '@mantine/core';
import { joiResolver, useForm } from '@mantine/form';

import { loginUserEmail } from '@/service/firebase';
import { loginUserJoiSchema } from '@/service/joi';

import { Button, Form } from '@/components';

const Login: FC = () => {
  const navigate = useNavigate();
  const form = useForm({
    // validate: joiResolver(loginUserJoiSchema),
    // validateInputOnChange: true,
    // validateInputOnBlur: true,
    initialValues: {
      email: '',
      password: '',
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
        <Form form={form} submitForm={loginUserEmail} childrenButton='Login' />
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

export default Login;
