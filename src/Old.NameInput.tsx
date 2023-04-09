import { IconUser } from '@tabler/icons-react';
import { FC } from 'react';

import { Box, TextInput } from '@mantine/core';
import { Flex } from '@mantine/core';
import { useForm } from '@mantine/form';

import { ButtonCustom } from '@/components';

const Register: FC = () => {
  const form = useForm({
    initialValues: {
      name: '',
    },
  });

  return (
    <Box
      component='form'
      onSubmit={form.onSubmit(({ name }) => {
        form.reset();
      })}
      h='100%'
    >
      <Flex gap={20} align='stretch' justify='center' direction='column' h='100%'>
        <TextInput
          size='lg'
          withAsterisk
          label='Name'
          placeholder='Your name'
          iconWidth={40}
          icon={<IconUser size={18} stroke={1.5} />}
          {...form.getInputProps('name')}
        />
        <ButtonCustom type='submit' variant='filled-grey' size='lg' uppercase>
          Register
        </ButtonCustom>
      </Flex>
    </Box>
  );
};

export default Register;
