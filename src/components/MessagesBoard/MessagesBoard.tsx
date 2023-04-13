import type { FC } from 'react';
import { useEffect } from 'react';

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

import { useClassStatus, useNormalizedContacts, useStylesGlobal } from '@/hooks';

import { MessagesList } from '@/components';

import { IMessagesBoardProps } from '@/interfaces';

import useStyles from './MessagesBoard.styles';

const MessagesBoard: FC<IMessagesBoardProps> = ({ idActiveContact, setIdActiveContact }) => {
  const { classes: cG } = useStylesGlobal();
  const { classes: c } = useStyles();
  const min_768 = useMediaQuery(`(min-width: ${rem(768)})`);
  const { normalizedContact } = useNormalizedContacts(idActiveContact);
  const { userStatus } = useClassStatus(normalizedContact.status);
  const { scrollIntoView, targetRef, scrollableRef } = useScrollIntoView<
    HTMLLIElement,
    HTMLDivElement
  >({ offset: 50, duration: 500 });
  const form = useForm({
    initialValues: {
      message: '',
    },
  });

  const idFirstNotReadMessage = normalizedContact.messages.find(
    (el) => el.read === false && el.idOwner === idActiveContact,
  );

  useEffect(() => {
    scrollIntoView();
  });
  return (
    <Box className={c.boardBox}>
      <Flex align='center' gap={15} bg='gray.2' p={15} h={81} className={cG.borderB}>
        <Indicator
          inline
          size={20}
          offset={7}
          position='bottom-end'
          withBorder
          classNames={{ indicator: userStatus }}
        >
          <Avatar
            size={50}
            radius='xl'
            src={normalizedContact.avatar}
            alt={normalizedContact.name}
          />
        </Indicator>
        <Text lineClamp={1} component='p' fz={24} fw={600}>
          {normalizedContact.name}
        </Text>
        {!min_768 && (
          <ActionIcon type='button' size={40} ml='auto' onClick={() => setIdActiveContact('')}>
            <IconArrowBigLeftFilled size={40} />
          </ActionIcon>
        )}
      </Flex>
      <ScrollArea h='calc(100% - 81px - 81px)' viewportRef={scrollableRef}>
        <MessagesList
          messages={normalizedContact.messages}
          contact={normalizedContact}
          idFirstNotReadMessage={idFirstNotReadMessage?.id}
          ref={targetRef}
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
