import { notifications } from '@mantine/notifications';

import { IContact, IMessage } from '@/interfaces';

const showLastMessage = (lastMessage: IMessage, normalizedContacts: IContact[]) => {
  const lastMessageContacts = normalizedContacts?.find(
    (el) => el.idContact === lastMessage.idOwner,
  );

  notifications.show({
    autoClose: 5000,
    withCloseButton: false,
    title: lastMessageContacts?.name,
    message: lastMessage.body,
    // color: 'green.7',
    icon: lastMessageContacts?.avatar,

    // style: { backgroundColor: 'red' },
    // sx: { backgroundColor: 'red' },
  });
};

export default showLastMessage;
