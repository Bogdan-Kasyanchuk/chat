// Фронтовий tsconfig бачить цей файл через _generated/api.d.ts, а типів Node, тобто process, у ньому немає
/// <reference types="node" />

import Google from '@auth/core/providers/google';
import { convexAuth } from '@convex-dev/auth/server';

import { redirectUrl } from './authRules';
import { EmailPassword } from './emailPassword';

type CreateOrUpdateUser = NonNullable<NonNullable<Parameters<typeof convexAuth>[ 0 ][ 'callbacks' ]>[ 'createOrUpdateUser' ]>;

const text = (value: unknown) => typeof value === 'string' ? value : undefined;

// Без цього Convex Auth при кожному вході через Google патчить users даними Google і стирає ім'я та аватар з профілю
export const createOrUpdateUser: CreateOrUpdateUser = async (ctx, { existingUserId, profile }) => {
    if (existingUserId) {
        return existingUserId;
    }

    return ctx.db.insert('users', {
        name: text(profile.name),
        email: text(profile.email),
        image: text(profile.image)
    });
};

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
    providers: [ Google, EmailPassword ],
    callbacks: {
        createOrUpdateUser,
        redirect: async ({ redirectTo }) => {
            if (!process.env.SITE_URL) {
                throw new Error('SITE_URL is not set');
            }

            return redirectUrl(redirectTo, process.env.SITE_URL);
        }
    }
});
