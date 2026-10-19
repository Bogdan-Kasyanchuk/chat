import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

import { soundValidator } from './validators';

export default defineSchema({
    ...authTables,
    // Як authTables.users плюс власні поля. Пошта не унікальна: Google і пароль можуть мати одну адресу
    users: defineTable({
        name: v.optional(v.string()),
        image: v.optional(v.string()),
        email: v.optional(v.string()),
        emailVerificationTime: v.optional(v.number()),
        phone: v.optional(v.string()),
        phoneVerificationTime: v.optional(v.number()),
        isAnonymous: v.optional(v.boolean()),
        avatarId: v.optional(v.id('_storage')),
        sound: v.optional(soundValidator)
    })
        .index('email', [ 'email' ])
        .index('phone', [ 'phone' ]),
    presence: defineTable({
        userId: v.id('users'),
        lastSeenAt: v.number(),
        online: v.boolean(),
        expireJobId: v.optional(v.id('_scheduled_functions'))
    })
        .index('by_user', [ 'userId' ])
});
