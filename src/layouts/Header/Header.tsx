import { IconMessages } from '@tabler/icons-react';
import { Link, useMatch } from 'react-router-dom';

import { Container, Group, Text, rem } from '@mantine/core';

import useStyles from './Header.styles';
import { ButtonCustom, UserMenu } from '@/components';

function Header() {
  const { classes } = useStyles();
  const matchLogin = useMatch('/login');
  const matchRegister = useMatch('/register');
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
            <UserMenu />
          ) : (
            (matchLogin || matchRegister) && (
              <Link to='/'>
                <ButtonCustom variant='filled-grey' compact size='lg' uppercase>
                  Home
                </ButtonCustom>
              </Link>
            )
          )}
        </Group>
      </Container>
    </div>
  );
}

export default Header;
