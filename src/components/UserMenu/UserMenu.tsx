import { Group, Menu, Skeleton, Text, UnstyledButton } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { useQuery } from 'convex/react';
import { type FC, useState } from 'react';

import ConfirmModal from '@/components/ConfirmModal';
import PresenceAvatar from '@/components/PresenceAvatar';
import useLogout from '@/hooks/useLogout';
import { api } from '@convex/_generated/api';

const UserMenu: FC = () => {
    const me = useQuery(api.users.me);
    const { logout, loading } = useLogout();
    const [ confirming, setConfirming ] = useState(false);

    if (!me) {
        return (
            <Skeleton
                height={ 40 }
                width="60%"
            />
        );
    }

    return (
        <>
            <Menu
                position="bottom-start"
                width={ 200 }
            >
                <Menu.Target>
                    <UnstyledButton aria-label="Account menu">
                        <Group
                            gap="sm"
                            wrap="nowrap"
                        >
                            <PresenceAvatar
                                name={ me.name }
                                avatar={ me.avatar }
                                size={ 40 }
                            />
                            <Text
                                fw={ 600 }
                                truncate
                            >
                                { me.name }
                            </Text>
                        </Group>
                    </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Item
                        leftSection={ <IconLogout size={ 16 } /> }
                        onClick={ () => {
                            setConfirming(true);
                        } }
                    >
                        Logout
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
            <ConfirmModal
                opened={ confirming }
                title="Log out?"
                confirmLabel="Log out"
                loading={ loading }
                onConfirm={ () => {
                    void logout();
                } }
                onClose={ () => {
                    setConfirming(false);
                } }
            >
                You will need to sign in again to read your messages.
            </ConfirmModal>
        </>
    );
};

export default UserMenu;
