import { Box, Center, Container, Text } from '@mantine/core';

import useStyles from './Footer.styles';

function Footer() {
  const { classes } = useStyles();

  return (
    <Box bg='dark.5' w='100%' maw={1440} mx='auto'>
      <Container p={10}>
        <Center>
          <Text fz={40} fw={600} lh={1.2} color='white'>
            Footer
          </Text>
        </Center>
      </Container>
    </Box>
  );
}

export default Footer;
