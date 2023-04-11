import type { FC } from 'react';

import {
  ActionIcon,
  Avatar,
  Box,
  Flex,
  Indicator,
  ScrollArea,
  Text,
  TextInput,
  rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMediaQuery } from '@mantine/hooks';

import { IconArrowBigLeftFilled, IconBrandTelegram } from '@tabler/icons-react';

import { useClassStatus, useStylesGlobal, useUser } from '@/hooks';

import { MessagesList } from '@/components';

import { IMessagesBoardProps, IUser } from '@/interfaces';

import contacts from '@/data/contacts.json';
import messages from '@/data/messages.json';

import useStyles from './MessagesBoard.styles';

const MessagesBoard: FC<IMessagesBoardProps> = ({ idActiveContact, setIdActiveContact }) => {
  const { classes: cG } = useStylesGlobal();
  const { classes: c } = useStyles();
  const min_768 = useMediaQuery(`(min-width: ${rem(768)})`);
  const { allStatus } = useClassStatus('online');
  const { id } = useUser();
  const form = useForm({
    initialValues: {
      message: '',
    },
  });

  const contact = contacts.find((el) => el.id === idActiveContact);

  return (
    <Box className={c.boardBox}>
      <Flex align='center' gap={15} bg='gray.2' p={15} h={81} className={cG.borderB}>
        <Indicator
          inline
          size={20}
          offset={7}
          position='bottom-end'
          withBorder
          classNames={{ indicator: allStatus[`${contact?.status}`] }}
        >
          <Avatar size={50} radius='xl' src={contact?.avatar} alt={contact?.name} />
        </Indicator>
        <Text lineClamp={1} component='p' fz={24} fw={600}>
          {contact?.name}
        </Text>
        {!min_768 && (
          <ActionIcon type='button' size={40} ml='auto' onClick={() => setIdActiveContact(null)}>
            <IconArrowBigLeftFilled size={40} />
          </ActionIcon>
        )}
      </Flex>
      <ScrollArea h='calc(100% - 81px - 81px)'>
        <MessagesList
          messages={messages.filter(
            (el) =>
              el.idFilter === id + '-' + idActiveContact ||
              el.idFilter === idActiveContact + '-' + id,
          )}
          contact={contact as IUser}
        />
      </ScrollArea>
      <Box
        component='form'
        onSubmit={form.onSubmit(({ message }) => {
          form.reset();
        })}
        bg='gray.2'
        p={15}
        className={cG.borderT}
      >
        <Flex gap={20} align='center' pos='relative'>
          <TextInput
            type='text'
            radius={16}
            w='100%'
            size='lg'
            placeholder='Type your message'
            {...form.getInputProps('message')}
            classNames={{ input: 'pr-14' }}
          />
          <ActionIcon type='submit' size={30} pos='absolute' right={16}>
            <IconBrandTelegram size={30} stroke={1.5} />
          </ActionIcon>
        </Flex>
      </Box>
    </Box>
  );
};

export default MessagesBoard;
