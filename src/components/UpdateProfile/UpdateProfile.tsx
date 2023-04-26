import type { FC } from 'react';
import { useRef, useState } from 'react';

import { Avatar, Box, FileButton, Flex, Group, Modal, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

import { IconUser } from '@tabler/icons-react';

import cloudinaryImageUpload from '@/service/cloudinary/cloudinaryImageUpload';
import { updateUser } from '@/service/firebase';

import { Button } from '@/components';

import type IUpdateProfileProps from './IUpdateProfileProps';
import useStyles from './UpdateProfile.styles';

const UpdateProfile: FC<IUpdateProfileProps> = ({ idUser, avatar, isOpened, onClose }) => {
  const { classes: c } = useStyles();
  const [loadAvatar, setLoadAvatar] = useState<null | File>(null);
  const [isLoadAvatar, setIsLoadAvatar] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | ArrayBuffer | null>(null);
  const resetAvatar = useRef<() => void>(null);
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

  const updateCredentials = (name: string) => {
    setIsLoadAvatar(true);
    cloudinaryImageUpload(loadAvatar as File).then((url) => {
      updateUser(idUser, {
        name,
        avatar: url,
      });
      setIsLoadAvatar(false);
      onClose();
      form.reset();
    });
  };

  return (
    <Modal
      title='Update profile'
      opened={isOpened}
      onClose={() => {
        onClose();
        setPreviewAvatar(null);
        resetAvatar.current?.();
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
              resetRef={resetAvatar}
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
                setLoadAvatar(null);
                setPreviewAvatar(null);
                resetAvatar.current?.();
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
              resetAvatar.current?.();
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
