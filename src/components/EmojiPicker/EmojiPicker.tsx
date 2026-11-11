import { Loader } from '@mantine/core';
import { EmojiPicker as Picker, type SkinTone, useSkinTone } from 'frimousse';
import { type FC, useEffect, useRef, useState } from 'react';

import useIsDesktop from '@/hooks/useIsDesktop';
import { pushRecent, readRecent, readSkinTone, writeRecent, writeSkinTone } from '@/lib/emoji';

import classes from './EmojiPicker.module.css';

type EmojiPickerProps = {
    onSelect: (emoji: string) => void
};

const SKIN_TONES: SkinTone[] = [ 'none', 'light', 'medium-light', 'medium', 'medium-dark', 'dark' ];

const RECENT = 'Recently used';

// Вкладки з канвасу. groups — назви груп emojibase (як їх підписує frimousse), що належать вкладці:
// перша — куди веде вкладка, решта лише підсвічують її під час прокрутки (People & body, Symbols своїх вкладок не мають)
const TABS = [
    { label: 'Smileys and people', emoji: '😀', groups: [ 'smileys & emotion', 'people & body', 'components' ] },
    { label: 'Animals and nature', emoji: '🐻', groups: [ 'animals & nature' ] },
    { label: 'Food and drink', emoji: '🍔', groups: [ 'food & drink' ] },
    { label: 'Activities', emoji: '⚽', groups: [ 'activities' ] },
    { label: 'Travel and places', emoji: '🚗', groups: [ 'travel & places' ] },
    { label: 'Objects', emoji: '💡', groups: [ 'objects', 'symbols' ] },
    { label: 'Flags', emoji: '🏳️', groups: [ 'flags' ] }
] as const;

type TabLabel = typeof TABS[ number ][ 'label' ] | typeof RECENT;

const initialSkinTone = (): SkinTone => {
    const stored = readSkinTone();

    return SKIN_TONES.find(tone => tone === stored) ?? 'none';
};

// frimousse сам відтінок не зберігає: пам'ятаємо вибір у localStorage
const SkinToneSaver: FC = () => {
    const [ skinTone ] = useSkinTone();

    useEffect(() => {
        writeSkinTone(skinTone);
    }, [ skinTone ]);

    return null;
};

const tabOfGroup = (group: string) => TABS.find(tab => (tab.groups as readonly string[]).includes(group))?.label;

// frimousse 0.4 тримає в DOM контейнери всіх категорій (рядки віртуалізовано), тож позицію категорії видно з offsetTop.
// Службовий контейнер-вимірювач («Category») жодній вкладці не належить і відкидається
const categoryElements = (viewport: HTMLElement) => [ ...viewport.querySelectorAll<HTMLElement>('[frimousse-category]') ]
    .map(element => ({
        element,
        group: element.querySelector('[frimousse-category-header]')?.textContent?.trim().toLowerCase() ?? ''
    }))
    .filter(item => tabOfGroup(item.group) !== undefined);

const EmojiPicker: FC<EmojiPickerProps> = ({ onSelect }) => {
    const isDesktop = useIsDesktop();
    const [ recent, setRecent ] = useState(readRecent);
    const [ skinTone ] = useState(initialSkinTone);
    const [ activeTab, setActiveTab ] = useState<TabLabel>(TABS[ 0 ].label);
    const viewportRef = useRef<HTMLDivElement>(null);
    const columns = isDesktop ? 9 : 8;

    const pick = (emoji: string) => {
        const next = pushRecent(recent, emoji);

        setRecent(next);
        writeRecent(next);
        onSelect(emoji);
    };

    const openTab = (label: TabLabel) => {
        const viewport = viewportRef.current;

        setActiveTab(label);

        if (!viewport) {
            return;
        }

        if (label === RECENT) {
            viewport.scrollTop = 0;

            return;
        }

        const target = TABS.find(tab => tab.label === label)?.groups[ 0 ];
        const category = categoryElements(viewport).find(item => item.group === target);

        if (category) {
            viewport.scrollTop = category.element.offsetTop;
        }
    };

    // Під час прокрутки підсвічена вкладка тієї категорії, що зараз угорі списку
    const followScroll = () => {
        const viewport = viewportRef.current;

        if (!viewport) {
            return;
        }

        const current = categoryElements(viewport).filter(item => item.element.offsetTop <= viewport.scrollTop + 1).at(-1);

        setActiveTab(current ? tabOfGroup(current.group) ?? TABS[ 0 ].label : TABS[ 0 ].label);
    };

    const tabs = (
        <nav
            className={ classes.tabs }
            aria-label="Emoji categories"
        >
            { [ ...recent.length > 0 ? [ { label: RECENT, emoji: '🕘' } as const ] : [], ...TABS ].map(tab => (
                <button
                    key={ tab.label }
                    type="button"
                    className={ classes.tab }
                    aria-label={ tab.label }
                    aria-pressed={ activeTab === tab.label }
                    onClick={ () => {
                        openTab(tab.label);
                    } }
                >
                    { tab.emoji }
                </button>
            )) }
        </nav>
    );

    return (
        <Picker.Root
            className={ classes.root }
            data-desktop={ isDesktop || undefined }
            emojibaseUrl="/emojibase"
            locale="en"
            columns={ columns }
            skinTone={ skinTone }
            onEmojiSelect={ ({ emoji }) => {
                pick(emoji);
            } }
        >
            <SkinToneSaver />
            { /* На телефоні панель замінює клавіатуру: пошуку немає, вкладки зверху (MobileEmoji) */ }
            { isDesktop
                ? (
                    <div className={ classes.top }>
                        <Picker.Search
                            className={ classes.search }
                            aria-label="Search emoji"
                            placeholder="Search emoji"
                        />
                        <Picker.SkinToneSelector
                            className={ classes.tone }
                            aria-label="Skin tone"
                        />
                    </div>
                )
                : tabs }
            { recent.length > 0 && (
                <div className={ classes.recent }>
                    <p className={ classes.heading }>{ RECENT }</p>
                    <div className={ classes.grid }>
                        { /* Один рядок, як на канвасі: у пам'яті недавніх більше, але панель телефона лише 300 */ }
                        { recent.slice(0, columns).map(emoji => (
                            <button
                                key={ emoji }
                                type="button"
                                className={ classes.cell }
                                onClick={ () => {
                                    pick(emoji);
                                } }
                            >
                                { emoji }
                            </button>
                        )) }
                    </div>
                </div>
            ) }
            <Picker.Viewport
                ref={ viewportRef }
                className={ classes.viewport }
                onScroll={ followScroll }
            >
                <Picker.Loading className={ classes.state }>
                    <Loader size="sm" />
                </Picker.Loading>
                <Picker.Empty className={ classes.state }>No emoji found</Picker.Empty>
                <Picker.List className={ classes.list } />
            </Picker.Viewport>
            { isDesktop && (
                <>
                    { /* Прев'ю наведеного емодзі з назвою */ }
                    <div className={ classes.preview }>
                        <Picker.ActiveEmoji>
                            { ({ emoji }) => emoji && (
                                <>
                                    <span className={ classes.previewEmoji }>{ emoji.emoji }</span>
                                    <span className={ classes.previewLabel }>{ emoji.label }</span>
                                </>
                            ) }
                        </Picker.ActiveEmoji>
                    </div>
                    { tabs }
                </>
            ) }
        </Picker.Root>
    );
};

export default EmojiPicker;
