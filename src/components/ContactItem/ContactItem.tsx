import { FC } from 'react';

import { Avatar, Box, Indicator, List, Text } from '@mantine/core';

import useClassStatus from '@/hooks/useClassStatus';

import useStyles from './ContactItem.styles';

const ContactItem: FC<{ el: any }> = ({ el }) => {
  const { classes: c } = useStyles();
  const { allStatus } = useClassStatus('online');

  return (
    <List.Item className={c.item}>
      <Indicator
        inline
        size={20}
        offset={5}
        position='bottom-end'
        withBorder
        classNames={{ indicator: allStatus[`${el.status}`] }}
      >
        <Avatar size={50} radius='xl' src={el.avatar} alt={el.name} />
      </Indicator>
      <Box className={c.contentBox}>
        <Text component='p' className={c.name}>
          {el.name}
        </Text>
        <Text component='p' className={c.message}>
          {el.message}
        </Text>
      </Box>
      <Box>
        <Text component='time' className={c.paramsBox}>
          {el.messageDate}
        </Text>
        <Text component='p' className={c.quantity}>
          {el.notRead}
        </Text>
      </Box>
    </List.Item>
  );
};

export default ContactItem;
