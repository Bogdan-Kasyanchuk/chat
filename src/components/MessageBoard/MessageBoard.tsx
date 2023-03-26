import { FC } from 'react';

import { Avatar, Box, Group, Indicator, Text } from '@mantine/core';

import useStyles from './MessageBoard.styles';

const MessageBoard: FC = () => {
  const { classes } = useStyles();

  return (
    <Box w='65%'>
      <Box bg='gray.1' p={20} h={91} className={classes.messageBoard}>
        <Group>
          <Indicator
            inline
            size={20}
            offset={5}
            position='bottom-end'
            withBorder
            classNames={{ indicator: 'bg-red-500' }}
          >
            <Avatar
              size={50}
              radius='xl'
              src='https://lh3.googleusercontent.com/a/AGNmyxYVYM2tRUxhS3shuKbRV58EFy3N14MFixvTe2I=s96-c'
              alt='dsf'
            />
          </Indicator>
          <Text fz={18} fw={600}>
            Petro Petrov
          </Text>
        </Group>
      </Box>
    </Box>
  );
};

export default MessageBoard;
