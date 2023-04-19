import type { FC } from 'react';
import { useMatch } from 'react-router-dom';

import { Container, Flex, Text } from '@mantine/core';

import { useNormalizedContacts, useUser } from '@/hooks';

const Footer: FC = () => {
  const { user } = useUser();
  // const { normalizedContacts } = useNormalizedContacts();
  const matchChat = useMatch('/chat');

  return (
    <Container h={60} p={10} bg='dark.5'>
      {user && matchChat && (
        <Flex gap={30} justify='center' align='center' h='100%' fz={22} fw={600}>
          <Text component='p' color='white'>
            {/* All users: {normalizedContacts.length} */}
          </Text>
          <Text component='p' color='green.7'>
            {/* Online users: {normalizedContacts.filter((el) => el.status === 'online').length} */}
          </Text>
        </Flex>
      )}
    </Container>
  );
};

export default Footer;
