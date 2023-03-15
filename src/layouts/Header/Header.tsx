import { IconMessages } from '@tabler/icons-react';
import { Link, useMatch } from 'react-router-dom';

import { Button, Container, Group, Text, rem } from '@mantine/core';

import MenuUser from '@/components/UserMenu';

import useStyles from './Header.styles';

function Header() {
  const { classes } = useStyles();
  const matchLogin = useMatch('/login');
  const matchChat = useMatch('/chat');

  return (
    <div className={classes.header}>
      <Container p={10}>
        <Group position='apart' spacing={20}>
          <Link to='/' className={classes.logo}>
            <Group spacing={10}>
              <IconMessages size={32} />
              <Text fz={24} fw={600} lh={rem(40)}>
                Chat
              </Text>
            </Group>
          </Link>
          {matchChat ? (
            <MenuUser />
          ) : (
            <>
              <Link to='/chat'>
                <Button variant='filled-grey' compact size='lg' uppercase>
                  Chat
                </Button>
              </Link>
              {matchLogin ? (
                <Link to='/'>
                  <Button variant='filled-grey' compact size='lg' uppercase>
                    Home
                  </Button>
                </Link>
              ) : true ? (
                <Link to='/login'>
                  <Button variant='filled-grey' compact size='lg' uppercase>
                    Login
                  </Button>
                </Link>
              ) : (
                <Button
                  variant='filled-grey'
                  compact
                  size='lg'
                  uppercase
                  // onClick={userAuth}
                >
                  Logout
                </Button>
              )}
            </>
          )}
        </Group>
      </Container>
    </div>
  );
}

export default Header;
