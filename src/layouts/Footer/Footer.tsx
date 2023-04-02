import { Center, Container, Text } from '@mantine/core';

// import useStyles from './Footer.styles';

function Footer() {
  // const { classes } = useStyles();

  return (
    <Container p={10} bg='dark.5'>
      <Center>
        <Text component='p' fz={40} fw={600} lh={1.2} color='white'>
          Footer
        </Text>
      </Center>
    </Container>
  );
}

export default Footer;
