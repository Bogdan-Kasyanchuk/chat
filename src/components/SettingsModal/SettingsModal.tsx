import { Modal, Tabs } from '@mantine/core';
import { useQuery } from 'convex/react';
import type { FC } from 'react';

import AccountSettings from '@/components/AccountSettings';
import AvatarUpload from '@/components/AvatarUpload';
import ProfileSettings from '@/components/ProfileSettings';
import SoundSettings from '@/components/SoundSettings';
import useIsDesktop from '@/hooks/useIsDesktop';
import { api } from '@convex/_generated/api';

type SettingsModalProps = {
    opened: boolean,
    onClose: () => void
};

const SettingsModal: FC<SettingsModalProps> = ({ opened, onClose }) => {
    const me = useQuery(api.users.me);
    const isDesktop = useIsDesktop();

    return (
        <Modal
            opened={ opened }
            title="Settings"
            fullScreen={ !isDesktop }
            centered
            onClose={ onClose }
        >
            { me && (
                <Tabs defaultValue="profile">
                    <Tabs.List mb="md">
                        <Tabs.Tab value="profile">Profile</Tabs.Tab>
                        <Tabs.Tab value="notifications">Notifications</Tabs.Tab>
                        <Tabs.Tab value="account">Account</Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="profile">
                        <AvatarUpload
                            name={ me.name }
                            avatar={ me.avatar }
                        />
                        <ProfileSettings name={ me.name } />
                    </Tabs.Panel>
                    <Tabs.Panel value="notifications">
                        <SoundSettings sound={ me.sound } />
                    </Tabs.Panel>
                    <Tabs.Panel value="account">
                        <AccountSettings onDeleted={ onClose } />
                    </Tabs.Panel>
                </Tabs>
            ) }
        </Modal>
    );
};

export default SettingsModal;
