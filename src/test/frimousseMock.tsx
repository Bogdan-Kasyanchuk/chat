import type { ReactNode } from 'react';

// Підміна frimousse для тестів: у jsdom немає ні мережі, ні віртуалізації списку.
// Root рендерить одну кнопку «😀», яка викликає onEmojiSelect.
type RootProps = {
    children?: ReactNode,
    className?: string,
    skinTone?: string,
    onEmojiSelect?: (emoji: { emoji: string, label: string }) => void
};

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
        Viewport: ({ children }: { children?: ReactNode }) => <div>{ children }</div>,
        Loading: () => null,
        Empty: () => null,
        List: () => null
    },
    useSkinTone: () => [ 'none', () => {} ]
};
