import { IconAt, IconUser } from '@tabler/icons-react';
import { IconLock } from '@tabler/icons-react';
import { FC } from 'react';

import { Box, PasswordInput, TextInput } from '@mantine/core';
import { Flex } from '@mantine/core';
import { useForm } from '@mantine/form';

import { registerUserEmail } from '@/service/firebaseEmailAuth';

import { ButtonCustom } from '@/components';

const Register: FC = () => {
  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  return (
    <Box
      component='form'
      onSubmit={form.onSubmit(({ email, password }) => {
        registerUserEmail(email, password);
        form.reset();
      })}
      h='100%'
    >
      <Flex gap={20} align='center' justify='center' direction='column' h='100%'>
        <TextInput
          size='lg'
          withAsterisk
          label='Name'
          placeholder='Your name'
          iconWidth={40}
          icon={<IconUser size={18} stroke={1.5} />}
          {...form.getInputProps('name')}
        />
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
          Register
        </ButtonCustom>
      </Flex>
    </Box>
  );
};

export default Register;
