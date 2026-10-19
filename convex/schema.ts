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
        .index('by_user', [ 'userId' ]),
    contacts: defineTable({
        ownerId: v.id('users'),
        contactId: v.id('users')
    })
        .index('by_owner', [ 'ownerId', 'contactId' ])
        .index('by_contact', [ 'contactId' ]),
    // pairKey — відсортовані id обох учасників (chatRules.pairKey)
    chats: defineTable({
        pairKey: v.string(),
        lastMessageAt: v.number()
    })
        .index('by_pair', [ 'pairKey' ]),
    chatMembers: defineTable({
        chatId: v.id('chats'),
        userId: v.id('users'),
        lastReadAt: v.number(),
        clearedAt: v.number(),
        muted: v.boolean(),
        hidden: v.boolean()
    })
        .index('by_user', [ 'userId' ])
        .index('by_chat', [ 'chatId', 'userId' ])
    ,
    // hiddenFor — «видалити для себе»; діапазон по часу іде через _creationTime в індексі
    messages: defineTable({
        chatId: v.id('chats'),
        authorId: v.id('users'),
        body: v.string(),
        replyToId: v.optional(v.id('messages')),
        forwardedFromId: v.optional(v.id('users')),
        editedAt: v.optional(v.number()),
        hiddenFor: v.array(v.id('users'))
    })
        .index('by_chat', [ 'chatId' ])
});
