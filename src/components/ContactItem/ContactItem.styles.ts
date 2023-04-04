import { createStyles, rem } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  item: {
    padding: `${rem(20)} ${rem(20)} ${rem(20)} ${rem(15)}`,
    transition: 'background-color 150ms ease',

    '&:not(:last-child)': {
      borderBottom: `${rem(1)} solid ${theme.colors.gray[4]}`,
    },

    '&:hover': {
      backgroundColor: theme.colors.gray[2],
      cursor: 'pointer',
    },

    '& *': {
      pointerEvents: 'none',
    },
  },

  paramsBox: {
    flexShrink: 0,
    textAlign: 'right',
    marginLeft: 'auto',
    fontSize: rem(14),
  },

  quantity: {
    marginTop: rem(2),
    display: 'inline-block',
    borderRadius: rem(14),
    padding: rem(6),
    lineHeight: 1,
    backgroundColor: theme.colors.gray[4],
  },
}));

export default useStyles;
