import { TextInput, Title } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import type { FC, ReactNode, Ref } from 'react';

import classes from './SidebarHeader.module.css';

type SidebarHeaderProps = {
    // Заголовок екрана на телефоні (32 / 700); на десктопі його немає
    title?: string,
    // Ліворуч від пошуку на десктопі: ☰ або «назад»
    start?: ReactNode,
    // Праворуч від заголовка на телефоні: «New chat»
    end?: ReactNode,
    searchLabel: string,
    search: string,
    onSearch: (value: string) => void,
    searchRef?: Ref<HTMLInputElement>
};

// Шапка бічної панелі (Chats, Contacts, MobileChats, MobileContacts): кнопка й пошук у рядок на десктопі,
// заголовок над пошуком на телефоні. Пошук — поле field з радіусом 25
const SidebarHeader: FC<SidebarHeaderProps> = ({ title, start, end, searchLabel, search, onSearch, searchRef }) => {
    const input = (
        <TextInput
            ref={ searchRef }
            type="search"
            variant="filled"
            radius={ 25 }
            className={ classes.search }
            classNames={ { input: classes.input } }
            placeholder={ searchLabel }
            aria-label={ searchLabel }
            leftSection={
                <IconSearch
                    size={ 18 }
                    aria-hidden
                />
            }
            value={ search }
            onChange={ e => {
                onSearch(e.currentTarget.value);
            } }
        />
    );

    if (title === undefined) {
        return (
            <div className={ classes.row }>
                { start }
                { input }
            </div>
        );
    }

    return (
        <header className={ classes.screen }>
            <div className={ classes.titleRow }>
                <Title
                    order={ 1 }
                    className={ classes.title }
                >
                    { title }
                </Title>
                { end }
            </div>
            { input }
        </header>
    );
};

export default SidebarHeader;
