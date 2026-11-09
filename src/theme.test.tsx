import { Button, DEFAULT_THEME, PasswordInput, TextInput, Textarea, mergeMantineTheme, rem } from '@mantine/core';
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
            [ '--chat-toast-text', '--chat-toast-bg' ]
        ];

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

    test('cssVariablesResolver hands the tokens to each scheme', () => {
        const resolved = cssVariablesResolver(mergeMantineTheme(DEFAULT_THEME, theme));

        expect(resolved.light).toMatchObject(TOKENS.light);
        expect(resolved.dark).toMatchObject(TOKENS.dark);
    });
});

// Розміри з «Рішень»: звичайні поля й кнопки 44px з текстом 16, size="lg" лишається 50 з текстом 18
describe('control sizes', () => {
    const wrapperStyle = (label: string) => (screen.getByLabelText(label).parentElement as HTMLElement).style;

    test('text, password and multiline fields are 44px with 16px text by default', () => {
        renderWithProviders(
            <>
                <TextInput label="Email" />
                <PasswordInput label="Password" />
                <Textarea label="Message" />
            </>
        );

        for (const label of [ 'Email', 'Message' ]) {
            expect(wrapperStyle(label).getPropertyValue('--input-height')).toBe(rem(44));
            expect(wrapperStyle(label).getPropertyValue('--input-fz')).toBe('var(--mantine-font-size-md)');
        }

        const password = screen.getByLabelText('Password').closest('.mantine-PasswordInput-wrapper') as HTMLElement;

        expect(password.style.getPropertyValue('--input-height')).toBe(rem(44));
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

    test('buttons are 44px with 16px text by default', () => {
        renderWithProviders(<Button>Save</Button>);
        const root = screen.getByRole('button', { name: 'Save' });

        expect(root.style.getPropertyValue('--button-height')).toBe(rem(44));
        expect(root.style.getPropertyValue('--button-fz')).toBe('var(--mantine-font-size-md)');
    });
});
