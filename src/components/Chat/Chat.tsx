import { FC } from 'react';

import { Flex } from '@mantine/core';

import useStyles from './Chat.styles';
import { ContactsBoard, MessageBoard } from '@/components';

const Home: FC = () => {
  const { classes } = useStyles();
  return (
    <Flex justify='center' h='100%' className={classes.chat}>
      <ContactsBoard />
      <MessageBoard />
    </Flex>
  );
};

export default Home;
