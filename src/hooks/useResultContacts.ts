import { useUser } from '@/hooks';

import { getLocaleDate, getTime } from '@/helpers';

import type { IMessages, IUseResultContacts, IUser } from '@/interfaces';

const useResultContacts = (contacts: IUser[], messages: IMessages[]) => {
  const { id: idUser } = useUser();

  const resultContacts: IUseResultContacts[] = contacts
    .map(({ id, name, avatar, status }) => {
      const messagesUser: IMessages[] = messages
        .filter((el) => el.idFilter === idUser + '-' + id || el.idFilter === id + '-' + idUser)
        .sort((a, b) => getTime(b.date) - getTime(a.date));

      return {
        id,
        name,
        avatar,
        status,
        notRead: messagesUser.filter((el) => el.read === false && el.idOwner === id).length,
        message: messagesUser[0]?.body,
        messageDate: getLocaleDate(messagesUser[0]?.date, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      };
    })
    .sort((a, b) => getTime(b.messageDate) - getTime(a.messageDate));

  return { resultContacts };
};

export default useResultContacts;
