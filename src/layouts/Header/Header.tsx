import type { FC } from 'react';
import { Link, useMatch } from 'react-router-dom';

import { Container, Group, Text, rem } from '@mantine/core';

import { IconMessages } from '@tabler/icons-react';

import { ButtonCustom, UserMenu } from '@/components';

import useStyles from './Header.styles';

const Header: FC = () => {
  const { classes: c } = useStyles();
  const matchLogin = useMatch('/login');
  const matchRegister = useMatch('/register');
  const matchChat = useMatch('/chat');

  return (
    <Container p={10} bg='dark.5'>
      <Group position='apart' spacing={20}>
        <Link to='/' className={c.logo}>
          <Group spacing={10}>
            <IconMessages size={32} />
            <Text fz={24} fw={600} lh={rem(40)} color='white'>
              Chat
            </Text>
          </Group>
        </Link>
        {matchChat ? (
          <UserMenu />
        ) : (
          (matchLogin || matchRegister) && (
            <Link to='/'>
              <ButtonCustom
                type='button'
                variant='filled-white'
                compact
                size='lg'
                uppercase
                className={c.btn}
              >
                Home
              </ButtonCustom>
            </Link>
          )
        )}
      </Group>
    </Container>
  );
};

export default Header;
