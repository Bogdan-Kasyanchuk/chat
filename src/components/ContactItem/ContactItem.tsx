import { FC } from 'react';

import { Avatar, Box, Flex, Indicator, Text } from '@mantine/core';

import useClassStatus from '@/hooks/useClassStatus';

import useStyles from './ContactItem.styles';

const ContactItem: FC<{ el: any }> = ({ el }) => {
  const { classes: c } = useStyles();
  const { allStatus } = useClassStatus('online');

  return (
    <li className={c.item}>
      <Flex justify='space-between'>
        <Indicator
          inline
          size={20}
          offset={7}
          position='bottom-end'
          withBorder
          classNames={{ indicator: allStatus[`${el.status}`] }}
        >
          <Avatar size={50} radius='xl' src={el.avatar} alt={el.name} />
        </Indicator>
        <Flex direction='column' mx={12}>
          <Text component='p' fz={20} lh={1.3}>
            {el.name}
          </Text>
          <Text lineClamp={1} component='p' color='gray.6'>
            {el.message}
          </Text>
        </Flex>
        <Box className={c.paramsBox}>
          <Text component='time' display='block' color='gray.6'>
            {el.messageDate}
          </Text>
          <Text component='span' className={c.quantity}>
            {el.notRead}
          </Text>
        </Box>
      </Flex>
    </li>
  );
};

export default ContactItem;
