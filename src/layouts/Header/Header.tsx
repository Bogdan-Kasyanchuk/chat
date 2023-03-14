import { Button, Container, Group, Text, rem } from '@mantine/core';
import { IconMessages } from '@tabler/icons-react';

import useStyles from './Header.styles';
import MenuUser from '@/components/UserMenu';

function Header() {
  const { classes } = useStyles();

  return (
    <div className={classes.header}>
      <Container p={10}>
        <Group position='apart'>
          <Group spacing={10}>
            <IconMessages size={32} />
            <Text fz={24} fw={600} lh={rem(40)}>
              Chat
            </Text>
          </Group>
          {true ? (
            <MenuUser />
          ) : true ? (
            <Button compact size='lg' radius={0} uppercase className={classes.button}>
              Login
            </Button>
          ) : (
            <Button compact size='lg' radius={0} uppercase className={classes.button}>
              Home
            </Button>
          )}
        </Group>
      </Container>
    </div>
  );
}

export default Header;
