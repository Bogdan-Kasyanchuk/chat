import { IconChevronDown, IconLogout, IconSettings } from '@tabler/icons-react';
import { MouseEvent, useState } from 'react';

import { Avatar, Group, Indicator, Menu, Text, UnstyledButton, rem } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

import useClassStatus from '@/hooks/useClassStatus';
import useUser from '@/hooks/useUser';

import firstTUC from '@/helpers/firstTUC';
import showError from '@/helpers/showError';

import { TStatusUser } from '@/types';

import { dataUser } from '@/data/dataUser';

import useStyles from './UserMenu.styles';

function UserMenu() {
  const { classes: c, cx } = useStyles();
  const [userMenuOpened, setUserMenuOpened] = useState<boolean>(false);
  const { allStatus, userStatus, setUserStatus } = useClassStatus('online');
  const { auth, displayName, photoURL } = useUser();
  const min_576 = useMediaQuery(`(min-width: ${rem(576)})`);

  const setStatus = (e: MouseEvent<HTMLButtonElement>) => {
    setUserStatus((e.target as HTMLButtonElement).textContent?.toLowerCase() as TStatusUser);
  };

  return (
    <Menu
      width={200}
      position='bottom-end'
      transitionProps={{ transition: 'scale-y' }}
      onChange={() => setUserMenuOpened(!userMenuOpened)}
      withinPortal
      classNames={{ dropdown: c.menu, item: c.menuItem }}
    >
      <Menu.Target>
        <UnstyledButton p={4}>
          <Group spacing={10}>
            {min_576 && (
              <>
                <IconChevronDown size={24} className={c.userIcon} stroke={2} />
                <Text component='p' fz={18} fw={600} color='white'>
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
              classNames={{ indicator: userStatus }}
            >
              <Avatar size={32} radius='xl' src={photoURL ?? dataUser.image} alt={dataUser.name} />
            </Indicator>
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        {!min_576 && (
          <Text component='p' fz={18} fw={600} px={12} py={10} bg='gray.1'>
            {displayName ?? dataUser.name}
          </Text>
        )}
        <Menu.Divider className={c.menuDivider} />
        {Object.keys(allStatus).map((el) => (
          <Menu.Item
            key={el}
            icon={<div className={cx(c.userStatus, allStatus[`${el}`])} />}
            onClick={setStatus}
            fw={500}
          >
            {firstTUC(el)}
          </Menu.Item>
        ))}
        <Menu.Divider className={c.menuDivider} />
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
