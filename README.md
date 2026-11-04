# chat

Онлайн-чат 1:1: контакти за точною поштою, повідомлення в реальному часі, присутність, емодзі, аватари.

Стек: Vite 8 + React 19 + TypeScript 6 + React Router 8 + Mantine 9 (тема й CSS modules). Бекенд — Convex (база, файли, серверні функції, вхід через Convex Auth).

Вхід — через Google або поштою з паролем.

## Запуск

1. `npm install`
2. `npx convex dev` — створює `.env.local` з `VITE_CONVEX_URL`; лишити працювати. Без логіну піднімається анонімний локальний деплоймент (бекенд на порту 3210); для хмарного проєкту потрібен логін у Convex
3. `npx @convex-dev/auth` — генерує ключі Convex Auth (`JWT_PRIVATE_KEY`, `JWKS`) і `SITE_URL`
4. Google OAuth: `npx convex env set AUTH_GOOGLE_ID …` і `AUTH_GOOGLE_SECRET …`, див. https://labs.convex.dev/auth/config/oauth/google
5. `npm run dev` і відкрити http://localhost:5173

## Скрипти

- `npm run dev` / `npm run dev:convex` — фронт / бекенд у режимі розробки
- `npm run test:once` — Vitest одним прогоном (функції Convex через convex-test + фронтові тести в jsdom); `npm run test` — у режимі watch
- `npm run test:e2e` — Playwright (десктоп і телефон, `workers: 2`); потрібен запущений Convex-бекенд (`npx convex dev`), Vite піднімає сам Playwright. Тестові користувачі `@e2e.test` прибираються після прогону
- `npm run lint`, `npm run lint:fix`, `npm run typecheck`, `npm run build`

## Деплой

Netlify, команда збірки `npx convex deploy --cmd 'npm run build'` (див. `netlify.toml`). У Netlify потрібен лише `CONVEX_DEPLOY_KEY` (контекст Production).
