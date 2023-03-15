import { IconMessages } from '@tabler/icons-react';

import { Button, Container, Group, Text, rem } from '@mantine/core';

import MenuUser from '@/components/UserMenu';

import useStyles from './Header.styles';

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
          {false ? (
            <MenuUser />
          ) : false ? (
            <Button variant='filled-grey' compact size='lg' uppercase>
              Login
            </Button>
          ) : (
            <Button variant='filled-grey' compact size='lg' uppercase>
              Home
            </Button>
          )}
        </Group>
      </Container>
    </div>
  );
}

export default Header;
