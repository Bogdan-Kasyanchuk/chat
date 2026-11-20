import { ActionIcon, Menu } from '@mantine/core';
import { IconMenu2, IconMessageCircle, IconSettings, IconUsers } from '@tabler/icons-react';
import type { FC } from 'react';

import type { SidebarView } from '@/types/sidebar';

import classes from './MainMenu.module.css';

type MainMenuProps = {
    view: SidebarView,
    onSelect: (view: SidebarView) => void
};

const ITEMS = [
    { view: 'chats', label: 'Chats', Icon: IconMessageCircle },
    { view: 'contacts', label: 'Contacts', Icon: IconUsers },
    { view: 'settings', label: 'Settings', Icon: IconSettings }
] as const;

// Артборд MainMenu: кнопка ☰ 44 у шапці бічної панелі, меню 220 з пунктами 44, поточний розділ — на тлі field
const MainMenu: FC<MainMenuProps> = ({ view, onSelect }) => (
    <Menu
        position="bottom-start"
        width={ 220 }
    >
        <Menu.Target>
            <ActionIcon
                variant="subtle"
                color="gray"
                aria-label="Open menu"
                className={ classes.target }
            >
                <IconMenu2
                    size={ 22 }
                    aria-hidden
                />
            </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown aria-label="Main menu">
            { ITEMS.map(({ view: item, label, Icon }) => (
                <Menu.Item
                    key={ item }
                    className={ classes.item }
                    aria-current={ item === view ? 'page' : undefined }
                    leftSection={
                        <Icon
                            size={ 18 }
                            aria-hidden
                        />
                    }
                    onClick={ () => {
                        onSelect(item);
                    } }
                >
                    { label }
                </Menu.Item>
            )) }
        </Menu.Dropdown>
    </Menu>
);

export default MainMenu;
