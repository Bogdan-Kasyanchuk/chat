import type { FC } from 'react';
import { useMatch } from 'react-router-dom';

import { Container, Flex, Text } from '@mantine/core';

import { useNormalizedContacts, useUser } from '@/hooks';

import { STATUS } from '@/helpers';

const Footer: FC = () => {
  const { user, idUser } = useUser();
  const { normalizedContacts } = useNormalizedContacts(idUser);
  const matchChat = useMatch('/chat');

  const onlineUsers = normalizedContacts.filter((el) => el.status === STATUS.ONLINE).length;

  return (
    <Container h={60} p={10} bg='dark.5'>
      {user && matchChat && (
        <Flex gap={30} justify='center' align='center' h='100%' fz={22} fw={600}>
          <Text component='p' color='white'>
            All users: {normalizedContacts.length}
          </Text>
          <Text component='p' color='green.7'>
            Online users: {onlineUsers}
          </Text>
        </Flex>
      )}
    </Container>
  );
};

export default Footer;
