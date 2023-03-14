import { Center, Container, Text } from '@mantine/core';

import useStyles from './Footer.styles';

function Footer() {
  const { classes } = useStyles();

  return (
    <div className={classes.footer}>
      <Container p={10}>
        <Center>
          <Text fz={40} fw={600} lh={1.2}>
            Footer
          </Text>
        </Center>
      </Container>
    </div>
  );
}

export default Footer;
