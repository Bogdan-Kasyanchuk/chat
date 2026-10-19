import { execSync } from 'node:child_process';

// Після всіх тестів прибираємо користувачів @e2e.test; E2E_PROD=1 — коли тести йшли проти prod.
// Через оболонку, бо на Windows npx — це npx.cmd, який execFileSync не запускає
export default () => {
    const prod = process.env.E2E_PROD === '1' ? ' --prod' : '';

    execSync(`npx convex run${ prod } testing:deleteE2eUsers`, { stdio: 'inherit' });
};
