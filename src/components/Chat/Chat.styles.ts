import { createStyles, rem } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  chat: {
    borderLeft: `${rem(1)} solid ${theme.colors.gray[4]}`,
    borderRight: `${rem(1)} solid ${theme.colors.gray[4]}`,
  },
}));

export default useStyles;
