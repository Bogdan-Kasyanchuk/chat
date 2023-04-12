import { useUser } from '@/hooks';

import { getTime } from '@/helpers';

import type { IMessages } from '@/interfaces';

const useResultMessages = (messages: IMessages[], id: string) => {
  const { id: idUser } = useUser();

  const resultMessages = messages
    .filter(
      (el) =>
        (el.idInterlocutor === idUser && el.idOwner === id) ||
        (el.idInterlocutor === id && el.idOwner === idUser),
    )
    .sort((a, b) => getTime(a.date) - getTime(b.date));

  return { resultMessages };
};

export default useResultMessages;
