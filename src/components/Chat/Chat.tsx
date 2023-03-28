import { FC } from 'react';

import { Flex } from '@mantine/core';

import useStylesGlobal from '@/hooks/useStylesGlobal';

import useStyles from './Chat.styles';
import { ContactsBoard, MessageBoard } from '@/components';

const Home: FC = () => {
  const { classes: classesGlobal } = useStylesGlobal();
  const { classes } = useStyles();

  return (
    <Flex justify='center' h='100%' className={classesGlobal.borderX}>
      <ContactsBoard />
      <MessageBoard />
    </Flex>
  );
};

export default Home;
