import { IconBrandTelegram } from '@tabler/icons-react';
import { FC } from 'react';

import { ActionIcon, Avatar, Box, Flex, Group, Indicator, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

import useStylesGlobal from '@/hooks/useStylesGlobal';

import getLocaleDate from '@/helpers/getLocaleDate';

import messages from '@/data/messages.json';

import useStyles from './MessageBoard.styles';
import { ButtonCustom } from '@/components';

const MessageBoard: FC = () => {
  const { classes: classesGlobal } = useStylesGlobal();
  const { classes } = useStyles();
  const form = useForm({
    initialValues: {
      message: '',
    },
  });

  return (
    <Box w='65%'>
      <Box bg='gray.2' p={20} h={91} className={classesGlobal.borderB}>
        <Group>
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
          <Text fz={18} fw={600}>
            Petro Petrov
          </Text>
        </Group>
      </Box>
      <ul>
        {messages.map((el: any) => (
          <li key={el.id}>
            {/* <Indicator
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
            </Indicator> */}
            <Text>{el.body}</Text>
            <Text>
              {getLocaleDate(el.date, {
                day: 'numeric',
                month: 'numeric',
                year: '2-digit',
                hour: 'numeric',
                minute: 'numeric',
              })}
            </Text>
          </li>
        ))}
      </ul>
      <Box bg='gray.2' p={20} className={classes.messageB}>
        <Box
          component='form'
          onSubmit={form.onSubmit(({ message }) => {
            console.log(message);
            form.reset();
          })}
          h='100%'
        >
          <Flex gap={20} align='center' pos='relative'>
            <TextInput
              w='100%'
              size='lg'
              placeholder='Type your message'
              {...form.getInputProps('message')}
            />
            <ActionIcon type='submit' size={30} pos='absolute' right={16}>
              <IconBrandTelegram size={30} />
            </ActionIcon>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default MessageBoard;
