import { ActionIcon, Text, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useQuery } from 'convex/react';
import type { FC, Ref } from 'react';

import AccountSettings from '@/components/AccountSettings';
import AppearanceSettings from '@/components/AppearanceSettings';
import AvatarUpload from '@/components/AvatarUpload';
import ProfileSettings from '@/components/ProfileSettings';
import SoundSettings from '@/components/SoundSettings';
import useIsDesktop from '@/hooks/useIsDesktop';
import { api } from '@convex/_generated/api';

import classes from './SettingsPanel.module.css';

type SettingsPanelProps = {
    onBack: () => void,
    // Стрілка «назад» на десктопі: на неї переходить фокус, коли панель відкрили з меню
    backRef?: Ref<HTMLButtonElement>
};

// Артборди Settings і MobileSettings: профіль, звуки, тема й акаунт у бічній панелі.
// На десктопі — стрілка «Back to chats», на телефоні — заголовок екрана 32 (назад ведуть нижні вкладки)
const SettingsPanel: FC<SettingsPanelProps> = ({ onBack, backRef }) => {
    const me = useQuery(api.users.me);
    const isDesktop = useIsDesktop();

    return (
        <section
            aria-label="Settings"
            className={ classes.panel }
        >
            { isDesktop && (
                <ActionIcon
                    ref={ backRef }
                    variant="subtle"
                    color="gray"
                    aria-label="Back to chats"
                    className={ classes.back }
                    onClick={ onBack }
                >
                    <IconArrowLeft
                        size={ 22 }
                        aria-hidden
                    />
                </ActionIcon>
            ) }
            <div className={ classes.content }>
                { !isDesktop && (
                    <Title
                        order={ 1 }
                        className={ classes.title }
                    >
                        Settings
                    </Title>
                ) }
                { me && (
                    <>
                        <section
                            aria-label="Profile"
                            className={ classes.profile }
                        >
                            <AvatarUpload
                                userId={ me.id }
                                name={ me.name }
                                avatar={ me.avatar }
                            />
                            <div className={ classes.person }>
                                <Text
                                    fz={ 20 }
                                    fw={ 700 }
                                    lh={ 1.2 }
                                    className={ classes.text }
                                >
                                    { me.name }
                                </Text>
                                <Text
                                    size="sm"
                                    c="var(--chat-muted)"
                                    className={ classes.text }
                                >
                                    { me.email }
                                </Text>
                            </div>
                        </section>
                        <ProfileSettings name={ me.name } />
                        <SoundSettings sound={ me.sound } />
                        <AppearanceSettings />
                        <AccountSettings />
                    </>
                ) }
            </div>
        </section>
    );
};

export default SettingsPanel;
