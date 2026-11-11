import {
    ActionIcon,
    Avatar,
    Badge,
    Button,
    Checkbox,
    CloseButton,
    Divider,
    Drawer,
    Input,
    Menu,
    Modal,
    Notification,
    Popover,
    Radio,
    SegmentedControl,
    Title,
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
// Таблиця всіх токенів з ролями — розділ tokens на артборді Components; іконка помилки в toast (--chat-toast-danger)
// і hover м'якої червоної кнопки (--chat-danger-soft-hover) додані разом з нею.
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
    '--chat-active-muted': '#E4F4F1',
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
    '--chat-danger-soft-hover': '#F7DAD6',
    '--chat-popover': '#FFFFFF',
    '--chat-shadow': '0 10px 30px rgba(16, 32, 30, 0.16)',
    '--chat-overlay': 'rgba(14, 24, 23, 0.45)',
    '--chat-segment-on': '#FFFFFF',
    '--chat-toast-bg': '#16201F',
    '--chat-toast-text': '#F0F5F4',
    '--chat-toast-accent': '#7FE0D6',
    '--chat-toast-danger': '#FF8A7A',
    '--chat-disabled-bg': '#E2E9E7',
    '--chat-disabled-text': '#7A8986',
    '--chat-ring': '#0B7A75',
    '--chat-ring-soft': 'rgba(11, 122, 117, 0.18)',
    // Кільце фокусу поля з помилкою (dangerRing у L / D)
    '--chat-danger-ring': 'rgba(194, 55, 44, 0.18)',
    // Крапки «друкує» у вітрині входу (Main); у темній канвас їх не має — тон між border-hover і disabled text
    '--chat-typing': '#9BB0AC'
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
    '--chat-danger-soft-hover': '#4A2622',
    '--chat-popover': '#1E2829',
    '--chat-shadow': '0 14px 36px rgba(0, 0, 0, 0.5)',
    '--chat-overlay': 'rgba(0, 0, 0, 0.6)',
    '--chat-segment-on': '#2C3A3B',
    '--chat-toast-bg': '#E6EDEC',
    '--chat-toast-text': '#16201F',
    '--chat-toast-accent': '#0B7A75',
    '--chat-toast-danger': '#C2372C',
    '--chat-disabled-bg': '#243032',
    '--chat-disabled-text': '#6E7F7C',
    '--chat-ring': '#4FD1C5',
    '--chat-ring-soft': 'rgba(79, 209, 197, 0.25)',
    '--chat-danger-ring': 'rgba(255, 138, 122, 0.25)',
    '--chat-typing': '#5E716E'
};

export const TOKENS: Record<'light' | 'dark', Record<ChatToken, string>> = { light, dark };

// Акцент: brand-7 — світла тема, brand-5 — темна; 8 і 9 — hover і натискання світлої
const brand: MantineColorsTuple = [ '#E4F4F1', '#CDEDE9', '#9BDCD5', '#7FE0D6', '#52D0C5', '#3CC4B8', '#2FA99E', '#0B7A75', '#08625E', '#06504D' ];

// Нейтральні з зеленкуватим відтінком канвасу. Mantine бере звідси бордер (gray-4 / dark-4),
// приглушений текст (gray-6 / dark-2), плейсхолдер (gray-5 / dark-3), тло полів у темній (dark-6) і body (dark-7)
const gray: MantineColorsTuple = [ '#F1F5F4', '#E6ECEA', '#E2E9E7', '#DCE4E1', '#D5DEDB', '#7A8986', '#5A6B68', '#4D6662', '#2C3B39', '#16201F' ];
const darkColors: MantineColorsTuple = [ '#E6EDEC', '#C3D2CF', '#93A4A1', '#6E7F7C', '#2C3A3B', '#243032', '#1B2425', '#151C1D', '#0E1415', '#0A0F10' ];

// Небезпечні дії: red-7 у світлій, red-5 (danger solid) у темній; червоний текст (c="red") — --chat-danger, див. mantineFromTokens
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

