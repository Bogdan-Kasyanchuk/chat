import { FC } from 'react';

import { Avatar, Box, Flex, Indicator, List, Text } from '@mantine/core';

import useClassStatus from '@/hooks/useClassStatus';

import useStyles from './ContactItem.styles';

const ContactItem: FC<{ el: any }> = ({ el }) => {
  const { classes: c } = useStyles();
  const { allStatus } = useClassStatus('online');

  return (
    <List.Item className={c.item}>
      <Flex justify='space-between' align='center'>
        <Indicator
          inline
          size={20}
          offset={6}
          position='bottom-end'
          withBorder
          classNames={{ indicator: allStatus[`${el.status}`] }}
        >
          <Avatar size={50} radius='xl' src={el.avatar} alt={el.name} />
        </Indicator>
        <Flex direction='column' className={c.contentBox}>
          <Text component='p' className={c.name}>
            {el.name}
          </Text>
          <Text lineClamp={1} component='p' className={c.message}>
            {el.message}
          </Text>
        </Flex>
        <Box className={c.paramsBox}>
          <Text component='time' className={c.date}>
            {el.messageDate}
          </Text>
          <Text component='p' className={c.quantity}>
            {el.notRead}
          </Text>
        </Box>
      </Flex>
    </List.Item>
  );
};

export default ContactItem;
