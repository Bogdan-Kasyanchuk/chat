import { getTime } from '@/helpers';

import type { IContact, IMessage, ITransformedContact } from '@/interfaces';

const useTransformedData = (
  normalizedContacts: IContact[],
  normalizedMessages: IMessage[],
  idUser: string,
) => {
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
        lastMessageBody: lastMessageContact?.body,
        lastMessageDate: lastMessageContact?.date,
      };
    })
    .sort((a, b) => getTime(b.lastMessageDate) - getTime(a.lastMessageDate));

  return { transformedContacts };
};

export default useTransformedData;
