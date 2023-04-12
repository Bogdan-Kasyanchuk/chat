import type { FC } from 'react';

import { Center, Text } from '@mantine/core';

import { useStylesGlobal } from '@/hooks';

import useStyles from './StartViewChat.styles';

const StartViewChat: FC = () => {
  const { classes: cG } = useStylesGlobal();
  const { classes: c } = useStyles();

  return (
    <Center className={c.startViewbox}>
      <Text component='p' w='max-content' fz={18} p={16} bg='gray.1' className={cG.border}>
        Choose who you would like to write to
      </Text>
    </Center>
  );
};

export default StartViewChat;
