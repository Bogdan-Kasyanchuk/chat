import type { FC } from 'react';

import { Container, Flex, Text } from '@mantine/core';

import { useUser } from '@/hooks';

import contacts from '@/data/contacts.json';

const Footer: FC = () => {
  const { user } = useUser();
  return (
    <Container h={60} p={10} bg='dark.5'>
      {user && (
        <Flex gap={30} justify='center' align='center' h='100%' fz={22} fw={600}>
          <Text component='p' color='white'>
            All users: {contacts.length}
          </Text>
          <Text component='p' color='green.7'>
            Online users: {contacts.filter((el) => el.status === 'online').length}
          </Text>
        </Flex>
      )}
    </Container>
  );
};

export default Footer;
