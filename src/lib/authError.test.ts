import { ConvexError } from 'convex/values';
import { expect, test } from 'vitest';

import { EMAIL_TAKEN, WRONG_CREDENTIALS } from '@convex/authRules';

import authError from './authError';

test('a message from the server is shown as is', () => {
    expect(authError(new ConvexError(EMAIL_TAKEN), 'signUp')).toBe(EMAIL_TAKEN);
    expect(authError(new ConvexError(WRONG_CREDENTIALS), 'signIn')).toBe(WRONG_CREDENTIALS);
});

// Мережа, збій сервера або прихований на prod Error — у кожного сценарію свій зрозумілий текст
test('any other error gets the fallback of its flow', () => {
    expect(authError(new Error('[Request ID: 1] Server Error'), 'signIn')).toBe('Could not sign in. Try again');
    expect(authError(new Error('[Request ID: 1] Server Error'), 'signUp')).toBe('Could not create the account. Try again');
});
