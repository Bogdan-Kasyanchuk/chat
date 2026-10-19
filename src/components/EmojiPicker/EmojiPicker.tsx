import { Loader, Text } from '@mantine/core';
import { EmojiPicker as Picker, type SkinTone, useSkinTone } from 'frimousse';
import { type FC, useEffect, useState } from 'react';

import useIsDesktop from '@/hooks/useIsDesktop';
import { pushRecent, readRecent, readSkinTone, writeRecent, writeSkinTone } from '@/lib/emoji';

import classes from './EmojiPicker.module.css';

type EmojiPickerProps = {
    onSelect: (emoji: string) => void
};

const SKIN_TONES: SkinTone[] = [ 'none', 'light', 'medium-light', 'medium', 'medium-dark', 'dark' ];

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

const EmojiPicker: FC<EmojiPickerProps> = ({ onSelect }) => {
    const isDesktop = useIsDesktop();
    const [ recent, setRecent ] = useState(readRecent);
    const [ skinTone ] = useState(initialSkinTone);

    const pick = (emoji: string) => {
        const next = pushRecent(recent, emoji);

        setRecent(next);
        writeRecent(next);
        onSelect(emoji);
    };

    return (
        <Picker.Root
            className={ classes.root }
            data-desktop={ isDesktop || undefined }
            emojibaseUrl="/emojibase"
            locale="en"
            columns={ isDesktop ? 9 : 8 }
            skinTone={ skinTone }
            onEmojiSelect={ ({ emoji }) => {
                pick(emoji);
            } }
        >
            <SkinToneSaver />
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
            { recent.length > 0 && (
                <div className={ classes.recent }>
                    <Text
                        size="xs"
                        fw={ 600 }
                        c="dimmed"
                    >
                        Recently used
                    </Text>
                    <div className={ classes.recentRow }>
                        { recent.map(emoji => (
                            <button
                                key={ emoji }
                                type="button"
                                className={ classes.recentEmoji }
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
            <Picker.Viewport className={ classes.viewport }>
                <Picker.Loading className={ classes.state }>
                    <Loader size="sm" />
                </Picker.Loading>
                <Picker.Empty className={ classes.state }>No emoji found</Picker.Empty>
                <Picker.List className={ classes.list } />
            </Picker.Viewport>
        </Picker.Root>
    );
};

export default EmojiPicker;
