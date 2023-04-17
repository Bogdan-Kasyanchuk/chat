import { createStyles, rem } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  boardBox: {
    width: '100%',
    height: '100%',
    minWidth: rem(360),

    [theme.fn.largerThan('md')]: {
      width: '35%',
    },
  },
}));

export default useStyles;
