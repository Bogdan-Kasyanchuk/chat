import { createStyles, rem } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.colors.gray[1],
    borderBottom: `${rem(1)} solid ${theme.colors.gray[3]}`,
    marginBottom: rem(20),
  },

  button: {
    backgroundColor: theme.colors.gray[4],
    color: theme.black,

    '&:not([data-disabled]):hover': {
      backgroundColor: theme.black,
      color: theme.white,
    },
  },
}));

export default useStyles;
