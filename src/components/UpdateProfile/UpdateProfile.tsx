import type { FC } from 'react';

import { Box, Group, Modal, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

import { IconUser } from '@tabler/icons-react';

import { updateUser } from '@/service/firebase';

import { Button } from '@/components';

import type IUpdateProfileProps from './IUpdateProfileProps';
import useStyles from './UpdateProfile.styles';

const UpdateProfile: FC<IUpdateProfileProps> = ({ idUser, isOpened, onClose }) => {
  const { classes: c } = useStyles();
  const form = useForm({
    initialValues: {
      name: '',
    },
  });

  return (
    <Modal
      title='Update profile'
      opened={isOpened}
      onClose={onClose}
      centered
      classNames={{ title: c.title, close: c.closeButton }}
    >
      <Box
        component='form'
        onSubmit={form.onSubmit(({ name }) => {
          updateUser(idUser, {
            name,
            avatar: 'https://i.stack.imgur.com/kpHGQ.jpg?s=64&g=1',
          });
          onClose();
          form.reset();
        })}
      >
        <TextInput
          type='text'
          size='md'
          label='Name'
          placeholder='Your name'
          iconWidth={40}
          icon={<IconUser size={16} stroke={1.5} />}
          {...form.getInputProps('name')}
        />
        <Group position='center' spacing={50} mt={30}>
          <Button type='submit' variant='filled-grey' size='md' uppercase>
            Ok
          </Button>
          <Button type='button' variant='filled-grey' size='md' uppercase onClick={onClose}>
            Cancel
          </Button>
        </Group>
      </Box>
    </Modal>
  );
};

export default UpdateProfile;
