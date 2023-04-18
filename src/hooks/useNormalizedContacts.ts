import { useEffect, useState } from 'react';

import { useData, useUser } from '@/hooks';

import { getLocaleDate, getTime } from '@/helpers';

import type { IMessage, INormalizedContact } from '@/interfaces';

const useNormalizedContacts = (id?: string) => {
  const { idUser } = useUser();
  const { data: contacts } = useData('contacts');
  const { data: messages } = useData('messages');
  const [normalizedContacts, setNormalizedContacts] = useState<INormalizedContact[]>([]);

  useEffect(() => {
    if (!contacts || !messages) {
      return;
    }

    setNormalizedContacts(
      contacts
        .filter((el) => {
          return el.idContact !== idUser;
        })
        .map(({ idContact, name, avatar, status }) => {
          const normalizedMessages = (messages as IMessage[])
            ?.filter(
              (el) =>
                (el.idInterlocutor === idUser && el.idOwner === idContact) ||
                (el.idInterlocutor === idContact && el.idOwner === idUser),
            )
            .sort((a, b) => getTime(a.date) - getTime(b.date));

          const lastMessage = normalizedMessages[normalizedMessages.length - 1];

          return {
            idContact,
            name,
            avatar,
            status,
            messages: normalizedMessages,
            unreadCountMessages: normalizedMessages.filter(
              (el) => !el.read && el.idOwner === idContact,
            ).length,
            lastMessageOwner: lastMessage?.idOwner,
            lastMessageBody: lastMessage?.body,
            lastMessageDate: getLocaleDate(lastMessage?.date, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
          };
        })
        .sort((a, b) => getTime(b.lastMessageDate) - getTime(a.lastMessageDate)),
    );
  }, [contacts, messages]);

  const normalizedContact = normalizedContacts.find(
    (el) => el.idContact === id,
  ) as INormalizedContact;

  return { normalizedContact, normalizedContacts };
};

export default useNormalizedContacts;
