import { useResultMessages } from '@/hooks';

import { getLocaleDate, getTime } from '@/helpers';

import type { IMessages, IUseResultContacts, IUser } from '@/interfaces';

const useResultContacts = (contacts: IUser[], messages: IMessages[]) => {
  const resultContacts: IUseResultContacts[] = contacts
    .map(({ id, name, avatar, status }) => {
      const { resultMessages } = useResultMessages(messages, id);
      const lastMessage = resultMessages[resultMessages.length - 1];

      return {
        id,
        name,
        avatar,
        status,
        notRead: resultMessages.filter((el) => el.read === false && el.idOwner === id).length,
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
