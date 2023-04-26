import type { FC } from 'react';

import { Box, Flex, PasswordInput, TextInput } from '@mantine/core';

import { IconAt, IconLock } from '@tabler/icons-react';

import { TITLE_FORM } from '@/helpers';

import { Button } from '@/components';

import type IFormProps from './IFormProps';

const Form: FC<IFormProps> = ({ form, submitForm, isRegister, childrenButton }) => {
  return (
    <Box
      noValidate
      component='form'
      w='fit-content'
      mx='auto'
      onSubmit={form.onSubmit(({ email, password }) => {
        submitForm({ email, password });
        form.reset();
      })}
      h='100%'
    >
      <Flex gap={20} align='stretch' justify='center' direction='column' h='100%'>
        <TextInput
          title={TITLE_FORM.EMAIL}
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
          title={TITLE_FORM.PASSWORD}
          w='100%'
          size='lg'
          withAsterisk
          label='Password'
          placeholder='Your password'
          iconWidth={40}
          icon={<IconLock size={18} stroke={1.5} />}
          {...form.getInputProps('password')}
        />
        {isRegister && (
          <PasswordInput
            title={TITLE_FORM.PASSWORD}
            w='100%'
            size='lg'
            withAsterisk
            label='Confirm password'
            placeholder='Your confirm password'
            iconWidth={40}
            icon={<IconLock size={18} stroke={1.5} />}
            {...form.getInputProps('confirmPassword')}
          />
        )}
        <Button type='submit' variant='filled-grey' size='lg' uppercase>
          {childrenButton}
        </Button>
      </Flex>
    </Box>
  );
};

export default Form;
