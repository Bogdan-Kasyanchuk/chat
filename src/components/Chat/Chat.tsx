import { useEffect, useState } from 'react';
import type { FC } from 'react';

import { Flex, rem } from '@mantine/core';
import { useDidUpdate, useMediaQuery } from '@mantine/hooks';

import { checkUser, createUser } from '@/service/firebase';

import {
  useKeyDown,
  useNormalizedContacts,
  useNormalizedMessages,
  useStylesGlobal,
  useUser,
} from '@/hooks';

import { showLastMessage } from '@/lib';

import newMessageAudio from '@/assets/newMessage.mp3';

import { ContactsBoard, MessagesBoard, StartViewChat } from '@/components';

const Chat: FC = () => {
  const { classes: cG } = useStylesGlobal();
  const min_768 = useMediaQuery(`(min-width: ${rem(768)})`);
  const [idActiveContact, setIdActiveContact] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  useKeyDown(() => setIdActiveContact(''));
  const { name, avatar, idUser, status } = useUser();
  const { normalizedMessages } = useNormalizedMessages();
  const { normalizedContacts } = useNormalizedContacts();

  const audio = new Audio(newMessageAudio);

  useEffect(() => {
    checkUser(idUser).then((docSnap) => {
      if (docSnap?.exists()) {
        return;
      }

      createUser(idUser, { name, avatar, status, idContact: idUser });
    });
  }, []);

  useDidUpdate(() => {
    if (normalizedMessages.length > 0) {
      setIsMounted(true);
    }

    const lastMessage = normalizedMessages[normalizedMessages.length - 1];

    if (normalizedMessages && isMounted && lastMessage.idInterlocutor === idUser) {
      audio.play();
      showLastMessage(lastMessage, normalizedContacts);
    }
  }, [normalizedMessages]);

  return (
    <Flex justify='center' h='100%' className={cG.borderX}>
      {min_768 ? (
        <>
          <ContactsBoard
            idActiveContact={idActiveContact}
            setIdActiveContact={setIdActiveContact}
          />
          {idActiveContact ? (
            <MessagesBoard
              idActiveContact={idActiveContact}
              setIdActiveContact={setIdActiveContact}
            />
          ) : (
            <StartViewChat />
          )}
        </>
      ) : idActiveContact ? (
        <MessagesBoard idActiveContact={idActiveContact} setIdActiveContact={setIdActiveContact} />
      ) : (
        <ContactsBoard idActiveContact={idActiveContact} setIdActiveContact={setIdActiveContact} />
      )}
    </Flex>
  );
};

export default Chat;
