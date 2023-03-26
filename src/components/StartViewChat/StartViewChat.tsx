import { FC } from 'react';

import { Center, Text } from '@mantine/core';

import useStyles from './StartViewChat.styles';

const StartViewChat: FC = () => {
  const { classes } = useStyles();

  return (
    <Center h='100%'>
      <Text w='max-content' fz={18} p={16} bg='gray.1' className={classes.startViewChat}>
        Choose who you would like to write to
      </Text>
    </Center>
  );
};

export default StartViewChat;
