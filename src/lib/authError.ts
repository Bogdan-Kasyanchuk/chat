import { ConvexError } from 'convex/values';

export type AuthFlow = 'signIn' | 'signUp';

const FALLBACK: Record<AuthFlow, string> = {
    signIn: 'Could not sign in. Try again',
    signUp: 'Could not create the account. Try again'
};

// Провайдер пошти кидає ConvexError з готовим текстом (видно й на prod); решта помилок отримує запасний текст сценарію
const authError = (error: unknown, flow: AuthFlow): string => {
    if (error instanceof ConvexError && typeof error.data === 'string') {
        return error.data;
    }

    return FALLBACK[ flow ];
};

export default authError;
