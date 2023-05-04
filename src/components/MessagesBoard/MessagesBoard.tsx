import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';

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
import { useMediaQuery, useScrollIntoView } from '@mantine/hooks';

import { IconArrowBigLeftFilled, IconBrandTelegram } from '@tabler/icons-react';

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
  const { classes: cG } = useStylesGlobal();
  const { classes: c } = useStyles();
  const min_768 = useMediaQuery(`(min-width: ${rem(768)})`);
  const { idUser } = useUser();
  const { allStatus } = useClassStatus();
  const { scrollIntoView, targetRef, scrollableRef } = useScrollIntoView<
    HTMLLIElement,
    HTMLDivElement
  >({ duration: 0 });
  const [scrollPosition, onScrollPositionChange] = useState({ x: 0, y: 0 });
  const [idFirstNotReadMessage, setIdFirstNotReadMessage] = useState('');
  const { isButtonShow } = useButtonScroll(scrollableRef, scrollPosition.y, 'bottom');

  const form = useForm({
    initialValues: {
      message: '',
    },
  });

  const scrollToBottom = () => {
    scrollableRef.current.scrollTo({ top: scrollableRef.current.scrollHeight });
  };

  const transformedContact = useMemo(() => {
    console.log(1);

    return transformedContacts.find(
      (el) => el.idContact === idActiveContact,
    ) as ITransformedContact;
  }, [transformedContacts]);

  const addMessage = (body: string) => {
    const newMessage: IMessage = new CreateMessage(body, idUser, transformedContact.idContact);
    createMessage(newMessage.id, { ...newMessage });
  };

  useEffect(() => {
    console.log(2);
    const firstNotReadMessage = transformedContact.messages.find(
      (el) => el.read === false && el.idOwner === idActiveContact,
    );
    setIdFirstNotReadMessage(firstNotReadMessage?.id as string);
  }, [transformedContact]);

  useEffect(() => {
    console.log('---idFirstNotReadMessage---', idFirstNotReadMessage);

    if (idFirstNotReadMessage) {
      console.log('--scrollIntoView--');
      scrollIntoView();
    } else {
      console.log('--scrollToBottom--');
      scrollToBottom();
    }
  }, [transformedContacts, idFirstNotReadMessage]);

  // useEffect(() => {
  //   if (!idFirstNotReadMessage) {
  //     return;
  //   }
  //   const notReadMessages = transformedContact.messages.filter(
  //     (el) => el.read === false && el.idOwner === idActiveContact,
  //   );

  //   setTimeout(() => {
  //     notReadMessages.forEach((el) => {
  //       updateReadMessage(el.id);
  //     });
  //     setIdFirstNotReadMessage('');
  //   }, 2000);
  // }, [idFirstNotReadMessage]);

  return (
    <Box className={c.boardBox}>
      <Flex align='center' gap={15} bg='gray.2' p={15} h={81} className={cG.borderB}>
        <Indicator
          inline
          size={20}
          offset={7}
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
        <Text lineClamp={1} component='p' fz={24} fw={600}>
          {transformedContact.name}
        </Text>
        {!min_768 && (
          <ActionIcon
            type='button'
            size={40}
            ml='auto'
            color='dark.5'
            onClick={() => setIdActiveContact('')}
          >
            <IconArrowBigLeftFilled size={40} />
          </ActionIcon>
        )}
      </Flex>
      <ScrollArea
        h='calc(100% - 81px - 81px)'
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
            classNames={{ input: c.boardInput }}
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
