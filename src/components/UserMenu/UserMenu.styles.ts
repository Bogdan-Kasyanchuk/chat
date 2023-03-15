import { createStyles, rem } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  user: {
    transition: 'background-color 150ms ease',

    '&:hover': {
      backgroundColor: theme.colors.gray[4],
    },
  },

  userActive: {
    backgroundColor: theme.colors.gray[4],
  },

  userIcon: {
    marginRight: rem(-5),
  },

  userStatus: {
    width: rem(12),
    height: rem(12),
    borderRadius: '50%',
  },

  userStatusOnline: {
    backgroundColor: theme.colors.green[7],
  },

  userStatusOffline: {
    backgroundColor: theme.colors.red[7],
  },

  userStatusDoNotDisturb: {
    backgroundColor: theme.colors.yellow[7],
  },

  userStatusOutOfPlace: {
    backgroundColor: theme.colors.gray[7],
  },

  menu: {
    borderColor: theme.colors.gray[3],
    padding: 0,
  },

  menuItem: {
    transition: 'background-color 150ms ease',

    '&[data-hovered]': {
      backgroundColor: theme.colors.gray[4],
    },
  },

  menuDivider: {
    borderTopColor: theme.colors.gray[3],
  },
}));

export default useStyles;
