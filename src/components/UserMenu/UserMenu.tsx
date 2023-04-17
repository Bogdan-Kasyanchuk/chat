import type { FC, MouseEvent } from 'react';

import { Avatar, Group, Indicator, Menu, Text, UnstyledButton, rem } from '@mantine/core';
import { useDidUpdate, useMediaQuery } from '@mantine/hooks';

import { IconChevronDown, IconLogout, IconSettings, IconTrash } from '@tabler/icons-react';

import { deleteUser, firebaseAuth, updateStatusUser, updateUser } from '@/service/firebase';

import { useClassStatus, useStylesGlobal, useUser } from '@/hooks';

import { firstTUC, showError } from '@/helpers';

import type { TStatusUser } from '@/types';

import useStyles from './UserMenu.styles';

const UserMenu: FC = () => {
  const { classes: c, cx } = useStyles();
  const { classes: cG } = useStylesGlobal();
  const { name, avatar, status, idUser } = useUser();
  const { allStatus, userStatus, setUserStatus } = useClassStatus();
  const min_576 = useMediaQuery(`(min-width: ${rem(576)})`);

  useDidUpdate(() => {
    if (!status) {
    }

    setUserStatus(status);
  }, [status]);

  const setStatus = (e: MouseEvent<HTMLButtonElement>) => {
    const status = (e.target as HTMLButtonElement).textContent?.toLowerCase() as TStatusUser;

    setUserStatus(status);
    updateStatusUser(idUser, status);
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
                <IconChevronDown className={c.userIcon} stroke={2} />
                <Text component='p' fz={18} fw={600} color='white'>
                  {name}
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
              <Avatar size={32} radius='xl' src={avatar} alt={name} />
            </Indicator>
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        {!min_576 && (
          <Text component='p' fz={18} fw={600} px={12} py={10} bg='gray.2'>
            {name}
          </Text>
        )}
        <Menu.Divider m={0} className={cG.borderT} />
        {Object.keys(allStatus).map((el) => (
          <Menu.Item
            key={el}
            icon={<div className={cx(c.userStatus, allStatus[`${el as TStatusUser}`])} />}
            onClick={setStatus}
            fw={500}
          >
            {firstTUC(el)}
          </Menu.Item>
        ))}
        <Menu.Divider m={0} className={cG.borderT} />
        <Menu.Item
          icon={<IconSettings size={16} stroke={1.5} />}
          onClick={() => {
            updateUser(idUser, {
              name: 'Igor Fed',
              avatar: 'https://i.stack.imgur.com/kpHGQ.jpg?s=64&g=1',
            });
          }}
          fw={500}
        >
          Update profile
        </Menu.Item>
        <Menu.Item
          color='red.7'
          icon={<IconTrash size={16} stroke={1.5} />}
          onClick={() => {
            deleteUser(idUser);
          }}
          fw={500}
        >
          Delete profile
        </Menu.Item>
        <Menu.Divider m={0} className={cG.borderT} />
        <Menu.Item
          icon={<IconLogout size={16} stroke={1.5} />}
          onClick={() => {
            firebaseAuth.signOut().catch((error) => {
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
};

export default UserMenu;
