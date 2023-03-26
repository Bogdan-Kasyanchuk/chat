import { createStyles, rem } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  logo: {
    marginRight: 'auto',
    color: theme.white,
    textDecoration: 'none',
  },
  btn: {
    '&:not([data-disabled])': theme.fn.hover({
      backgroundColor: theme.colors.gray[4],
      color: theme.black,
    }),
  },
}));

export default useStyles;
