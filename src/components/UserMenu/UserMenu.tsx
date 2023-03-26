import { IconChevronDown, IconLogout, IconSettings } from '@tabler/icons-react';
import { MouseEvent, useState } from 'react';

import { Avatar, Group, Indicator, Menu, Text, UnstyledButton } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

import useUser from '@/hooks/useUser';

import showError from '@/helpers/showError';

import { TStatusUser } from '@/types';

import { dataUser } from '@/data/dataUser';

import useStyles from './UserMenu.styles';

function UserMenu() {
  const { classes, cx } = useStyles();
  const [userMenuOpened, setUserMenuOpened] = useState<boolean>(false);
  const [userStatus, setUserStatus] = useState<TStatusUser>('Online');
  const { auth, displayName, photoURL } = useUser();
  const min_576 = useMediaQuery('(min-width: 36em)');

  const STATUS: { [x: string]: string } = {
    Online: classes.userStatusOnline,
    Offline: classes.userStatusOffline,
    'Do not disturb': classes.userStatusDoNotDisturb,
    'Out of place': classes.userStatusOutOfPlace,
  };

  const setStatus = (e: MouseEvent<HTMLButtonElement>) => {
    setUserStatus((e.target as HTMLButtonElement).textContent as TStatusUser);
  };

  return (
    <Menu
      width={200}
      position='bottom-end'
      transitionProps={{ transition: 'pop-top-right' }}
      onChange={() => setUserMenuOpened(!userMenuOpened)}
      withinPortal
      classNames={{ dropdown: classes.menu, item: classes.menuItem }}
    >
      <Menu.Target>
        <UnstyledButton p={4}>
          <Group spacing={10}>
            {min_576 && (
              <>
                <IconChevronDown size={24} className={classes.userIcon} stroke={2} />
                <Text fz={18} fw={600} color='white'>
                  {displayName ?? dataUser.name}
                </Text>
              </>
            )}
            <Indicator
              inline
              size={16}
              offset={4}
              position='bottom-end'
              withBorder
              classNames={{ indicator: STATUS[`${userStatus}`] }}
            >
              <Avatar size={32} radius='xl' src={photoURL ?? dataUser.image} alt={dataUser.name} />
            </Indicator>
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        {!min_576 && (
          <Text fz={18} fw={600} px={12} py={10} bg='gray.1'>
            {displayName ?? dataUser.name}
          </Text>
        )}
        <Menu.Divider m={0} className={classes.menuDivider} />
        {Object.keys(STATUS).map((el) => (
          <Menu.Item
            key={el}
            icon={<div className={cx(classes.userStatus, STATUS[`${el}`])} />}
            onClick={setStatus}
            fw={500}
          >
            {el}
          </Menu.Item>
        ))}
        <Menu.Divider m={0} className={classes.menuDivider} />
        <Menu.Item icon={<IconSettings size={16} stroke={1.5} />} fw={500}>
          Account settings
        </Menu.Item>
        <Menu.Item
          icon={<IconLogout size={16} stroke={1.5} />}
          onClick={() => {
            auth.signOut().catch((error) => {
              showError(error);
            });
          }}
          fw={500}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export default UserMenu;
