import type { FunctionReturnType } from 'convex/server';

import type { api } from '@convex/_generated/api';

export type { UserView } from '@convex/access';

export type ChatSummary = FunctionReturnType<typeof api.chats.list>[ number ];
export type ChatView = NonNullable<FunctionReturnType<typeof api.chats.get>>;
export type MessageView = FunctionReturnType<typeof api.messages.list>[ 'page' ][ number ];
export type ContactView = FunctionReturnType<typeof api.contacts.list>[ number ];
