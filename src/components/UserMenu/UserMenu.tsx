import { Avatar, Group, Indicator, Menu, Text, UnstyledButton } from '@mantine/core';
import { IconChevronDown, IconLogout, IconSettings } from '@tabler/icons-react';
import { MouseEvent, useState } from 'react';

import { TStatusUser } from '@/types';

import { dataUser } from '@/data/dataUser';

import useStyles from './UserMenu.styles';

function Header() {
  const { classes, cx } = useStyles();
  const [userMenuOpened, setUserMenuOpened] = useState<boolean>(false);
  const [userStatus, setUserStatus] = useState<TStatusUser>('Online');

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
      radius={0}
      position='bottom-end'
      transitionProps={{ transition: 'pop-top-right' }}
      onChange={() => setUserMenuOpened(!userMenuOpened)}
      withinPortal
      classNames={{ dropdown: classes.menu, item: classes.menuItem }}
    >
      <Menu.Target>
        <UnstyledButton
          p={4}
          className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
        >
          <Group spacing={10}>
            <IconChevronDown size={24} className={classes.userIcon} stroke={2} />
            <Text fz={18} fw={600}>
              {dataUser.name}
            </Text>
            <Indicator
              inline
              size={16}
              offset={4}
              position='bottom-end'
              withBorder
              classNames={{ indicator: STATUS[`${userStatus}`] }}
            >
              <Avatar size={32} radius='xl' src={dataUser.image} alt={dataUser.name} />
            </Indicator>
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        {Object.keys(STATUS).map((el) => (
          <Menu.Item
            key={el}
            icon={<div className={cx(classes.userStatus, STATUS[`${el}`])} />}
            onClick={setStatus}
          >
            {el}
          </Menu.Item>
        ))}
        <Menu.Divider className={classes.menuDivider} />
        <Menu.Item icon={<IconSettings size={16} stroke={1.5} />}>Account settings</Menu.Item>
        <Menu.Item icon={<IconLogout size={16} stroke={1.5} />}>Logout</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export default Header;
