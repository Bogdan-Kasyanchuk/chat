import { ActionIcon, Avatar, Badge, Button, Checkbox, DEFAULT_THEME, Divider, Notification, PasswordInput, Radio, TextInput, Textarea, mergeMantineTheme, rem } from '@mantine/core';
import { screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import contrastRatio from '@/lib/contrast';
import { renderWithProviders } from '@/test/render';
import theme, { TOKENS, cssVariablesResolver } from '@/theme';
import type { ChatToken } from '@/theme';

describe('contrastRatio', () => {
    test('black on white is 21', () => {
        expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    });

    test('does not depend on the order or the case of the colours', () => {
        expect(contrastRatio('#ffffff', '#0B7A75')).toBeCloseTo(contrastRatio('#0b7a75', '#FFFFFF'), 10);
    });

    test('a colour on itself is 1', () => {
        expect(contrastRatio('#5A6B68', '#5A6B68')).toBe(1);
    });
});

describe('TOKENS', () => {
    // Review Focus 1: час, галочки, бейджі й приглушений текст читаються в обох темах
    test.each([ 'light', 'dark' ] as const)('%s text tokens keep 4.5:1 contrast', scheme => {
        const t = TOKENS[ scheme ];
        const pairs: Array<[ ChatToken, ChatToken ]> = [
            [ '--chat-bubble-in-text', '--chat-bubble-in' ],
            [ '--chat-bubble-out-text', '--chat-bubble-out' ],
            [ '--chat-bubble-meta', '--chat-bubble-in' ],
            [ '--chat-bubble-meta', '--chat-bubble-out' ],
            [ '--chat-date-chip-text', '--chat-date-chip' ],
            [ '--chat-active-text', '--chat-active' ],
            [ '--chat-text', '--chat-sidebar-bg' ],
            [ '--chat-muted', '--chat-sidebar-bg' ],
            [ '--chat-accent-text', '--chat-sidebar-bg' ],
            [ '--chat-danger', '--chat-sidebar-bg' ],
            [ '--chat-badge-text', '--chat-badge' ],
            [ '--chat-badge-muted-text', '--chat-badge-muted' ],
            [ '--chat-toast-text', '--chat-toast-bg' ],
            [ '--chat-active-muted', '--chat-active' ],
            [ '--chat-on-accent', '--chat-accent' ],
            [ '--chat-on-danger', '--chat-danger-solid' ],
            [ '--chat-danger', '--chat-danger-soft' ],
            [ '--chat-muted', '--chat-field' ],
            [ '--chat-muted', '--chat-popover' ],
            [ '--chat-text', '--chat-field' ],
            [ '--chat-text', '--chat-popover' ],
            [ '--chat-accent-text', '--chat-popover' ],
            [ '--chat-danger', '--chat-popover' ]
        ];
        // Іконки (3:1): помилка й успіх у toast
        const icons: Array<[ ChatToken, ChatToken ]> = [
            [ '--chat-toast-danger', '--chat-toast-bg' ],
            [ '--chat-toast-accent', '--chat-toast-bg' ],
            [ '--chat-tick-read', '--chat-bubble-out' ],
            [ '--chat-tick', '--chat-bubble-out' ],
            [ '--chat-tick-read', '--chat-bubble-in' ]
        ];

        for (const [ icon, bg ] of icons) {
            expect(contrastRatio(t[ icon ], t[ bg ]), `${ icon } on ${ bg }`).toBeGreaterThanOrEqual(3);
        }

        for (const [ text, bg ] of pairs) {
            expect(contrastRatio(t[ text ], t[ bg ]), `${ text } on ${ bg }`).toBeGreaterThanOrEqual(4.5);
        }
    });

    test('both schemes define the same tokens', () => {
        expect(Object.keys(TOKENS.dark).sort()).toEqual(Object.keys(TOKENS.light).sort());
    });

    test('every token from the plan exists and lives under the --chat- prefix', () => {
        const required: ChatToken[] = [
            '--chat-sidebar-bg', '--chat-bg', '--chat-pattern',
            '--chat-bubble-in', '--chat-bubble-in-text', '--chat-bubble-out', '--chat-bubble-out-text', '--chat-bubble-meta',
            '--chat-tick', '--chat-tick-read',
            '--chat-badge', '--chat-badge-muted',
            '--chat-text', '--chat-muted', '--chat-accent-text', '--chat-danger',
            '--chat-online', '--chat-line', '--chat-hover', '--chat-active', '--chat-active-text', '--chat-date-chip', '--chat-date-chip-text'
        ];

        expect(Object.keys(TOKENS.light)).toEqual(expect.arrayContaining(required));
        expect(Object.keys(TOKENS.light).every(key => key.startsWith('--chat-'))).toBe(true);
    });

    // Кільце фокусу поля з помилкою — dangerRing з об'єктів L / D у Chats.dc.html
    test('a field with an error has its own soft danger focus ring', () => {
        expect(TOKENS.light[ '--chat-danger-ring' ]).toBe('rgba(194, 55, 44, 0.18)');
        expect(TOKENS.dark[ '--chat-danger-ring' ]).toBe('rgba(255, 138, 122, 0.25)');
    });

    test('cssVariablesResolver hands the tokens to each scheme', () => {
        const resolved = cssVariablesResolver(mergeMantineTheme(DEFAULT_THEME, theme));

        expect(resolved.light).toMatchObject(TOKENS.light);
        expect(resolved.dark).toMatchObject(TOKENS.dark);
    });

    // Кольори Mantine, які бачать усі компоненти, беруться з токенів: помилки, приглушений текст, посилання, тло полів
    test('Mantine text, error, dimmed and link colours come from the tokens', () => {
        const resolved = cssVariablesResolver(mergeMantineTheme(DEFAULT_THEME, theme));

        for (const scheme of [ resolved.light, resolved.dark ]) {
            expect(scheme).toMatchObject({
                '--mantine-color-body': 'var(--chat-sidebar-bg)',
                '--mantine-color-text': 'var(--chat-text)',
                '--mantine-color-error': 'var(--chat-danger)',
                '--mantine-color-dimmed': 'var(--chat-muted)',
                '--mantine-color-anchor': 'var(--chat-accent-text)',
                // Плейсхолдер — muted: сірий Mantine (gray-5 / dark-3) не дотягує до 4.5:1
                '--mantine-color-placeholder': 'var(--chat-muted)',
                // c="red" і червоні пункти меню — той самий danger, що й помилки полів (у темній Mantine дав би red-4)
                '--mantine-color-red-text': 'var(--chat-danger)'
            });
        }

        expect(resolved.dark).toMatchObject({
            '--mantine-color-default': 'var(--chat-sidebar-bg)',
            '--mantine-color-default-hover': 'var(--chat-hover)'
        });
    });

    test('the canvas line-height is 1.35 for text and 1.2 for headings', () => {
        expect(theme.lineHeights?.md).toBe('1.35');
        expect(theme.headings?.sizes?.h1).toMatchObject({ fontSize: rem(42), lineHeight: '1.2' });
        expect(theme.headings?.sizes?.h2).toMatchObject({ fontSize: rem(28), lineHeight: '1.2' });
        expect(theme.headings?.sizes?.h3).toMatchObject({ fontSize: rem(20), lineHeight: '1.2' });
    });
});

// Розміри з канвасу (Components → control sizes): звичайні поля й кнопки 44px з текстом 18, size="lg" — 50px з текстом 18
describe('control sizes', () => {
    const wrapperStyle = (label: string) => (screen.getByLabelText(label).parentElement as HTMLElement).style;

    test('text, password and multiline fields are 44px with 18px text by default', () => {
        renderWithProviders(
            <>
                <TextInput label="Email" />
                <PasswordInput label="Password" />
                <Textarea label="Message" />
            </>
        );

        for (const label of [ 'Email', 'Message' ]) {
            expect(wrapperStyle(label).getPropertyValue('--input-height')).toBe(rem(44));
            expect(wrapperStyle(label).getPropertyValue('--input-fz')).toBe('var(--mantine-font-size-lg)');
        }

        const password = screen.getByLabelText('Password').closest('.mantine-PasswordInput-wrapper') as HTMLElement;

        expect(password.style.getPropertyValue('--input-height')).toBe(rem(44));
    });

    // Поле на тлі сторінки з рамкою в обох темах; filled — тло field, як пошук на канвасі
    test('fields sit on the page background with a border, filled ones on the field colour', () => {
        renderWithProviders(
            <>
                <TextInput label="Email" />
                <TextInput
                    label="Search"
                    variant="filled"
                />
            </>
        );

        expect(wrapperStyle('Email').getPropertyValue('--input-bg')).toBe('var(--chat-sidebar-bg)');
        expect(wrapperStyle('Email').getPropertyValue('--input-bd')).toBe('var(--chat-border)');
        expect(wrapperStyle('Search').getPropertyValue('--input-bg')).toBe('var(--chat-field)');
    });

    test('a field with an error keeps Mantine\'s error border', () => {
        renderWithProviders(
            <TextInput
                label="Email"
                error="Enter a valid email"
            />
        );

        expect(wrapperStyle('Email').getPropertyValue('--input-bd')).toBe('');
    });

    // На канвасі (Main, SignUp, «Auth · dark») червоні лише рамка й підпис помилки: текст, плейсхолдер
    // і кнопка з оком лишаються своїх кольорів (Mantine фарбує їх у колір помилки)
    test('a field with an error keeps its text, placeholder and icon colours', () => {
        renderWithProviders(
            <TextInput
                label="Email"
                error="Enter a valid email"
            />
        );

        expect(wrapperStyle('Email').getPropertyValue('--input-color')).toBe('var(--mantine-color-text)');
        expect(wrapperStyle('Email').getPropertyValue('--input-placeholder-color')).toBe('var(--mantine-color-placeholder)');
        expect(wrapperStyle('Email').getPropertyValue('--input-section-color')).toBe('var(--chat-muted)');
    });

    test('size="lg" fields keep Mantine\'s 50px', () => {
        renderWithProviders(
            <TextInput
                label="Email"
                size="lg"
            />
        );

        expect(wrapperStyle('Email').getPropertyValue('--input-height')).toBe('var(--input-height-lg)');
    });

    test('field labels are 14 / 600 at every size, hints and errors 12', () => {
        renderWithProviders(
            <TextInput
                label="Email"
                size="lg"
                error="Wrong email or password"
            />
        );
        const label = screen.getByText('Email');
        const error = screen.getByText('Wrong email or password');

        expect(label.style.fontSize).toBe('var(--mantine-font-size-sm)');
        expect(label.style.fontWeight).toBe('600');
        expect(error.style.fontSize).toBe('var(--mantine-font-size-xs)');
    });

    test('buttons are 44px with 18px text by default', () => {
        renderWithProviders(<Button>Save</Button>);
        const root = screen.getByRole('button', { name: 'Save' });

        expect(root.style.getPropertyValue('--button-height')).toBe(rem(44));
        expect(root.style.getPropertyValue('--button-fz')).toBe('var(--mantine-font-size-lg)');
    });

    test('icon buttons are 44px and round', () => {
        renderWithProviders(
            <>
                <ActionIcon aria-label="Plain">x</ActionIcon>
                <ActionIcon
                    aria-label="Large"
                    size="lg"
                >
                    x
                </ActionIcon>
            </>
        );

        for (const name of [ 'Plain', 'Large' ]) {
            const root = screen.getByRole('button', { name });

            expect(root.style.getPropertyValue('--ai-size')).toBe(rem(44));
            expect(root.style.getPropertyValue('--ai-radius')).toBe('var(--mantine-radius-xl)');
        }
    });

    test('checkboxes are 22px with radius 6, radios 20px with a 10px dot', () => {
        renderWithProviders(
            <>
                <Checkbox label="Also delete" />
                <Radio label="Chime" />
            </>
        );
        const checkbox = screen.getByLabelText('Also delete').closest('.mantine-Checkbox-root') as HTMLElement;
        const radio = screen.getByLabelText('Chime').closest('.mantine-Radio-root') as HTMLElement;

        expect(checkbox.style.getPropertyValue('--checkbox-size')).toBe(rem(22));
        expect(checkbox.style.getPropertyValue('--checkbox-radius')).toBe(rem(6));
        expect(radio.style.getPropertyValue('--radio-size')).toBe(rem(20));
        expect(radio.style.getPropertyValue('--radio-icon-size')).toBe(rem(10));
        // Галочка на акценті: у темній темі акцент світлий, тож вона має колір on-accent, а не білий
        expect(checkbox.style.getPropertyValue('--checkbox-icon-color')).toBe('var(--chat-on-accent)');
    });

    // Components → «Radio option», артборд Settings: вибране радіо — кільце й крапка акценту на прозорому тлі
    test('a radio is an accent ring with an accent dot, not a filled disc', () => {
        renderWithProviders(<Radio label="Chime" />);

        const radio = screen.getByLabelText('Chime').closest('.mantine-Radio-root') as HTMLElement;

        expect(radio.getAttribute('data-variant')).toBe('outline');
        // Outline Mantine бере brand-outline (у темній — інший відтінок), тож колір — токен акценту
        expect(radio.style.getPropertyValue('--radio-color')).toBe('var(--chat-accent)');
        expect(radio.style.getPropertyValue('--radio-icon-color')).toBe('');
    });
});

// Варіанти кнопок канвасу: secondary (field), danger soft, icon button у кольорі muted
describe('button variants', () => {
    test('variant="default" is the secondary button: field background, text colour, no border', () => {
        renderWithProviders(<Button variant="default">Cancel</Button>);
        const root = screen.getByRole('button', { name: 'Cancel' });

        expect(root.style.getPropertyValue('--button-bg')).toBe('var(--chat-field)');
        expect(root.style.getPropertyValue('--button-hover')).toBe('var(--chat-pressed)');
        expect(root.style.getPropertyValue('--button-color')).toBe('var(--chat-text)');
        expect(root.style.getPropertyValue('--button-bd')).toBe('none');
    });

    test('a grey outline button is the auth outline one: page background, border, text colour', () => {
        renderWithProviders(
            <Button
                variant="outline"
                color="gray"
            >
                Continue with Google
            </Button>
        );
        const root = screen.getByRole('button', { name: 'Continue with Google' });

        expect(root.style.getPropertyValue('--button-bg')).toBe('var(--chat-sidebar-bg)');
        expect(root.style.getPropertyValue('--button-hover')).toBe('var(--chat-hover)');
        expect(root.style.getPropertyValue('--button-color')).toBe('var(--chat-text)');
        expect(root.style.getPropertyValue('--button-bd')).toBe(`${ rem(1) } solid var(--chat-border)`);
    });

    test('a light or subtle red button is the soft destructive one', () => {
        renderWithProviders(
            <>
                <Button
                    variant="light"
                    color="red"
                >
                    Block
                </Button>
                <Button
                    variant="subtle"
                    color="red"
                >
                    Remove
                </Button>
            </>
        );

        for (const name of [ 'Block', 'Remove' ]) {
            const root = screen.getByRole('button', { name });

            expect(root.style.getPropertyValue('--button-bg')).toBe('var(--chat-danger-soft)');
            expect(root.style.getPropertyValue('--button-hover')).toBe('var(--chat-danger-soft-hover)');
            expect(root.style.getPropertyValue('--button-color')).toBe('var(--chat-danger)');
        }
    });

    test('a subtle grey icon button is muted with the hover of rows', () => {
        renderWithProviders(
            <ActionIcon
                aria-label="Chat settings"
                variant="subtle"
                color="gray"
            >
                x
            </ActionIcon>
        );
        const root = screen.getByRole('button', { name: 'Chat settings' });

        expect(root.style.getPropertyValue('--ai-color')).toBe('var(--chat-muted)');
        expect(root.style.getPropertyValue('--ai-hover')).toBe('var(--chat-hover)');
    });

    test('unread badges take the badge tokens, a grey one is the muted badge', () => {
        renderWithProviders(
            <>
                <Badge>2</Badge>
                <Badge color="gray">5</Badge>
            </>
        );
        const unread = screen.getByText('2').closest('.mantine-Badge-root') as HTMLElement;
        const muted = screen.getByText('5').closest('.mantine-Badge-root') as HTMLElement;

        expect(unread.style.getPropertyValue('--badge-bg')).toBe('var(--chat-badge)');
        expect(unread.style.getPropertyValue('--badge-color')).toBe('var(--chat-badge-text)');
        expect(muted.style.getPropertyValue('--badge-bg')).toBe('var(--chat-badge-muted)');
        expect(muted.style.getPropertyValue('--badge-color')).toBe('var(--chat-badge-muted-text)');
    });
});

// Components → avatars: ініціали 16 / 600 на аватарі 44 (і пропорційно на інших розмірах)
describe('avatar', () => {
    test('initials are 600 and 16px on a 44px avatar', () => {
        renderWithProviders(<Avatar size={ 44 }>MS</Avatar>);

        const placeholder = screen.getByText('MS');

        // --avatar-initials-fz — для розмірів, де канвас відходить від пропорції (фото профілю 104 → 36)
        expect(placeholder.style.fontSize).toBe('var(--avatar-initials-fz, calc(var(--avatar-size) * 0.364))');
        expect(placeholder.style.fontWeight).toBe('600');
    });
});

// Розділювач «or» на екранах входу: 14px, приглушений текст, лінія кольору line
test('divider label is 14px muted text on a line-coloured rule', () => {
    renderWithProviders(<Divider label="or" />);
    const label = screen.getByText('or');
    const root = label.closest('.mantine-Divider-root') as HTMLElement;

    expect(label.style.fontSize).toBe('var(--mantine-font-size-sm)');
    expect(label.style.color).toBe('var(--chat-muted)');
    expect(root.style.getPropertyValue('--divider-color')).toBe('var(--chat-line)');
});

// Toast: 16px текст, іконка успіху — toast accent, помилки — toast danger
test('notifications use the toast tokens for their colour', () => {
    renderWithProviders(
        <>
            <Notification>Photo updated</Notification>
            <Notification color="red">Couldn’t forward the message</Notification>
        </>
    );
    const ok = screen.getByText('Photo updated');
    const error = screen.getByText('Couldn’t forward the message');

    expect(ok.style.fontSize).toBe('var(--mantine-font-size-md)');
    expect((ok.closest('.mantine-Notification-root') as HTMLElement).style.getPropertyValue('--notification-color')).toBe('var(--chat-toast-accent)');
    expect((error.closest('.mantine-Notification-root') as HTMLElement).style.getPropertyValue('--notification-color')).toBe('var(--chat-toast-danger)');
});

// Components → Toasts: іконка без кружечка, кольором toast; «2 messages deleted» — кольором тексту toast
test('a toast icon has no circle and a neutral toast uses the toast text colour', () => {
    renderWithProviders(
        <Notification
            color="gray"
            icon={ <svg data-testid="toast-icon" /> }
        >
            2 messages deleted
        </Notification>
    );

    const root = screen.getByText('2 messages deleted').closest('.mantine-Notification-root') as HTMLElement;
    const icon = screen.getByTestId('toast-icon').parentElement!;

    expect(root.style.getPropertyValue('--notification-color')).toBe('var(--chat-toast-text)');
    expect(icon.style.backgroundColor).toBe('transparent');
    expect(icon.style.color).toBe('var(--notification-color)');
    // На канвасі toast без хрестика: закривається сам
    expect(screen.queryByRole('button')).toBeNull();
    // Відступи 16 по боках, іконка на 12 від тексту
    expect(root.style.paddingInlineStart).toBe(rem(16));
    expect(root.style.paddingInlineEnd).toBe(rem(16));
    expect(icon.style.marginInlineEnd).toBe(rem(12));
});
