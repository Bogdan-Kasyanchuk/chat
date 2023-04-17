import { createStyles, rem } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  label: {
    fontWeight: 900,
    fontSize: rem(220),
    lineHeight: 1,
    color: theme.colors.gray[4],

    [theme.fn.smallerThan('md')]: {
      fontSize: rem(120),
    },
  },

  title: {
    textAlign: 'center',
    fontWeight: 900,
    fontSize: rem(38),
    marginBottom: rem(24),

    [theme.fn.smallerThan('md')]: {
      fontSize: rem(32),
    },
  },
}));

export default useStyles;
