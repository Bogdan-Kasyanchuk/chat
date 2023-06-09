import type { FC } from 'react';
import { useRef, useState } from 'react';

import { Avatar, Box, FileButton, Flex, Group, Modal, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

import { IconUser } from '@tabler/icons-react';

import { cloudinaryImageUpload } from '@/service/cloudinary';
import { updateUser } from '@/service/firebase';

import { Button } from '@/components';

import type IUpdateProfileProps from './IUpdateProfileProps';
import useStyles from './UpdateProfile.styles';

const UpdateProfile: FC<IUpdateProfileProps> = ({ idUser, avatar, isOpened, onClose }) => {
  const { classes: c } = useStyles();
  const [loadAvatar, setLoadAvatar] = useState<null | File>(null);
  const [isLoadAvatar, setIsLoadAvatar] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | ArrayBuffer | null>(null);
  const form = useForm({
    initialValues: {
      name: '',
    },
  });

  const hundlerPreviewAvatar = (file: File) => {
    let reader = new FileReader();
    reader.onload = () => {
      setPreviewAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const updateCredentials = async (name: string) => {
    let url = '';
    if (loadAvatar) {
      setIsLoadAvatar(true);
      url = await cloudinaryImageUpload(loadAvatar as File);
      setIsLoadAvatar(false);
    }
    updateUser(idUser, {
      name,
      avatar: url,
    });
    onClose();
    setPreviewAvatar(null);
    setLoadAvatar(null);
    form.reset();
  };

  return (
    <Modal
      title='Update profile'
      opened={isOpened}
      onClose={() => {
        onClose();
        setPreviewAvatar(null);
        setLoadAvatar(null);
        form.reset();
      }}
      centered
      classNames={{ title: c.title, close: c.closeButton }}
    >
      <Box
        component='form'
        onSubmit={form.onSubmit(({ name }) => {
          updateCredentials(name);
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
        <Flex justify='space-around' align='center' mt={20}>
          <Avatar
            size={100}
            radius='50%'
            src={previewAvatar ? (previewAvatar as string) : avatar}
            alt='Avatar'
          />
          <Flex direction='column' gap={20}>
            <FileButton
              onChange={(file) => {
                setLoadAvatar(file);
                hundlerPreviewAvatar(file as File);
              }}
              accept='image/png,image/jpeg'
            >
              {(props) => (
                <Button type='button' variant='filled-grey' size='md' compact uppercase {...props}>
                  Upload image
                </Button>
              )}
            </FileButton>
            <Button
              type='button'
              variant='filled-grey'
              size='md'
              compact
              uppercase
              disabled={!loadAvatar}
              onClick={() => {
                setPreviewAvatar(null);
                setLoadAvatar(null);
              }}
            >
              Reset
            </Button>
          </Flex>
        </Flex>
        <Group position='center' spacing={50} mt={30}>
          <Button
            loading={isLoadAvatar}
            loaderProps={{ color: 'dark.5' }}
            type='submit'
            variant='filled-grey'
            size='md'
            uppercase
            disabled={!loadAvatar && !form.values.name}
          >
            Ok
          </Button>
          <Button
            type='button'
            variant='filled-grey'
            size='md'
            uppercase
            onClick={() => {
              onClose();
              setPreviewAvatar(null);
              setLoadAvatar(null);
              form.reset();
            }}
          >
            Cancel
          </Button>
        </Group>
      </Box>
    </Modal>
  );
};
export default UpdateProfile;
