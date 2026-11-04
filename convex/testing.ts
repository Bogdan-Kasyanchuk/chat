import { internalMutation } from './_generated/server';
import { deleteUserCascade } from './cascade';

export const E2E_EMAIL_DOMAIN = '@e2e.test';

// Прибирання після e2e-тестів і перевірок у браузері. Лише internal: викликається через `npx convex run`, з браузера недоступна
export const deleteE2eUsers = internalMutation({
    args: {},
    handler: async ctx => {
        const users = (await ctx.db.query('users').collect()).filter(user => user.email?.endsWith(E2E_EMAIL_DOMAIN));

        for (const user of users) {
            await deleteUserCascade(ctx, user._id);
        }

        return users.length;
    }
});
