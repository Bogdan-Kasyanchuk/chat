import { IconAt } from '@tabler/icons-react';
import { IconLock } from '@tabler/icons-react';
import { FC } from 'react';

import { Box, PasswordInput, TextInput } from '@mantine/core';
import { Flex } from '@mantine/core';
import { useForm } from '@mantine/form';

import { loginUserEmail } from '@/service/firebaseEmailAuth';

import { ButtonCustom } from '@/components';

const Login: FC = () => {
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
  });

  return (
    <Box
      component='form'
      onSubmit={form.onSubmit(({ email, password }) => {
        loginUserEmail(email, password);
        form.reset();
      })}
      h='100%'
    >
      <Flex gap={20} align='stretch' justify='center' direction='column' h='100%'>
        <TextInput
          size='lg'
          withAsterisk
          label='Email'
          placeholder='Your email'
          iconWidth={40}
          icon={<IconAt size={18} stroke={1.5} />}
          {...form.getInputProps('email')}
        />
        <PasswordInput
          w='100%'
          size='lg'
          label='Password'
          placeholder='Your password'
          iconWidth={40}
          icon={<IconLock size={18} stroke={1.5} />}
          {...form.getInputProps('password')}
        />
        <ButtonCustom type='submit' variant='filled-grey' size='lg' uppercase>
          Login
        </ButtonCustom>
      </Flex>
    </Box>
  );
};

export default Login;
