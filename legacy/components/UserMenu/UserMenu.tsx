import type { FC, MouseEvent } from 'react';

import { Avatar, Group, Indicator, Menu, Text, UnstyledButton } from '@mantine/core';
import { useDidUpdate, useSetState } from '@mantine/hooks';

import {
  IconLogout,
  IconMessages,
  IconSettings,
  IconTrash,
  IconUserCircle,
} from '@tabler/icons-react';

import { deleteUser, firebaseAuth, updateStatusUser } from '@/service/firebase';

import { useClassStatus, useUser } from '@/hooks';

import { showError } from '@/lib';

import { STATUS, firstTUC } from '@/helpers';

import { ModalConfirm, UpdateProfile } from '@/components';

import useStyles from './UserMenu.styles';

const UserMenu: FC = () => {
  const { classes: c, cx } = useStyles();
  const { name, avatar, status, idUser } = useUser();
  const { allStatus, userStatus, setUserStatus } = useClassStatus();
  const [state, setState] = useSetState({
    update: false,
    delete: false,
    logOut: false,
  });

  useDidUpdate(() => {
    if (!status) {
    }

    setUserStatus(status);
  }, [status]);

  const setStatus = (e: MouseEvent<HTMLButtonElement>) => {
    const status = (e.target as HTMLButtonElement).textContent?.toLowerCase();

    updateStatusUser(idUser, status as string);
  };

  return (
    <>
      <Group p={15} bg={'dark.5'} sx={{ boxShadow: '0px 4px 5px 2px rgba(18, 18, 18, 0.35)' }}>
        <Menu
          width={220}
          shadow='0px 4px 5px 2px rgba(18, 18, 18, 0.35)'
          position='bottom-start'
          transitionProps={{ transition: 'scale-y' }}
          withinPortal
          classNames={{ dropdown: c.menu, item: c.menuItem }}
        >
          <Menu.Target>
            <UnstyledButton mr='auto'>
              <Group spacing={15}>
                <Indicator
                  inline
                  size={16}
                  offset={8}
                  position='bottom-end'
                  withBorder
                  classNames={{ indicator: userStatus }}
                >
                  <Avatar
                    classNames={{ root: c.userAvatar }}
                    variant='filled'
                    size={52}
                    radius='xl'
                    src={avatar}
                    alt={name}
                  />
                </Indicator>
                <Text component='p' fz={20} fw={600} color='white' maw={150} lh={1.2}>
                  {name}
                </Text>
              </Group>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            {Object.keys(allStatus).map((el) => (
              <Menu.Item
                key={el}
                icon={<div className={cx(c.userStatus, allStatus[`${el}`])} />}
                onClick={setStatus}
              >
                {firstTUC(el)}
              </Menu.Item>
            ))}
            <Menu.Divider className={c.userDivider} />
            <Menu.Item
              icon={<IconUserCircle size={16} stroke={1.5} />}
              onClick={() => {
                setState({ update: true });
              }}
            >
              Update profile
            </Menu.Item>
            <Menu.Item icon={<IconSettings size={16} stroke={1.5} />}>General setings</Menu.Item>
            <Menu.Item
              className={c.menuItemDelete}
              icon={<IconTrash size={16} stroke={1.5} />}
              onClick={() => {
                setState({ delete: true });
              }}
            >
              Delete profile
            </Menu.Item>
            <Menu.Divider className={c.userDivider} />
            <Menu.Item
              icon={<IconLogout size={16} stroke={1.5} />}
              onClick={() => {
                setState({ logOut: true });
              }}
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        <IconMessages size={52} color='white' stroke={1.5} />
      </Group>
      <ModalConfirm
        title='Exit the chat'
        isOpened={state.logOut}
        onClose={() => {
          setState({ logOut: false });
        }}
        onConfirm={async () => {
          await updateStatusUser(idUser, STATUS.OFFLINE);
          firebaseAuth.signOut().catch((error) => {
            showError(error);
          });
        }}
      >
        Are you sure you want to exit the chat?
      </ModalConfirm>
      <ModalConfirm
        title='Delete profile'
        isOpened={state.delete}
        onClose={() => {
          setState({ delete: false });
        }}
        onConfirm={() => {
          deleteUser(idUser);
        }}
      >
        Are you sure you want to delete your profile? After that, the profile cannot be restored!
      </ModalConfirm>
      <UpdateProfile
        idUser={idUser}
        avatar={avatar}
        isOpened={state.update}
        onClose={() => {
          setState({ update: false });
        }}
      />
    </>
  );
};

export default UserMenu;
