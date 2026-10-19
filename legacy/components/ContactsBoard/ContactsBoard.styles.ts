import { createStyles, rem } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  boardBox: {
    width: '100%',
    minWidth: rem(340),

    [theme.fn.largerThan('md')]: {
      width: '35%',
    },
  },
}));

export default useStyles;
