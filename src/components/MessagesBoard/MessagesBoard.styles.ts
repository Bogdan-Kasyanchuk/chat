import { createStyles, rem } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  boardBox: {
    width: '100%',
    height: '100%',
    [`@media (min-width: ${theme.breakpoints.md})`]: {
      width: '65%',
    },
  },

  boardInput: {
    paddingRight: rem(56),
  },
}));

export default useStyles;
