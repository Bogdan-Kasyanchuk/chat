import { IconBrandTelegram } from '@tabler/icons-react';
import { FC } from 'react';

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
} from '@mantine/core';
import { useForm } from '@mantine/form';

import useStylesGlobal from '@/hooks/useStylesGlobal';

import messages from '@/data/messages.json';

import useStyles from './MessagesBoard.styles';
import { MessagesList } from '@/components';

const MessagesBoard: FC = () => {
  const { classes: cG } = useStylesGlobal();
  const { classes: c } = useStyles();
  const form = useForm({
    initialValues: {
      message: '',
    },
  });

  return (
    <Box className={c.boardBox}>
      <Group bg='gray.2' p={15} h={81} className={cG.borderB}>
        <Indicator
          inline
          size={20}
          offset={5}
          position='bottom-end'
          withBorder
          classNames={{ indicator: 'bg-red-500' }}
        >
          <Avatar
            size={50}
            radius='xl'
            src='https://lh3.googleusercontent.com/a/AGNmyxYVYM2tRUxhS3shuKbRV58EFy3N14MFixvTe2I=s96-c'
            alt='dsf'
          />
        </Indicator>
        <Text component='p' fz={18} fw={600}>
          Petro Petrov
        </Text>
      </Group>
      <ScrollArea h='calc(100% - 81px - 81px)'>
        <MessagesList messages={messages} />
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