// Варіанти кнопок канвасу (Components → States):
//   filled — primary, текст on-accent; filled red — destructive, текст on-danger;
//   default — secondary: тло field, без рамки; outline gray — контурна кнопка входу (Google);
//   light / subtle red — danger soft
const variantVars = (variant: string | undefined, color: string | undefined) => {
    const v = variant ?? 'filled';

    if (v === 'default') {
        return { bg: 'var(--chat-field)', hover: 'var(--chat-pressed)', color: 'var(--chat-text)', bd: 'none' };
    }

    if (v === 'outline' && color === 'gray') {
        return { bg: 'var(--chat-sidebar-bg)', hover: 'var(--chat-hover)', color: 'var(--chat-text)', bd: `${ rem(1) } solid var(--chat-border)` };
    }

    if ((v === 'light' || v === 'subtle') && color === 'red') {
        return { bg: 'var(--chat-danger-soft)', hover: 'var(--chat-danger-soft-hover)', color: 'var(--chat-danger)', bd: undefined };
    }

    return { bg: undefined, hover: undefined, color: filledText(variant, color), bd: undefined };
};

// Звичайний розмір: undefined або sm (InputBase сам ставить sm); size="lg" лишається 50 / 18 Mantine
const isBase = (size: string | number | undefined) => size === undefined || size === 'sm';

const overlay = { backgroundOpacity: 1, color: 'var(--chat-overlay)' };

const TOAST_COLORS: Record<string, string> = { red: 'var(--chat-toast-danger)', gray: 'var(--chat-toast-text)' };

