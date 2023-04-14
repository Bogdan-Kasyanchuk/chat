import { useEffect, useState } from 'react';

import { useData, useUser } from '@/hooks';

import { getLocaleDate, getTime } from '@/helpers';

import type { IMessages, INormalizedContact, IUser } from '@/interfaces';

// import contacts from '@/data/contacts.json';
// import messages from '@/data/messages.json';

const useNormalizedContacts = (idContact?: string) => {
  const { id: idUser } = useUser();
  const { data: messages } = useData('messages');
  const { data: contacts } = useData('contacts');
  const [normalizedContacts, setNormalizedContacts] = useState<INormalizedContact[]>([]);
  const [normalizedContact, setNormalizedContact] = useState({});

  useEffect(() => {
    const normalizedContacts: INormalizedContact[] = (contacts as IUser[])
      ?.filter((el) => {
        return el.id !== idUser;
      })
      .map(({ id, name, avatar, status }) => {
        const normalizedMessages = (messages as IMessages[])
          .filter(
            (el) =>
              (el.idInterlocutor === idUser && el.idOwner === id) ||
              (el.idInterlocutor === id && el.idOwner === idUser),
          )
          .sort((a, b) => getTime(a.date) - getTime(b.date));

        const lastMessage = normalizedMessages[normalizedMessages.length - 1];

        return {
          id,
          name,
          avatar,
          status,
          messages: normalizedMessages,
          unreadCountMessages: normalizedMessages.filter(
            (el) => el.read === false && el.idOwner === id,
          ).length,
          lastMessageBody: lastMessage?.body,
          lastMessageDate: getLocaleDate(lastMessage?.date, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
        };
      })
      .sort((a, b) => getTime(b.lastMessageDate) - getTime(a.lastMessageDate));

    setNormalizedContacts(normalizedContacts);

    const normalizedContact = normalizedContacts?.find(
      (el) => el.id === idContact,
    ) as INormalizedContact;

    setNormalizedContact(normalizedContact);
  }, [messages, contacts]);

  return { normalizedContact, normalizedContacts };
};

export default useNormalizedContacts;
