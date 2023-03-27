import { createStyles, rem } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  messageBoard: {
    borderBottom: `${rem(1)} solid ${theme.colors.gray[4]}`,
  },
  messageB: {
    borderTop: `${rem(1)} solid ${theme.colors.gray[4]}`,
  },
}));

export default useStyles;
