import type { ReactNode, Ref } from 'react';

// Підміна frimousse для тестів: у jsdom немає ні мережі, ні віртуалізації списку.
// Root рендерить одну кнопку «😀», яка викликає onEmojiSelect; List — контейнери категорій, як frimousse
// (усі категорії в DOM, позиція — offsetTop), щоб перевірити вкладки.
type RootProps = {
    children?: ReactNode,
    className?: string,
    skinTone?: string,
    onEmojiSelect?: (emoji: { emoji: string, label: string }) => void
};

// Назви груп emojibase (public/emojibase/en/messages.json)
const MOCK_CATEGORIES = [ 'smileys & emotion', 'people & body', 'animals & nature', 'food & drink', 'travel & places', 'activities', 'objects', 'symbols', 'flags' ];

export const frimousseMock = {
    EmojiPicker: {
        Root: ({ children, onEmojiSelect, skinTone }: RootProps) => (
            <div data-skin-tone={ skinTone }>
                <button
                    type="button"
                    onClick={ () => {
                        onEmojiSelect?.({ emoji: '😀', label: 'grinning face' });
                    } }
                >
                    😀
                </button>
                { children }
            </div>
        ),
        Search: () => <input aria-label="Search emoji" />,
        SkinToneSelector: () => <button type="button">Skin tone</button>,
        Viewport: ({ children, ref }: { children?: ReactNode, ref?: Ref<HTMLDivElement> }) => (
            <div
                ref={ ref }
                data-testid="emoji-viewport"
            >
                { children }
            </div>
        ),
        Loading: () => null,
        Empty: () => null,
        List: () => (
            <div>
                { MOCK_CATEGORIES.map(label => (
                    <div
                        key={ label }
                        frimousse-category=""
                    >
                        <div frimousse-category-header="">{ label }</div>
                    </div>
                )) }
            </div>
        ),
        ActiveEmoji: ({ children }: { children: (props: { emoji?: { emoji: string, label: string } }) => ReactNode }) => children({ emoji: undefined })
    },
    useSkinTone: () => [ 'none', () => {} ]
};
