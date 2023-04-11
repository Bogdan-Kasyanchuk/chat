import { useState } from 'react';
import type { FC } from 'react';

import { Flex, rem } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

import { useStylesGlobal } from '@/hooks';

import { ContactsBoard, MessagesBoard, StartViewChat } from '@/components';

const Home: FC = () => {
  const { classes: cG } = useStylesGlobal();
  const min_768 = useMediaQuery(`(min-width: ${rem(768)})`);
  const [idActiveContact, setIdActiveContact] = useState<null | string>(null);

  console.log(idActiveContact);

  return (
    <Flex justify='center' h='100%' className={cG.borderX}>
      {min_768 ? (
        <>
          <ContactsBoard setIdActiveContact={setIdActiveContact} />
          {idActiveContact ? (
            <MessagesBoard idActiveContact={idActiveContact} />
          ) : (
            <StartViewChat />
          )}
        </>
      ) : idActiveContact ? (
        <MessagesBoard idActiveContact={idActiveContact} />
      ) : (
        <ContactsBoard setIdActiveContact={setIdActiveContact} />
      )}
    </Flex>
  );
};

export default Home;
