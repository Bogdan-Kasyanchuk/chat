import { ConvexError } from 'convex/values';

import { MAX_NAME_LENGTH } from './chatRules';

export const MIN_PASSWORD_LENGTH = 8;
// Пароль хешується Scrypt і при реєстрації, і при вході: без межі сервер хешував би рядок будь-якої довжини
export const MAX_PASSWORD_LENGTH = 128;

export const NAME_REQUIRED = 'Name is required';
export const NAME_TOO_LONG = 'Name is too long';
export const EMAIL_TAKEN = 'An account with this email already exists. Sign in instead';
export const EMAIL_LINKED_TO_GOOGLE = 'This email is linked to Google. Continue with Google instead';
export const WRONG_CREDENTIALS = 'Wrong email or password';
export const TOO_MANY_ATTEMPTS = 'Too many attempts. Try again later';

// 'google' — пошта є в users, але без акаунта з паролем: зараз так буває лише після входу через Google
export type EmailStatus = 'free' | 'password' | 'google';

// Та сама груба перевірка, що й у формі: щось@щось.щось без пробілів
const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Один акаунт на адресу незалежно від регістру й випадкових пробілів
export const normalizeEmail = (value: unknown): string => {
    if (typeof value !== 'string' || value.trim() === '') {
        throw new ConvexError('Email is required');
    }

    const email = value.trim().toLowerCase();

    if (!EMAIL_FORMAT.test(email)) {
        throw new ConvexError('Enter a valid email');
    }

    return email;
};

export const validateName = (value: unknown): string => {
    const name = typeof value === 'string' ? value.trim() : '';

    if (name === '') {
        throw new ConvexError(NAME_REQUIRED);
    }

    if (name.length > MAX_NAME_LENGTH) {
        throw new ConvexError(NAME_TOO_LONG);
    }

    return name;
};

export const validatePassword = (password: string) => {
    if (password.length < MIN_PASSWORD_LENGTH) {
        throw new ConvexError(`Password must be at least ${ MIN_PASSWORD_LENGTH } characters`);
    }

    if (password.length > MAX_PASSWORD_LENGTH) {
        throw new ConvexError(`Password must be at most ${ MAX_PASSWORD_LENGTH } characters`);
    }
};

// Дві одночасні реєстрації на одну пошту обидві проходять перевірку, і друга падає в createAccount звичайним Error,
// який на prod прихований. Віддаємо їй той самий текст, що й при послідовній реєстрації
export const signUpError = (error: unknown): unknown => {
    if (error instanceof Error && error.message.includes('already exists')) {
        return new ConvexError(EMAIL_TAKEN);
    }

    return error;
};

// Приватні IPv4: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
const PRIVATE_IPV4 = /^(?:10\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])|192\.168)\.\d{1,3}\.\d{1,3}$/;

const isLanUrl = (value: string): boolean => {
    try {
        const url = new URL(value);

        return url.protocol === 'http:' && PRIVATE_IPV4.test(url.hostname);
    } catch {
        return false;
    }
};

// Куди Convex Auth поверне після Google. Як стандартний колбек бібліотеки, але в dev (SITE_URL — localhost)
// пускає й адреси локальної мережі: тоді з телефона на http://192.168.…:5173 вхід повертає туди ж, а не на localhost телефона
export const redirectUrl = (redirectTo: string, siteUrl: string): string => {
    const site = siteUrl.replace(/\/$/, '');

    if (redirectTo.startsWith('/') || redirectTo.startsWith('?')) {
        return `${ site }${ redirectTo }`;
    }

    if (redirectTo.startsWith(site) && [ undefined, '/', '?' ].includes(redirectTo[ site.length ])) {
        return redirectTo;
    }

    if (new URL(site).hostname === 'localhost' && isLanUrl(redirectTo)) {
        return redirectTo;
    }

    throw new Error(`Invalid redirectTo ${ redirectTo } for SITE_URL ${ site }`);
};

export const takenEmailMessage = (status: EmailStatus): string | null => {
    if (status === 'password') {
        return EMAIL_TAKEN;
    }

    return status === 'google' ? EMAIL_LINKED_TO_GOOGLE : null;
};
