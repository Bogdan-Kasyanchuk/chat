import {
    ActionIcon,
    Badge,
    Button,
    Divider,
    Drawer,
    Input,
    Menu,
    Modal,
    Notification,
    createTheme,
    localStorageColorSchemeManager,
    rem
} from '@mantine/core';
import type { CSSVariablesResolver, MantineColorsTuple } from '@mantine/core';

// Значення — з канвасу «Chat redesign»: палітра `colors` на артборді Components і об'єкти L / D
// у скрипті docs/design/Chats.dc.html. Hex живуть лише тут; CSS modules беруть var(--chat-…) і палітру Mantine.
//
// Роль палітри Components → токен:
//   background → --chat-sidebar-bg (і --mantine-color-body), chat background → --chat-bg,
//   field → --chat-field, border → --chat-border, line → --chat-line, text → --chat-text,
//   muted → --chat-muted, accent → --chat-accent (brand-7 / brand-5), outgoing bubble → --chat-bubble-out,
//   chip → --chat-date-chip, online → --chat-online, danger → --chat-danger, danger soft → --chat-danger-soft,
//   danger solid → --chat-danger-solid, hover → --chat-hover, pressed → --chat-pressed, disabled → --chat-disabled-bg.
// Чого в палітрі немає (вхідна бульбашка, час і галочки в бульбашці, бейджі, toast, тіні, затемнення) —
// з L / D у Chats.dc.html. Сіра галочка «надіслано» має колір часу в бульбашці.
const light = {
    '--chat-sidebar-bg': '#FFFFFF',
    '--chat-bg': '#E6EEEB',
    '--chat-pattern': 'rgba(11, 122, 117, 0.10)',
    '--chat-field': '#F1F5F4',
    '--chat-border': '#D5DEDB',
    '--chat-border-hover': '#B9C6C2',
    '--chat-line': '#E2E9E7',
    '--chat-text': '#16201F',
    '--chat-muted': '#5A6B68',
    '--chat-accent': '#0B7A75',
    '--chat-accent-text': '#0B7A75',
    '--chat-on-accent': '#FFFFFF',
    '--chat-hover': '#F1F5F4',
    '--chat-pressed': '#E6ECEA',
    '--chat-active': '#0B7A75',
    '--chat-active-text': '#FFFFFF',
    '--chat-active-muted': '#CDEDE9',
    '--chat-select-row': 'rgba(11, 122, 117, 0.12)',
    '--chat-bubble-in': '#FFFFFF',
    '--chat-bubble-in-text': '#16201F',
    '--chat-bubble-out': '#D3F0EB',
    '--chat-bubble-out-text': '#0E2725',
    '--chat-bubble-meta': '#4D6662',
    '--chat-bubble-shadow': '0 1px 1.5px rgba(16, 32, 30, 0.10)',
    '--chat-quote-in': 'rgba(11, 122, 117, 0.08)',
    '--chat-quote-out': 'rgba(11, 122, 117, 0.12)',
    '--chat-tick': '#4D6662',
    '--chat-tick-read': '#0B7A75',
    '--chat-badge': '#0B7A75',
    '--chat-badge-text': '#FFFFFF',
    '--chat-badge-muted': '#6A7A77',
    '--chat-badge-muted-text': '#FFFFFF',
    '--chat-online': '#1F9D55',
    '--chat-date-chip': '#D5E1DD',
    '--chat-date-chip-text': '#2C3B39',
    '--chat-danger': '#C2372C',
    '--chat-danger-solid': '#C2372C',
    '--chat-on-danger': '#FFFFFF',
    '--chat-danger-soft': '#FBEAE8',
    '--chat-popover': '#FFFFFF',
    '--chat-shadow': '0 10px 30px rgba(16, 32, 30, 0.16)',
    '--chat-overlay': 'rgba(14, 24, 23, 0.45)',
    '--chat-segment-on': '#FFFFFF',
    '--chat-toast-bg': '#16201F',
    '--chat-toast-text': '#F0F5F4',
    '--chat-toast-accent': '#7FE0D6',
    '--chat-disabled-bg': '#E2E9E7',
    '--chat-disabled-text': '#7A8986',
    '--chat-ring': '#0B7A75',
    '--chat-ring-soft': 'rgba(11, 122, 117, 0.18)'
};

export type ChatToken = keyof typeof light;

