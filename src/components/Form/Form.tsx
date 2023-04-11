import type { FC } from 'react';

import { Box, PasswordInput, TextInput } from '@mantine/core';
import { Flex } from '@mantine/core';
import { useForm } from '@mantine/form';

import { IconAt, IconLock } from '@tabler/icons-react';

import { ButtonCustom } from '@/components';

import type { IFormProps } from '@/interfaces';

const Form: FC<IFormProps> = ({ submitForm, childrenButton }) => {
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
  });

  return (
    <Box
      component='form'
      w='fit-content'
      mx='auto'
      onSubmit={form.onSubmit(({ email, password }) => {
        submitForm(email, password);
        form.reset();
      })}
      h='100%'
    >
      <Flex gap={20} align='stretch' justify='center' direction='column' h='100%'>
        <TextInput
          type='email'
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
          {childrenButton}
        </ButtonCustom>
      </Flex>
    </Box>
  );
};

export default Form;
