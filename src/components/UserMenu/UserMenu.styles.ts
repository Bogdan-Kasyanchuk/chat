import { createStyles, rem } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  user: {
    transition: 'background-color 150ms ease',
  },

  userIcon: {
    marginRight: rem(-5),
    color: theme.white,
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

    '&[data-hovered]': {
      backgroundColor: theme.colors.gray[4],
    },
  },
}));

export default useStyles;
