import { UnstyledButton } from '@mantine/core';
import { IconMessageCircle, IconSettings, IconUsers } from '@tabler/icons-react';
import type { FC } from 'react';

import type { SidebarView } from '@/types/sidebar';

import classes from './BottomTabs.module.css';

type BottomTabsProps = {
    view: SidebarView,
    // Сума непрочитаних у не замʼючених чатах
    unread: number,
    onSelect: (view: SidebarView) => void
};

const MAX_BADGE = 99;

const TABS = [
    { view: 'chats', label: 'Chats', Icon: IconMessageCircle },
    { view: 'contacts', label: 'Contacts', Icon: IconUsers },
    { view: 'settings', label: 'Settings', Icon: IconSettings }
] as const;

// Артборд MobileChats: три вкладки знизу, поточна — кольору акценту, лічильник непрочитаних на «Chats»
const BottomTabs: FC<BottomTabsProps> = ({ view, unread, onSelect }) => (
    <nav
        aria-label="Sections"
        className={ classes.tabs }
    >
        { TABS.map(({ view: tab, label, Icon }) => (
            <UnstyledButton
                key={ tab }
                className={ classes.tab }
                aria-current={ tab === view ? 'page' : undefined }
                onClick={ () => {
                    onSelect(tab);
                } }
            >
                <Icon
                    size={ 24 }
                    stroke={ 1.8 }
                    aria-hidden
                />
                { label }
                { tab === 'chats' && unread > 0 && (
                    <span className={ classes.badge }>{ unread > MAX_BADGE ? `${ MAX_BADGE }+` : unread }</span>
                ) }
            </UnstyledButton>
        )) }
    </nav>
);

export default BottomTabs;
