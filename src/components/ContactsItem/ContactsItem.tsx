import { FC } from 'react';

import { Avatar, Indicator, List, Text } from '@mantine/core';

import useStyles from './ContactsItem.styles';

const ContactsItem: FC<{ el: any }> = ({ el }) => {
  const { classes } = useStyles();

  return (
    <List.Item key={el.id}>
      <Indicator
        inline
        size={20}
        offset={5}
        position='bottom-end'
        withBorder
        classNames={{ indicator: 'bg-red-500' }}
      >
        <Avatar size={40} radius='xl' src={el.avatar} alt={el.name} />
      </Indicator>
      <Text>{el.name}</Text>
      <Text>{el.message}</Text>
      <Text>{el.messageDate}</Text>
      <Text>{el.notRead}</Text>
    </List.Item>
  );
};

export default ContactsItem;
