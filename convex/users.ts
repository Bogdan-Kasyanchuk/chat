import { getAuthUserId } from '@convex-dev/auth/server';
import { ConvexError, v } from 'convex/values';

import { internal } from './_generated/api';
import { action, internalMutation, internalQuery, mutation, query } from './_generated/server';
import { avatarUrl, requireUserId } from './access';
import { normalizeEmail, validateName } from './authRules';
import type { EmailStatus } from './authRules';
import { deleteUserCascade } from './cascade';
import { AVATAR_NOT_FOUND, AVATAR_TOO_BIG, AVATAR_TYPE, AVATAR_TYPES, DEFAULT_SOUND, MAX_AVATAR_BYTES, NOT_SIGNED_IN } from './chatRules';
import { soundValidator } from './validators';

export const me = query({
    args: {},
    handler: async ctx => {
        const userId = await getAuthUserId(ctx);

        if (userId === null) {
            return null;
        }

        const user = await ctx.db.get('users', userId);

        if (!user) {
            return null;
        }

        return {
            id: user._id,
            name: user.name ?? '',
            email: user.email ?? '',
            avatar: await avatarUrl(ctx, user),
            sound: user.sound ?? DEFAULT_SOUND
        };
    }
});

// Лише для провайдера пошти: публічного «чи зайнята пошта» немає, щоб адреси не можна було перебирати.
// Пошта в users не унікальна, тож шукаємо серед усіх збігів: якщо хоч в одного є акаунт з паролем — 'password'
export const emailStatus = internalQuery({
    args: { email: v.string() },
    handler: async (ctx, { email }): Promise<EmailStatus> => {
        const account = await ctx.db
            .query('authAccounts')
            .withIndex('providerAndAccountId', q => q.eq('provider', 'password').eq('providerAccountId', email))
            .first();

        if (account) {
            return 'password';
        }

        const user = await ctx.db
            .query('users')
            .withIndex('email', q => q.eq('email', email))
            .first();

        return user ? 'google' : 'free';
    }
});

// Пошук за точною поштою (як у Telegram): інших користувачів не видно.
// Пошта не унікальна, тому беремо найстаріший акаунт
export const findByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, { email }) => {
        const myId = await requireUserId(ctx);
        const normalized = normalizeEmail(email);
        const user = await ctx.db
            .query('users')
            .withIndex('email', q => q.eq('email', normalized))
            .first();

        if (!user || user._id === myId) {
            return null;
        }

        const contact = await ctx.db
            .query('contacts')
            .withIndex('by_owner', q => q.eq('ownerId', myId).eq('contactId', user._id))
            .unique();

        return {
            userId: user._id,
            name: user.name ?? '',
            avatar: await avatarUrl(ctx, user),
            isContact: contact !== null
        };
    }
});

export const updateName = mutation({
    args: { name: v.string() },
    handler: async (ctx, { name }) => {
        const userId = await requireUserId(ctx);

        await ctx.db.patch('users', userId, { name: validateName(name) });

        return null;
    }
});

export const generateAvatarUploadUrl = mutation({
    args: {},
    handler: async ctx => {
        await requireUserId(ctx);

        return ctx.storage.generateUploadUrl();
    }
});

export const avatarMeta = internalQuery({
    args: { storageId: v.id('_storage') },
    handler: async (ctx, { storageId }) => ctx.db.system.get('_storage', storageId)
});

export const applyAvatar = internalMutation({
    args: { userId: v.id('users'), storageId: v.union(v.id('_storage'), v.null()) },
    handler: async (ctx, { userId, storageId }) => {
        const user = await ctx.db.get('users', userId);

        if (!user) {
            throw new ConvexError(NOT_SIGNED_IN);
        }

        if (user.avatarId && user.avatarId !== storageId) {
            await ctx.storage.delete(user.avatarId);
        }

        // null повертає до ініціалів: прибирає і завантажений аватар, і картинку від Google
        await ctx.db.patch('users', userId, { avatarId: storageId ?? undefined, image: storageId ? user.image : undefined });

        return null;
    }
});

// Дія, а не мутація: завантаження йде напряму в сховище, повз сервер, тож тип і розмір перевіряються тут,
// а відхилений файл треба видалити й кинути помилку. У мутації кидок відкотив би і видалення
export const setAvatar = action({
    args: { storageId: v.union(v.id('_storage'), v.null()) },
    handler: async (ctx, { storageId }): Promise<null> => {
        const userId = await getAuthUserId(ctx);

        if (userId === null) {
            throw new ConvexError(NOT_SIGNED_IN);
        }

        if (storageId !== null) {
            const meta = await ctx.runQuery(internal.users.avatarMeta, { storageId });

            if (!meta) {
                throw new ConvexError(AVATAR_NOT_FOUND);
            }

            if (!meta.contentType || !AVATAR_TYPES.includes(meta.contentType)) {
                await ctx.storage.delete(storageId);

                throw new ConvexError(AVATAR_TYPE);
            }

            if (meta.size > MAX_AVATAR_BYTES) {
                await ctx.storage.delete(storageId);

                throw new ConvexError(AVATAR_TOO_BIG);
            }
        }

        return ctx.runMutation(internal.users.applyAvatar, { userId, storageId });
    }
});

export const setSound = mutation({
    args: { sound: soundValidator },
    handler: async (ctx, { sound }) => {
        const userId = await requireUserId(ctx);

        await ctx.db.patch('users', userId, { sound });

        return null;
    }
});

export const deleteAccount = mutation({
    args: {},
    handler: async ctx => {
        await deleteUserCascade(ctx, await requireUserId(ctx));

        return null;
    }
});
