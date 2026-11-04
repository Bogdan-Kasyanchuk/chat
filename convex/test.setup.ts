/// <reference types="vite/client" />
import { convexTest } from 'convex-test';

import schema from './schema';

// Vite 8 не підтримує extglob `!(…)` із документації convex-test, тому виключення — окремими шаблонами
export const modules = import.meta.glob([ './**/*.*s', '!./**/*.test.ts', '!./test.setup.ts' ]);

export const setup = () => convexTest(schema, modules);

// getAuthUserId бере userId з subject до символу «|»
export const asUser = async (t: ReturnType<typeof setup>, name: string) => {
    const userId = await t.run(async ctx => ctx.db.insert('users', {
        name,
        email: `${ name.toLowerCase() }@example.com`,
        image: `https://example.com/${ name }.png`
    }));

    return {
        userId,
        client: t.withIdentity({ subject: `${ userId }|session-${ name }` })
    };
};
