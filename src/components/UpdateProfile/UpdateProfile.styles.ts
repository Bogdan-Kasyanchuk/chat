import { createStyles, rem } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  title: {
    fontSize: rem(18),
    textTransform: 'uppercase',
    fontWeight: 500,
  },

  closeButton: {
    marginRight: rem(-2),
    color: theme.colors.dark[5],
    width: rem(32),
    height: rem(32),
    '& svg': { width: rem(30), height: rem(30) },
    '&:hover': {
      color: theme.white,
      backgroundColor: theme.colors.dark[5],
    },
  },
}));

export default useStyles;
