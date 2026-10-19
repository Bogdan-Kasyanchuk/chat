import { execFileSync } from 'node:child_process';

// Після всіх тестів прибираємо користувачів @e2e.test; E2E_PROD=1 — коли тести йшли проти prod
export default () => {
    const prod = process.env.E2E_PROD === '1' ? [ '--prod' ] : [];

    execFileSync('npx', [ 'convex', 'run', ...prod, 'testing:deleteE2eUsers' ], { stdio: 'inherit' });
};