// Темна схема мусить мати ті самі токени: тип не пропустить пропущений чи зайвий
const dark: Record<ChatToken, string> = {
    '--chat-sidebar-bg': '#151C1D',
    '--chat-bg': '#0E1415',
    '--chat-pattern': 'rgba(60, 196, 184, 0.07)',
    '--chat-field': '#1B2425',
    '--chat-border': '#2C3A3B',
    '--chat-border-hover': '#3B4B4C',
    '--chat-line': '#243032',
    '--chat-text': '#E6EDEC',
    '--chat-muted': '#93A4A1',
    '--chat-accent': '#3CC4B8',
    '--chat-accent-text': '#4FD1C5',
    '--chat-on-accent': '#062220',
    '--chat-hover': '#1B2425',
    '--chat-pressed': '#243032',
    '--chat-active': '#1F5551',
    '--chat-active-text': '#F0FAF8',
    '--chat-active-muted': '#A9D6D0',
    '--chat-select-row': 'rgba(60, 196, 184, 0.14)',
    '--chat-bubble-in': '#1E2829',
    '--chat-bubble-in-text': '#E6EDEC',
    '--chat-bubble-out': '#1D4945',
    '--chat-bubble-out-text': '#E4F4F1',
    '--chat-bubble-meta': '#9DB5B1',
    '--chat-bubble-shadow': '0 1px 1.5px rgba(0, 0, 0, 0.35)',
    '--chat-quote-in': 'rgba(79, 209, 197, 0.10)',
    '--chat-quote-out': 'rgba(255, 255, 255, 0.08)',
    '--chat-tick': '#9DB5B1',
    '--chat-tick-read': '#5FD9CC',
    '--chat-badge': '#3CC4B8',
    '--chat-badge-text': '#062220',
    '--chat-badge-muted': '#3E4C4A',
    '--chat-badge-muted-text': '#DCE5E3',
    '--chat-online': '#3DD07A',
    '--chat-date-chip': '#1C2728',
    '--chat-date-chip-text': '#C3D2CF',
    '--chat-danger': '#FF8A7A',
    '--chat-danger-solid': '#E5574A',
    '--chat-on-danger': '#1A0806',
    '--chat-danger-soft': '#3A1F1C',
    '--chat-popover': '#1E2829',
    '--chat-shadow': '0 14px 36px rgba(0, 0, 0, 0.5)',
    '--chat-overlay': 'rgba(0, 0, 0, 0.6)',
    '--chat-segment-on': '#2C3A3B',
    '--chat-toast-bg': '#E6EDEC',
    '--chat-toast-text': '#16201F',
    '--chat-toast-accent': '#0B7A75',
    '--chat-disabled-bg': '#243032',
    '--chat-disabled-text': '#6E7F7C',
    '--chat-ring': '#4FD1C5',
    '--chat-ring-soft': 'rgba(79, 209, 197, 0.25)'
};

export const TOKENS: Record<'light' | 'dark', Record<ChatToken, string>> = { light, dark };

// Акцент: brand-7 — світла тема, brand-5 — темна; 8 і 9 — hover і натискання світлої
const brand: MantineColorsTuple = [ '#E4F4F1', '#CDEDE9', '#9BDCD5', '#7FE0D6', '#52D0C5', '#3CC4B8', '#2FA99E', '#0B7A75', '#08625E', '#06504D' ];

// Нейтральні з зеленкуватим відтінком канвасу. Mantine бере звідси бордер (gray-4 / dark-4),
// приглушений текст (gray-6 / dark-2), плейсхолдер (gray-5 / dark-3), тло полів у темній (dark-6) і body (dark-7)
const gray: MantineColorsTuple = [ '#F1F5F4', '#E6ECEA', '#E2E9E7', '#DCE4E1', '#D5DEDB', '#7A8986', '#5A6B68', '#4D6662', '#2C3B39', '#16201F' ];
const darkColors: MantineColorsTuple = [ '#E6EDEC', '#C3D2CF', '#93A4A1', '#6E7F7C', '#2C3A3B', '#243032', '#1B2425', '#151C1D', '#0E1415', '#0A0F10' ];

// Небезпечні дії: red-7 у світлій, red-5 (danger solid) у темній; red-3 — червоний текст темної
const red: MantineColorsTuple = [ '#FDF4F3', '#FBEAE8', '#F7DAD6', '#FF8A7A', '#EE6A5E', '#E5574A', '#CC4A3E', '#C2372C', '#A82F25', '#8F271F' ];

// Текст на залитих кнопках: у темній темі акцент світлий, тож текст на ньому темний
const filledText = (variant: string | undefined, color: string | undefined): string | undefined => {
    if ((variant ?? 'filled') !== 'filled') {
        return undefined;
    }

    if (color === undefined || color === 'brand') {
        return 'var(--chat-on-accent)';
    }

    return color === 'red' ? 'var(--chat-on-danger)' : undefined;
};

