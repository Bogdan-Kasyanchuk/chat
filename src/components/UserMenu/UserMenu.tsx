import { IconChevronDown, IconLogout, IconSettings } from '@tabler/icons-react';
import { MouseEvent } from 'react';

import { Avatar, Group, Indicator, Menu, Text, UnstyledButton, rem } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

import useClassStatus from '@/hooks/useClassStatus';
import useUser from '@/hooks/useUser';

import firstTUC from '@/helpers/firstTUC';
import showError from '@/helpers/showError';

import { TStatusUser } from '@/types';

import dataUser from '@/data/dataUser.json';

import useStyles from './UserMenu.styles';

function UserMenu() {
  const { classes: c, cx } = useStyles();
  const { auth, name, avatar, status } = useUser();
  const { allStatus, userStatus, setUserStatus } = useClassStatus(status);
  const min_576 = useMediaQuery(`(min-width: ${rem(576)})`);

  const setStatus = (e: MouseEvent<HTMLButtonElement>) => {
    setUserStatus((e.target as HTMLButtonElement).textContent?.toLowerCase() as TStatusUser);
  };

  return (
    <Menu
      width={200}
      position='bottom-end'
      transitionProps={{ transition: 'scale-y' }}
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
                  {name ?? dataUser.name}
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
              <Avatar
                size={32}
                radius='xl'
                src={avatar ?? dataUser.image}
                alt={name ?? dataUser.name}
              />
            </Indicator>
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        {!min_576 && (
          <Text component='p' fz={18} fw={600} px={12} py={10} bg='gray.2'>
            {name ?? dataUser.name}
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
