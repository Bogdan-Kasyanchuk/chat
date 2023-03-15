import { createStyles, rem } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.colors.gray[1],
    borderBottom: `${rem(1)} solid ${theme.colors.gray[3]}`,
  },

  logo: {
    marginRight: 'auto',
    color: theme.black,
    textDecoration: 'none',
  },
}));

export default useStyles;
