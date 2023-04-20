import { rem } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { IContact, IMessage } from '@/interfaces';

const showLastMessage = (lastMessage: IMessage, normalizedContacts: IContact[]) => {
  const lastMessageContacts = normalizedContacts?.find(
    (el) => el.idContact === lastMessage.idOwner,
  );

  notifications.show({
    autoClose: 5000,
    title: lastMessageContacts?.name,
    message: lastMessage.body,
    color: 'dark.5',
    icon: 'User',

    styles: (theme) => ({
      root: {
        backgroundColor: theme.colors.gray[2],
        borderColor: theme.colors.gray[4],
      },
      icon: {
        width: rem(40),
        height: rem(40),
        position: 'relative',
        backgroundColor: 'transparent',
        '&::after': {
          content: '""',
          position: 'absolute',
          backgroundImage: `url(${lastMessageContacts?.avatar})`,
          backgroundSize: 'cover',
          borderRadius: '50%',
          width: rem(40),
          height: rem(40),
        },
      },
      title: { fontSize: rem(18) },
      description: { color: theme.colors.dark[5] },
      closeButton: {
        color: theme.colors.dark[5],
        width: rem(32),
        height: rem(32),
        '& svg': { width: rem(30), height: rem(30) },
        '&:hover': {
          color: theme.white,
          backgroundColor: theme.colors.dark[5],
        },
      },
    }),
  });
};

export default showLastMessage;