const overlay = { backgroundOpacity: 1, color: 'var(--chat-overlay)' };

const theme = createTheme({
    colors: { brand, gray, dark: darkColors, red },
    primaryColor: 'brand',
    primaryShade: { light: 7, dark: 5 },
    black: '#16201F',
    white: '#FFFFFF',
    fontFamily: '\'Onest Variable\', system-ui, sans-serif',
    headings: {
        fontFamily: '\'Onest Variable\', system-ui, sans-serif',
        fontWeight: '700'
    },
    defaultRadius: 'md',
    radius: {
        xs: rem(4),
        sm: rem(8),
        md: rem(12),
        lg: rem(16),
        xl: rem(25)
    },
    shadows: {
        xs: 'var(--chat-bubble-shadow)',
        sm: 'var(--chat-bubble-shadow)',
        md: 'var(--chat-shadow)',
        lg: 'var(--chat-shadow)',
        xl: 'var(--chat-shadow)'
    },
    respectReducedMotion: true,
    breakpoints: {
        xs: '22.5em',
        sm: '36em',
        md: '48em',
        lg: '64em',
        xl: '90em'
    },
    // Розміри з «Рішень» плану: 44 — звичайні кнопки й поля (текст 16), 50 — size="lg" (текст 18, вхід і композер)
    components: {
        Button: Button.extend({
            vars: (_, { size, variant, color }) => ({
                root: {
                    '--button-height': size === undefined ? rem(44) : undefined,
                    '--button-fz': size === undefined ? 'var(--mantine-font-size-md)' : undefined,
                    '--button-color': filledText(variant, color)
                }
            })
        }),
        ActionIcon: ActionIcon.extend({
            vars: (_, { variant, color }) => ({
                root: { '--ai-color': filledText(variant, color) }
            })
        }),
        // TextInput, PasswordInput і Textarea малюють Input; 16px не дає iOS збільшувати сторінку при фокусі
        // InputBase сам ставить size="sm", тож дефолтний розмір поля — і undefined, і sm
        Input: Input.extend({
            vars: (_, { size }) => {
                const base = size === undefined || size === 'sm';

                return {
                    wrapper: {
                        '--input-height': base ? rem(44) : undefined,
                        '--input-fz': base ? 'var(--mantine-font-size-md)' : undefined
                    }
                };
            }
        }),
        Modal: Modal.extend({
            defaultProps: { radius: 'lg', padding: 'lg', overlayProps: overlay }
        }),
        Drawer: Drawer.extend({
            defaultProps: { overlayProps: overlay }
        }),
        Menu: Menu.extend({
            defaultProps: { radius: 'lg', shadow: 'md' },
            styles: {
                dropdown: { padding: rem(8) },
                item: { minHeight: rem(40), borderRadius: rem(12), fontSize: 'var(--mantine-font-size-md)' }
            }
        }),
        // Розділювач «or» на екранах входу: як на канвасі, 14px приглушеним текстом на лінії line
        Divider: Divider.extend({
            defaultProps: { color: 'var(--chat-line)' },
            styles: { label: { fontSize: 'var(--mantine-font-size-sm)', color: 'var(--chat-muted)' } }
        }),
        Badge: Badge.extend({
            defaultProps: { radius: 'xl' }
        }),
        Notification: Notification.extend({
            defaultProps: { radius: 'lg' },
            styles: {
                root: { backgroundColor: 'var(--chat-toast-bg)', boxShadow: 'var(--chat-shadow)' },
                title: { color: 'var(--chat-toast-text)' },
                description: { color: 'var(--chat-toast-text)' },
                closeButton: { color: 'var(--chat-toast-text)' }
            }
        })
    }
});

// Токени --chat-* для кожної схеми; у темній ще hover акценту й небезпечної кнопки світлішає, як на канвасі
export const cssVariablesResolver: CSSVariablesResolver = () => ({
    variables: {},
    light: TOKENS.light,
    dark: {
        ...TOKENS.dark,
        '--mantine-color-brand-filled-hover': '#52D0C5',
        '--mantine-color-red-filled-hover': '#EE6A5E'
    }
});

// Тема за замовчуванням — системна; вибір System / Light / Dark зберігається на пристрої.
// Той самий ключ читає скрипт проти мерехтіння в index.html
export const COLOR_SCHEME_KEY = 'chat-color-scheme';
export const colorSchemeManager = localStorageColorSchemeManager({ key: COLOR_SCHEME_KEY });

export default theme;
