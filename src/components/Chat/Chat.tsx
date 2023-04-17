import { useEffect, useState } from 'react';
import type { FC } from 'react';

import { Flex, rem } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

import { checkUser, createUser } from '@/service/firebase';

import { useKeyDown, useStylesGlobal, useUser } from '@/hooks';

import { ContactsBoard, MessagesBoard, StartViewChat } from '@/components';

import type { TIdActiveContact } from '@/types';

const Chat: FC = () => {
  const { classes: cG } = useStylesGlobal();
  const min_768 = useMediaQuery(`(min-width: ${rem(768)})`);
  const [idActiveContact, setIdActiveContact] = useState<TIdActiveContact>('');
  useKeyDown(() => setIdActiveContact(''));

  const { name, avatar, idUser, status } = useUser();

  useEffect(() => {
    checkUser(idUser).then((docSnap) => {
      if (docSnap?.exists()) {
        return;
      }

      createUser(idUser, { name, avatar, status, idContact: idUser });
    });
  }, [name, avatar]);

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
