import { createStyles, rem } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  footer: {
    backgroundColor: theme.colors.gray[1],
    borderTop: `${rem(1)} solid ${theme.colors.gray[3]}`,
  },
}));

export default useStyles;
