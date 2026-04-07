import type { FC } from 'react';

import { Center, Text } from '@mantine/core';

import useStyles from './StartViewChat.styles';

const StartViewChat: FC = () => {
  const { classes: c } = useStyles();

  return (
    <Center
      className={c.startViewbox}
      p={20}
      sx={{ boxShadow: '0px 4px 5px 2px rgba(18, 18, 18, 0.35)' }}
    >
      <Text component='p' fz={20} fw={500} align='center'>
        Choose who you would like to write&nbsp;to
      </Text>
    </Center>
  );
};

export default StartViewChat;