const theme = createTheme({
    colors: { brand, gray, dark: darkColors, red },
    primaryColor: 'brand',
    primaryShade: { light: 7, dark: 5 },
    black: '#16201F',
    white: '#FFFFFF',
    fontFamily: '\'Onest Variable\', system-ui, sans-serif',
    // Текст 1.35, заголовки 1.2; h1 — заголовок входу 42, h2 — діалогів і нижніх панелей 28, h3 — ім'я профілю й порожні стани 20
    lineHeights: { xs: '1.35', sm: '1.35', md: '1.35', lg: '1.35', xl: '1.35' },
    headings: {
        fontFamily: '\'Onest Variable\', system-ui, sans-serif',
        fontWeight: '700',
        sizes: {
            h1: { fontSize: rem(42), lineHeight: '1.2' },
            h2: { fontSize: rem(28), lineHeight: '1.2' },
            h3: { fontSize: rem(20), lineHeight: '1.2' }
        }
    },
    cursorType: 'pointer',
    // Натиснута кнопка зменшується до 98% (global.css)
    activeClassName: 'chat-active',
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
    // Розміри з канвасу (Components → control sizes): 44 — звичайні кнопки й поля, 50 — size="lg" (вхід); текст 18
    components: {
        Button: Button.extend({
            vars: (_, { size, variant, color }) => {
                const v = variantVars(variant, color);

                return {
                    root: {
                        '--button-height': size === undefined ? rem(44) : undefined,
                        '--button-fz': size === undefined ? 'var(--mantine-font-size-lg)' : undefined,
                        '--button-bg': v.bg,
                        '--button-hover': v.hover,
                        '--button-color': v.color,
                        '--button-bd': v.bd
                    }
                };
            }
        }),
        // Іконкові кнопки 44×44, круглі; сірі subtle — колір muted і hover рядків
        ActionIcon: ActionIcon.extend({
            defaultProps: { radius: 'xl' },
            vars: (_, { size, variant, color }) => {
                const muted = (variant === 'subtle' || variant === 'transparent') && color === 'gray';

                return {
                    root: {
                        '--ai-size': size === undefined || size === 'md' || size === 'lg' ? rem(44) : undefined,
                        '--ai-color': muted ? 'var(--chat-muted)' : filledText(variant, color),
                        '--ai-hover': muted && variant === 'subtle' ? 'var(--chat-hover)' : undefined
                    }
                };
            }
        }),
        CloseButton: CloseButton.extend({
            defaultProps: { radius: 'xl' },
            vars: (_, { size }) => ({ root: { '--cb-size': size === undefined ? rem(44) : undefined } }),
            styles: { root: { color: 'var(--chat-muted)' } }
        }),
        // TextInput, PasswordInput і Textarea малюють Input; 18px більше за 16, тож iOS не збільшує сторінку при фокусі
        Input: Input.extend({
            vars: (_, { size, variant, error }) => {
                const v = variant ?? 'default';

                return {
                    wrapper: {
                        '--input-height': isBase(size) ? rem(44) : undefined,
                        '--input-fz': isBase(size) ? 'var(--mantine-font-size-lg)' : undefined,
                        // Поле на тлі сторінки з рамкою (і в діалогах темної теми); filled — тло field, як пошук
                        '--input-bg': v === 'default' ? 'var(--chat-sidebar-bg)' : (v === 'filled' ? 'var(--chat-field)' : undefined),
                        // З помилкою рамку ставить Mantine (--mantine-color-error → --chat-danger)
                        '--input-bd': v === 'default' && !error ? 'var(--chat-border)' : undefined,
                        // З помилкою червоні лише рамка й підпис, як на канвасі; Mantine фарбував би ще текст, плейсхолдер і іконки
                        '--input-color': error ? 'var(--mantine-color-text)' : undefined,
                        '--input-placeholder-color': error ? 'var(--mantine-color-placeholder)' : undefined,
                        '--input-section-color': error ? 'var(--chat-muted)' : undefined
                    }
                };
            }
        }),
        // Підпис 14 / 600 на 8 над полем, підказка й помилка 12 на 4 під ним — і для полів входу 50
        InputWrapper: Input.Wrapper.extend({
            styles: {
                label: { fontSize: 'var(--mantine-font-size-sm)', fontWeight: 600, marginBottom: rem(8) },
                description: { fontSize: 'var(--mantine-font-size-xs)' },
                error: { fontSize: 'var(--mantine-font-size-xs)', marginTop: rem(4) }
            }
        }),
        Checkbox: Checkbox.extend({
            vars: () => ({ root: { '--checkbox-size': rem(22), '--checkbox-radius': rem(6), '--checkbox-icon-color': 'var(--chat-on-accent)' } }),
            styles: { label: { fontSize: 'var(--mantine-font-size-md)' } }
        }),
        // Радіо 20: вибране — кільце 2 і крапка 10 кольору акценту на прозорому тлі (outline; кільце — global.css)
        Radio: Radio.extend({
            defaultProps: { variant: 'outline' },
            vars: () => ({ root: { '--radio-size': rem(20), '--radio-icon-size': rem(10), '--radio-color': 'var(--chat-accent)' } }),
            styles: { label: { fontWeight: 600 } }
        }),
        // Перемикач теми: рамка field з відступом 4, сегменти 36 з радіусом 8 без роздільників, текст 14 / 600
        SegmentedControl: SegmentedControl.extend({
            defaultProps: { radius: 'md', withItemsBorders: false },
            vars: () => ({ root: { '--sc-padding': rem(4), '--sc-shadow': 'none', '--sc-font-size': 'var(--mantine-font-size-sm)' } }),
            styles: {
                root: { backgroundColor: 'var(--chat-field)' },
                indicator: { backgroundColor: 'var(--chat-segment-on)', borderRadius: rem(8) },
                label: { minHeight: rem(36), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--chat-text)' }
            }
        }),
        Title: Title.extend({
            styles: { root: { letterSpacing: '-0.02em' } }
        }),
        Modal: Modal.extend({
            defaultProps: { radius: 'lg', padding: rem(24), size: rem(420), overlayProps: overlay, closeButtonProps: { 'aria-label': 'Close' } },
            styles: {
                content: { backgroundColor: 'var(--chat-popover)' },
                header: { backgroundColor: 'var(--chat-popover)' },
                title: { fontSize: rem(28), fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' }
            }
        }),
        Drawer: Drawer.extend({
            defaultProps: { overlayProps: overlay },
            styles: {
                content: { backgroundColor: 'var(--chat-popover)' },
                header: { backgroundColor: 'var(--chat-popover)' },
                title: { fontSize: rem(28), fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' }
            }
        }),
        Menu: Menu.extend({
            defaultProps: { radius: 'lg', shadow: 'md' },
            styles: {
                dropdown: { padding: rem(8), backgroundColor: 'var(--chat-popover)', border: 0 },
                item: { minHeight: rem(44), borderRadius: rem(12), fontSize: 'var(--mantine-font-size-md)', fontWeight: 600 },
                divider: { borderColor: 'var(--chat-line)' }
            }
        }),
        Popover: Popover.extend({
            defaultProps: { radius: 'lg', shadow: 'md' },
            styles: { dropdown: { backgroundColor: 'var(--chat-popover)', border: 0 } }
        }),
        // Розділювач «or» на екранах входу: як на канвасі, 14px приглушеним текстом на лінії line
        Divider: Divider.extend({
            defaultProps: { color: 'var(--chat-line)' },
            styles: { label: { fontSize: 'var(--mantine-font-size-sm)', color: 'var(--chat-muted)' } }
        }),
        // Ініціали 16 / 600 на аватарі 44 (Components → avatars); на інших розмірах — та сама пропорція
        Avatar: Avatar.extend({
            // Ініціали 16 на аватарі 44 і пропорційно; --avatar-initials-fz — де канвас відходить від пропорції (фото профілю)
            styles: { placeholder: { fontSize: 'var(--avatar-initials-fz, calc(var(--avatar-size) * 0.364))', fontWeight: 600 } }
        }),
        // Лічильник непрочитаних 20 / радіус 10, текст 12 / 700; сірий — лічильник замʼюченого чату
        Badge: Badge.extend({
            defaultProps: { radius: 'xl' },
            vars: (_, { variant, color }) => {
                if ((variant ?? 'filled') !== 'filled') {
                    return { root: {} };
                }

                if (color === 'gray') {
                    return { root: { '--badge-bg': 'var(--chat-badge-muted)', '--badge-color': 'var(--chat-badge-muted-text)' } };
                }

                return color === undefined || color === 'brand'
                    ? { root: { '--badge-bg': 'var(--chat-badge)', '--badge-color': 'var(--chat-badge-text)' } }
                    : { root: {} };
            },
            styles: { root: { textTransform: 'none', fontWeight: 700 } }
        }),
        // Toast: інверсне тло, текст 16; колір (смужка чи іконка) — toast accent, для помилок — toast danger,
        // для нейтральних («2 messages deleted», color="gray») — колір тексту toast. Іконка без кружечка
        Notification: Notification.extend({
            defaultProps: { radius: 'lg', withCloseButton: false },
            vars: (_, { color }) => ({
                root: { '--notification-color': TOAST_COLORS[ color ?? '' ] ?? 'var(--chat-toast-accent)' }
            }),
            styles: {
                root: { backgroundColor: 'var(--chat-toast-bg)', boxShadow: 'var(--chat-shadow)', minHeight: rem(44) },
                icon: { width: 'auto', height: 'auto', backgroundColor: 'transparent', color: 'var(--notification-color)' },
                title: { color: 'var(--chat-toast-text)', fontSize: 'var(--mantine-font-size-md)' },
                description: { color: 'var(--chat-toast-text)', fontSize: 'var(--mantine-font-size-md)' },
                closeButton: { color: 'var(--chat-toast-text)' }
            }
        })
    }
});

// Токени --chat-* для кожної схеми; у темній ще hover акценту й небезпечної кнопки світлішає, як на канвасі
// Кольори Mantine, які бачать усі компоненти, ведуть на токени, щоб у кожної ролі було одне джерело
const mantineFromTokens = {
    '--mantine-color-body': 'var(--chat-sidebar-bg)',
    '--mantine-color-text': 'var(--chat-text)',
    '--mantine-color-error': 'var(--chat-danger)',
    '--mantine-color-dimmed': 'var(--chat-muted)',
    '--mantine-color-anchor': 'var(--chat-accent-text)',
    // Плейсхолдер — muted: сірий Mantine (gray-5 / dark-3) не дотягує до 4.5:1 (рішення власника 2026-11-09)
    '--mantine-color-placeholder': 'var(--chat-muted)',
    // Червоний текст (c="red", Menu.Item color="red") — той самий danger, що й помилки полів; у темній Mantine дав би red-4
    '--mantine-color-red-text': 'var(--chat-danger)'
};

export const cssVariablesResolver: CSSVariablesResolver = () => ({
    variables: {},
    light: { ...TOKENS.light, ...mantineFromTokens },
    dark: {
        ...TOKENS.dark,
        ...mantineFromTokens,
        // Поля й outline-кнопки в темній — на тлі сторінки з рамкою, як на канвасі (Mantine бере dark-6)
        '--mantine-color-default': 'var(--chat-sidebar-bg)',
        '--mantine-color-default-hover': 'var(--chat-hover)',
        '--mantine-color-brand-filled-hover': '#52D0C5',
        '--mantine-color-red-filled-hover': '#EE6A5E'
    }
});

// Тема за замовчуванням — системна; вибір System / Light / Dark зберігається на пристрої.
// Той самий ключ читає скрипт проти мерехтіння в index.html
export const COLOR_SCHEME_KEY = 'chat-color-scheme';
export const colorSchemeManager = localStorageColorSchemeManager({ key: COLOR_SCHEME_KEY });

export default theme;
