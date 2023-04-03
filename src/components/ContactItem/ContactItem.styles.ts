import { createStyles, rem } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  item: {
    padding: `${rem(15)} ${rem(20)} ${rem(15)} ${rem(15)}`,
    transition: 'background-color 150ms ease',

    '&:not(:last-child)': {
      borderBottom: `${rem(1)} solid ${theme.colors.gray[4]}`,
    },

    '&:hover': {
      backgroundColor: theme.colors.gray[2],
      cursor: 'pointer',
    },
  },

  itemInner: {
    // width: '100%',
    display: 'block',
  },

  contentBox: {
    marginInline: rem(12),
  },

  name: {
    // borderBottom: `${rem(1)} solid ${theme.colors.gray[4]}`,
  },

  message: {
    // borderBottom: `${rem(1)} solid ${theme.colors.gray[4]}`,
  },

  paramsBox: {
    flexShrink: 0,
    textAlign: 'right',
    marginLeft: 'auto',
    // borderBottom: `${rem(1)} solid ${theme.colors.gray[4]}`,
  },

  date: {
    // borderBottom: `${rem(1)} solid ${theme.colors.gray[4]}`,
  },

  quantity: {
    // borderBottom: `${rem(1)} solid ${theme.colors.gray[4]}`,
  },
}));

export default useStyles;
