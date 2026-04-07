import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';

import {
  ActionIcon,
  Avatar,
  Box,
  Flex,
  Group,
  Indicator,
  ScrollArea,
  Text,
  TextInput,
  rem,
  useMantineTheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMediaQuery, usePrevious, useScrollIntoView } from '@mantine/hooks';

import {
  IconArrowBigLeftFilled,
  IconBrandTelegram,
  IconDotsVertical,
  IconMoodEmpty,
} from '@tabler/icons-react';

import { createMessage, updateReadMessage } from '@/service/firebase';

import { useButtonScroll, useClassStatus, useStylesGlobal, useUser } from '@/hooks';

import { CreateMessage } from '@/lib';

import { ButtonScroll, MessagesList } from '@/components';

import type { IMessage, ITransformedContact } from '@/interfaces';

import IMessagesBoardProps from './IMessagesBoardProps';
import useStyles from './MessagesBoard.styles';

const MessagesBoard: FC<IMessagesBoardProps> = ({
  transformedContacts,
  idActiveContact,
  setIdActiveContact,
}) => {
  const theme = useMantineTheme();
  const { classes: cG } = useStylesGlobal();
  const { classes: c } = useStyles();
  const min_768 = useMediaQuery(`(min-width: ${rem(768)})`);
  const { idUser } = useUser();
  const { allStatus } = useClassStatus();
  const { scrollIntoView, targetRef, scrollableRef } = useScrollIntoView<
    HTMLDivElement,
    HTMLDivElement
  >({ duration: 0, offset: 100 });
  const [scrollPosition, onScrollPositionChange] = useState({ x: 0, y: 0 });
  const [idFirstNotReadMessage, setIdFirstNotReadMessage] = useState('');
  const { isButtonShow } = useButtonScroll(scrollableRef, scrollPosition.y, 'bottom');
  const previousIdActiveContact = usePrevious(idActiveContact);

  const form = useForm({
    initialValues: {
      message: '',
    },
  });

  const scrollToBottom = () => {
    scrollableRef.current.scrollTo({ top: scrollableRef.current.scrollHeight });
  };

  const transformedContact = useMemo(() => {
    // console.log(1);

    return transformedContacts.find(
      (el) => el.idContact === idActiveContact
    ) as ITransformedContact;
  }, [transformedContacts]);

  const addMessage = (body: string) => {
    const newMessage: IMessage = new CreateMessage(body, idUser, transformedContact.idContact);
    createMessage(newMessage.id, { ...newMessage });
  };

  useEffect(() => {
    if (idActiveContact === previousIdActiveContact) {
      return;
    }

    // console.log(2);
    const firstNotReadMessage = transformedContact.messages.find(
      (el) => el.read === false && el.idOwner === idActiveContact
    );
    setIdFirstNotReadMessage(firstNotReadMessage?.id as string);
  }, [transformedContact]);

  useEffect(() => {
    // console.log('---idFirstNotReadMessage---', idFirstNotReadMessage);

    if (idFirstNotReadMessage) {
      console.log('--scrollIntoView--');
      scrollIntoView();
    } else {
      console.log('--scrollToBottom--');
      scrollToBottom();
    }
  }, [transformedContact, idFirstNotReadMessage]);

  useEffect(() => {
    console.log('------------111------------');

    const notReadMessages = transformedContact.messages.filter(
      (el) => el.read === false && el.idOwner === idActiveContact
    );

    if (notReadMessages.length > 0) {
      console.log('------------222------------');
      setTimeout(() => {
        notReadMessages.forEach((el) => {
          updateReadMessage(el.id);
        });
        setIdFirstNotReadMessage('');
      }, 3000);
    }
  }, [transformedContact]);

  return (
    <Box
      bg='white'
      w={{
        base: '100%',
        md: '65%',
      }}
      sx={{ boxShadow: '0px 4px 5px 2px rgba(18, 18, 18, 0.35)' }}
    >
      <Group bg={'gray.4'} p={15} spacing={15} sx={{ borderBottom: '2px solid #2C2E33' }} noWrap>
        {!min_768 && (
          <ActionIcon
            ml={-6}
            type='button'
            size={50}
            color='dark.5'
            onClick={() => setIdActiveContact('')}
          >
            <IconArrowBigLeftFilled size={50} />
          </ActionIcon>
        )}
        <Indicator
          inline
          size={16}
          offset={8}
          position='bottom-end'
          withBorder
          classNames={{ indicator: allStatus[`${transformedContact?.status}`] }}
        >
          <Avatar
            size={50}
            radius='xl'
            src={transformedContact.avatar}
            alt={transformedContact.name}
          />
        </Indicator>
        <Flex direction='column' justify='center'>
          <Text lineClamp={1} component='p' fz={22} lh={1.4} fw={500}>
            {transformedContact.name}
          </Text>
          <Text lineClamp={1} component='p' color='gray.6' lh={1.4} fz={13}>
            {true ? 'Last seen, 2.02pm' : 'Online'}
          </Text>
        </Flex>
        <ActionIcon type='button' size={50} color='dark.5' mr={-18} ml='auto'>
          <IconDotsVertical size={50} />
        </ActionIcon>
      </Group>
      <ScrollArea
        h='calc(100% - 162px)'
        viewportRef={scrollableRef}
        onScrollPositionChange={onScrollPositionChange}
      >
        <MessagesList
          messages={transformedContact.messages}
          contact={transformedContact}
          idFirstNotReadMessage={idFirstNotReadMessage}
          ref={targetRef}
        />
        <ButtonScroll isShow={isButtonShow} scrollTo={scrollToBottom} buttonDirection='bottom' />
      </ScrollArea>
      <Box
        component='form'
        onSubmit={form.onSubmit(({ message }) => {
          if (!message) {
            return;
          }
          addMessage(message);
          form.reset();
        })}
        p={15}
      >
        <TextInput
          classNames={{ icon: 'pointer-events-auto' }}
          size='lg'
          placeholder='Type your message'
          {...form.getInputProps('message')}
          iconWidth={50}
          icon={
            <ActionIcon type='button' size={34}>
              <IconMoodEmpty size={34} stroke={1.5} color={theme.colors.gray[6]} />
            </ActionIcon>
          }
          rightSectionWidth={50}
          rightSection={
            <ActionIcon type='submit' size={34}>
              <IconBrandTelegram size={34} stroke={1.5} color={theme.colors.gray[6]} />
            </ActionIcon>
          }
        />
      </Box>
    </Box>
  );
};
export default MessagesBoard;
