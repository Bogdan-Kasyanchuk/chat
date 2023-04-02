import { FC } from 'react';

import { Flex, rem } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

import useStylesGlobal from '@/hooks/useStylesGlobal';

import useStyles from './Chat.styles';
import { ContactsBoard, MessagesBoard } from '@/components';

const Home: FC = () => {
  const { classes: cG } = useStylesGlobal();
  const { classes: c } = useStyles();
  const min_768 = useMediaQuery(`(min-width: ${rem(768)})`);

  return (
    <Flex justify='center' h='100%' className={cG.borderX}>
      <ContactsBoard />
      {true && <MessagesBoard />}
    </Flex>
  );
};

export default Home;
