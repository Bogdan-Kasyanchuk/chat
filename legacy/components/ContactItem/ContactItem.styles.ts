import { createStyles, rem } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  item: {
    padding: `${rem(15)} ${rem(20)} ${rem(15)} ${rem(15)}`,
    transition: 'background-color 150ms ease',

    '&:not(:last-child)': {
      borderBottom: `${rem(1)} solid ${theme.colors.gray[4]}`,
    },

    '&:hover': {
      backgroundColor: theme.colors.gray[4],
      cursor: 'pointer',
    },

    '& *': {
      pointerEvents: 'none',
    },
  },

  paramsBox: {
    flexShrink: 0,
    marginLeft: 'auto',
    fontSize: rem(14),
  },

  quantity: {
    display: 'inline-block',
    borderRadius: rem(14),
    padding: rem(6),
    lineHeight: 1,
    color: theme.white,
    backgroundColor: theme.colors.red[7],
  },
}));

export default useStyles;
