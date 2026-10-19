import { rem } from '@mantine/core';
import { notifications } from '@mantine/notifications';

const showError = (error: unknown) => {
  notifications.show({
    message: `${error}`,
    color: 'red.7',

    styles: (theme) => ({
      closeButton: {
        color: theme.colors.dark[5],
        width: rem(32),
        height: rem(32),
        '& svg': { width: rem(30), height: rem(30) },
        '&:hover': {
          color: theme.white,
          backgroundColor: theme.colors.red[7],
        },
      },
    }),
  });
};

export default showError;
