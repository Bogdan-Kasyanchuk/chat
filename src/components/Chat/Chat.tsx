import { useState } from 'react';
import type { FC } from 'react';

import { Flex, rem } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

import { useKeyDown, useStylesGlobal } from '@/hooks';

import { ContactsBoard, MessagesBoard, StartViewChat } from '@/components';

import type { TIdActiveContact } from '@/types';

const Chat: FC = () => {
  const { classes: cG } = useStylesGlobal();
  const min_768 = useMediaQuery(`(min-width: ${rem(768)})`);
  const [idActiveContact, setIdActiveContact] = useState<TIdActiveContact>('');
  useKeyDown(() => setIdActiveContact(''));

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
