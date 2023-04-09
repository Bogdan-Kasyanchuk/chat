import useUser from '@/hooks/useUser';

import getLocaleDate from '@/helpers/getLocaleDate';
import getTime from '@/helpers/getTime';

import type { IMessages, IUseResultContacts, IUser } from '@/interfaces';

const useResultContacts = (contacts: IUser[], messages: IMessages[]) => {
  const { id: idUser } = useUser();

  const resultContacts: IUseResultContacts[] = contacts
    .map(({ id, name, avatar, status }) => {
      const lastMessage: IMessages = messages
        .filter((el) => el.idFilter === idUser + '-' + id)
        .sort((a, b) => getTime(b.date) - getTime(a.date))[0];

      return {
        id,
        name,
        avatar,
        status,
        notRead: messages.filter((el) => el.read === false).length,
        message: lastMessage.body,
        messageDate: getLocaleDate(lastMessage.date, {
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
