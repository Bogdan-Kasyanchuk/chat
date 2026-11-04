import { expect, test } from 'vitest';

import {
    EMAIL_LINKED_TO_GOOGLE, EMAIL_TAKEN, MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, NAME_REQUIRED, NAME_TOO_LONG, normalizeEmail, redirectUrl, signUpError,
    takenEmailMessage, validateName, validatePassword
} from './authRules';
import { MAX_NAME_LENGTH } from './chatRules';

test('passwords shorter than the minimum are rejected', () => {
    expect(() => {
        validatePassword('a'.repeat(MIN_PASSWORD_LENGTH - 1));
    }).toThrow('Password must be at least 8 characters');
});

test('a password of exactly the minimum length is accepted', () => {
    expect(() => {
        validatePassword('a'.repeat(MIN_PASSWORD_LENGTH));
    }).not.toThrow();
});

test('emails are trimmed and lowercased', () => {
    expect(normalizeEmail('  Alice@Example.COM ')).toBe('alice@example.com');
});

test('a missing email is rejected', () => {
    expect(() => normalizeEmail(undefined)).toThrow('Email is required');
});

test('a taken email gets a message that says how to get in', () => {
    expect(takenEmailMessage('free')).toBeNull();
    expect(takenEmailMessage('password')).toBe(EMAIL_TAKEN);
    expect(takenEmailMessage('google')).toBe(EMAIL_LINKED_TO_GOOGLE);
    expect(EMAIL_TAKEN).toBe('An account with this email already exists. Sign in instead');
    expect(EMAIL_LINKED_TO_GOOGLE).toBe('This email is linked to Google. Continue with Google instead');
});

test('passwords longer than the maximum are rejected', () => {
    expect(() => {
        validatePassword('a'.repeat(MAX_PASSWORD_LENGTH + 1));
    }).toThrow('Password must be at most 128 characters');
});

test('a relative redirect goes to SITE_URL', () => {
    expect(redirectUrl('/game/g1?mark=circle', 'https://bogkas-tic-tac-toe.netlify.app/')).toBe('https://bogkas-tic-tac-toe.netlify.app/game/g1?mark=circle');
});

test('a redirect to SITE_URL itself is allowed', () => {
    expect(redirectUrl('http://localhost:5173/game/g1', 'http://localhost:5173')).toBe('http://localhost:5173/game/g1');
});

test('in dev a redirect to the local network is allowed so other devices can sign in with Google', () => {
    expect(redirectUrl('http://192.168.0.101:5173/game/g1', 'http://localhost:5173')).toBe('http://192.168.0.101:5173/game/g1');
    expect(redirectUrl('http://10.0.0.7:5174/', 'http://localhost:5173')).toBe('http://10.0.0.7:5174/');
    expect(redirectUrl('http://172.20.1.2:5173/', 'http://localhost:5173')).toBe('http://172.20.1.2:5173/');
});

test('on prod a redirect to the local network is rejected', () => {
    expect(() => redirectUrl('http://192.168.0.101:5173/', 'https://bogkas-tic-tac-toe.netlify.app')).toThrow('Invalid redirectTo');
});

test('a redirect to a foreign site is rejected even in dev', () => {
    expect(() => redirectUrl('https://evil.example/', 'http://localhost:5173')).toThrow('Invalid redirectTo');
    expect(() => redirectUrl('http://192.168.0.101.evil.example/', 'http://localhost:5173')).toThrow('Invalid redirectTo');
    expect(() => redirectUrl('http://172.32.0.1:5173/', 'http://localhost:5173')).toThrow('Invalid redirectTo');
    expect(() => redirectUrl('http://localhost:5173.evil.example/', 'http://localhost:5173')).toThrow('Invalid redirectTo');
});

test('a password of exactly the maximum length is accepted', () => {
    expect(() => {
        validatePassword('a'.repeat(MAX_PASSWORD_LENGTH));
    }).not.toThrow();
});

test.each([ 'abc', 'abc@', '@example.com', 'a b@example.com', 'alice@example' ])('%s is not an email', value => {
    expect(() => normalizeEmail(value)).toThrow('Enter a valid email');
});

// Дві одночасні реєстрації: обидві пройшли перевірку, друга падає в createAccount звичайним Error
test('a duplicate account error from Convex Auth becomes the taken-email message', () => {
    expect(signUpError(new Error('Uncaught Error: Account alice@example.com already exists'))).toMatchObject({ data: EMAIL_TAKEN });
});

test('any other sign-up error passes through unchanged', () => {
    const error = new Error('Something else');

    expect(signUpError(error)).toBe(error);
});

test('a name is trimmed', () => {
    expect(validateName('  Alice ')).toBe('Alice');
});

test('an empty or missing name is rejected', () => {
    expect(() => validateName('   ')).toThrow(NAME_REQUIRED);
    expect(() => validateName(undefined)).toThrow(NAME_REQUIRED);
});

test('a name longer than the limit is rejected, one of the limit is accepted', () => {
    expect(() => validateName('a'.repeat(MAX_NAME_LENGTH + 1))).toThrow(NAME_TOO_LONG);
    expect(validateName('a'.repeat(MAX_NAME_LENGTH))).toHaveLength(MAX_NAME_LENGTH);
});
