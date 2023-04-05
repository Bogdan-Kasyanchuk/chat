import { Container, Flex, Text } from '@mantine/core';

function Footer() {
  return (
    <Container h={60} p={10} bg='dark.5'>
      {true && (
        <Flex gap={30} justify='center' align='center' h='100%' fz={22} fw={600}>
          <Text component='p' color='white'>
            All users: 50
          </Text>
          <Text component='p' color='green.7'>
            Online users: 30
          </Text>
        </Flex>
      )}
    </Container>
  );
}

export default Footer;
