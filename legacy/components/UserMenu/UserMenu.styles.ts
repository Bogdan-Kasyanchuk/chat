import { createStyles, rem } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  user: {
    transition: 'background-color 150ms ease',
  },

  userAvatar: {
    border: `${rem(2)} solid ${theme.white}`,
  },

  userDivider: {
    borderTop: `${rem(2)} solid ${theme.colors.dark[5]}`,
    margin: `0px ${rem(-1)}`,
  },

  userStatus: {
    width: rem(12),
    height: rem(12),
    borderRadius: '50%',
  },

  menu: {
    borderColor: theme.colors.gray[4],
    padding: 0,
  },

  menuItem: {
    transition: 'background-color 150ms ease',
    color: theme.colors.dark[5],
    fontSize: rem(16),
    fontWeight: 500,

    '&[data-hovered]': {
      backgroundColor: theme.colors.gray[4],
    },
  },

  menuItemDelete: {
    color: theme.colors.red[7],
  },
}));

export default useStyles;
