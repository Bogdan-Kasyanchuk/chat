import { useNormalizedContacts, useNormalizedMessages, useUser } from '@/hooks';

import { getTime } from '@/helpers';

import type { ITransformedContact } from '@/interfaces';

const useTransformedData = (id?: string) => {
  const { idUser } = useUser();
  const { normalizedContacts } = useNormalizedContacts();
  const { normalizedMessages } = useNormalizedMessages();

  const transformedContacts: ITransformedContact[] = normalizedContacts
    .map(({ idContact, name, avatar, status }) => {
      const filteredMessagesByContacts = normalizedMessages.filter(
        (el) =>
          (el.idInterlocutor === idUser && el.idOwner === idContact) ||
          (el.idInterlocutor === idContact && el.idOwner === idUser),
      );

      const lastMessageContact = filteredMessagesByContacts[filteredMessagesByContacts.length - 1];

      return {
        idContact,
        name,
        avatar,
        status,
        messages: filteredMessagesByContacts,
        unreadCountMessages: filteredMessagesByContacts.filter(
          (el) => !el.read && el.idOwner === idContact,
        ).length,
        lastMessageBody: lastMessageContact.body,
        lastMessageDate: lastMessageContact.date,
      };
    })
    .sort((a, b) => getTime(b.lastMessageDate) - getTime(a.lastMessageDate));

  const transformedContact = transformedContacts.find(
    (el) => el.idContact === id,
  ) as ITransformedContact;

  return { transformedContact, transformedContacts };
};

export default useTransformedData;
