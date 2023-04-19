import { useEffect, useState } from 'react';
import type { FC } from 'react';

import { Flex, rem } from '@mantine/core';
import { useDidUpdate, useMediaQuery } from '@mantine/hooks';

import { checkUser, createUser } from '@/service/firebase';

import { useData, useKeyDown, useStylesGlobal, useUser } from '@/hooks';

import { getTime } from '@/helpers';

import newMessageAudio from '@/assets/newMessage.mp3';

import { ContactsBoard, MessagesBoard, StartViewChat } from '@/components';

const Chat: FC = () => {
  const { classes: cG } = useStylesGlobal();
  const min_768 = useMediaQuery(`(min-width: ${rem(768)})`);
  const [idActiveContact, setIdActiveContact] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  useKeyDown(() => setIdActiveContact(''));
  const { name, avatar, idUser, status } = useUser();
  const { data: messages } = useData('messages');

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
    if (messages) {
      setIsMounted(true);
    }

    if (
      messages &&
      isMounted &&
      messages.sort((a, b) => getTime(a.date) - getTime(b.date)).at(-1)?.idInterlocutor === idUser
    ) {
      audio.play();
      console.log(555555);
    }
  }, [messages]);

  return (
    <Flex justify='center' h='100%' className={cG.borderX}>
      {min_768 ? (
        <>
          <ContactsBoard setIdActiveContact={setIdActiveContact} />
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
        <ContactsBoard setIdActiveContact={setIdActiveContact} />
      )}
    </Flex>
  );
};

export default Chat;
