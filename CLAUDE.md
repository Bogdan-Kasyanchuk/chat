# chat

Онлайн-чат 1:1. Репозиторій: https://github.com/Bogdan-Kasyanchuk/chat, сайт на Netlify.

## Стек і структура

- Фронт: Vite 8, React 19, TypeScript ~6.0, React Router 8 (декларативний режим, імпорт з `react-router`), Mantine 9 (`@mantine/core`, `form`, `hooks`, `modals`, `notifications`, `mantine-contextmenu`), іконки `@tabler/icons-react`, пікер емодзі `frimousse` (дані `emojibase` копіює `scripts/copy-emojibase.mjs` у `predev`/`prebuild`).
- Стилі: тема Mantine (`src/theme.ts`), style props і `*.module.css` поруч із компонентом. Без Tailwind, SCSS, Emotion, `sx`/`createStyles`.
- Компонент — тека `src/components/X/` з `X.tsx`, `index.ts` (`export { default } from './X';`), `X.module.css`, `X.test.tsx`. Сторінки — `src/pages`, хуки — `src/hooks`, утиліти — `src/lib`, типи даних виводяться з API Convex у `src/types/chat.ts`.
- Бекенд: Convex (`convex/`). Чати, повідомлення, контакти, присутність, користувачі — `chats.ts`, `messages.ts`, `contacts.ts`, `presence.ts`, `users.ts`; чисті правила й ліміти — `chatRules.ts`; доступ — `access.ts`; каскадне видалення — `cascade.ts`. Вхід через Google або поштою з паролем (Convex Auth): `auth.ts`, `emailPassword.ts`, правила й тексти — `authRules.ts`. Усе, що має побачити людина, сервер кидає як `ConvexError` (звичайні `Error` на prod приховані); фронт імпортує тексти через `@convex/*`.
- Контакти як у Telegram: пошук за точною поштою, інших користувачів не видно. Користувач, що не є учасником чату, не читає й не змінює його повідомлень.

## Команди

- `npx convex dev` — бекенд у режимі розробки; `npm run dev` — фронт на http://localhost:5173.
- `npm run test:once` — Vitest: функції Convex через `convex-test` (edge-runtime) і фронт (jsdom).
- `npm run test:e2e` — Playwright (проєкти `desktop` 1280px і `phone` 390px, `workers: 2`) проти `npm run dev`; Convex-бекенд має бути запущений. Тестові користувачі — лише `e2e-…@e2e.test`, прибирання — `npx convex run testing:deleteE2eUsers` (teardown робить це сам).
- `npm run lint`, `npm run lint:fix`, `npm run typecheck` (три tsconfig: `src`, конфіги Vite/Vitest/Playwright, `convex`), `npm run build`.

## Конвенції

- Стиль коду — ESLint + `@stylistic`: 4 пробіли, `[ a ]`, `${ a }`, атрибути JSX у подвійних лапках, без висячих ком. Prettier не використовується. Після правок — `npm run lint:fix`.
- Стрілка, яка нічого не повертає, має блокове тіло (JSX-пропси, колбеки хуків, cleanup-и); стрілки, що повертають значення, лишаються як є.
- Кольори в CSS — лише змінні Mantine (`var(--mantine-color-…)`) або токени теми, не hex. Медіа-запити — міксинами `postcss-preset-mantine`. Перемикання десктоп/телефон — брейкпоінт `md` (48em).
- Нова поведінка — з тестом, що спершу падає.
- Тексти помилок і ліміти — константи в `convex/chatRules.ts` і `convex/authRules.ts`.

## Деплой і секрети

- Netlify підключений до GitHub (production branch `main`): збірка `npx convex deploy --cmd 'npm run build'` (`netlify.toml`) оновлює функції Convex на prod і фронт. У Netlify потрібен лише `CONVEX_DEPLOY_KEY` (контекст Production); deploy previews вимкнені.
- Google OAuth: змінні `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` задаються через `npx convex env set` (dev) і `… --prod`.

## Поточна робота (стан на 2026-10-19)

**Міграція виконана** на гілці `migrate/vite-convex` (не запушена): власник пушить її й відкриває PR у `main`. План — `docs/superpowers/plans/2026-10-18-vite-convex-migration.md`, усі 17 задач.

Ще чекає на власника (👤):
- хмарний проєкт Convex `chat`, ключі Convex Auth і Google OAuth (задача 2, кроки 2–3 міграції);
- продакшн (задача 17, крок 4): у Netlify підключити сайт `075f926c-…` до `Bogdan-Kasyanchuk/chat` (production branch `main`), додати `CONVEX_DEPLOY_KEY` лише для Production, вимкнути deploy previews, видалити старі `VITE_API_KEY`, `VITE_AUTH_DOMAIN`, `VITE_PROJECT_ID`, `VITE_STORAGE_BUCKET`, `VITE_MESSAGING_SENDER_ID`, `VITE_APP_ID`, `VITE_UPLOAD_PRESET`, `VITE_CLOUD_NAME`; виконати `npx @convex-dev/auth --prod` з `SITE_URL=https://<site>.netlify.app`, потім `npx convex env set --prod AUTH_GOOGLE_ID …` і `AUTH_GOOGLE_SECRET …`; у Google OAuth client додати origin `https://<site>.netlify.app` і redirect URI `https://<prod-deployment>.convex.site/api/auth/callback/google`; після деплою перевірити на prod вхід через Google, реєстрацію поштою й повідомлення між двома акаунтами. Локальний `.env` з ключами Firebase і Cloudinary після цього не потрібен; Firebase і Cloudinary вимикає власник, коли вирішить.

Доти розробка йде на **анонімному локальному деплойменті** Convex (`.env.local`, бекенд на порту 3210, без логіну). Для e2e бекенд має бути запущений.

Наступний план — **редизайн**, `docs/superpowers/plans/2026-10-18-redesign.md`, 9 задач:
- канвас «Chat redesign» уже намальовано: https://claude.ai/artifact/XLx5GvCkUuVC57mLRdFhid (приватний, 26 артбордів). Задача 1, кроки 1–3 виконані;
- чекає огляду власником (задача 1, крок 4). Після погодження канвас копіюється в `docs/design/` (крок 5), щоб сесії без доступу до claude.ai теж його бачили.

Рішення власника, які вже ухвалені й не переглядаються (подробиці — розділ «Рішення» кожного плану):
- стек як у `tic-tac-toe`: Vite 8, React 19, TS ~6.0, React Router 8, Convex + Convex Auth (Google і пошта з паролем), GitHub-вхід прибрано;
- **UI лишається на Mantine**, оновлення до 9.x, стилі — тема Mantine + CSS modules (без Tailwind, SCSS, Emotion);
- контакти як у Telegram: пошук за точною поштою, інших користувачів не видно;
- дані з Firebase не переносяться, Convex стартує з порожньою базою;
- редизайн — світла й темна тема (за замовчуванням системна);
- емодзі: пікер `frimousse` у композері, великі повідомлення з 1–3 емодзі.

## Зразок

`~/Documents/Projects/tic-tac-toe` — та сама міграція й редизайн, уже виконані. Його `CLAUDE.md` і плани в `docs/superpowers/plans/` пояснюють рішення.

## Правила

- Логіни в Convex, Google Cloud, Netlify і будь-які секрети робить власник (кроки 👤 у планах); Claude лише каже, що зробити. Пушить на GitHub теж власник.
- Документи й плани — українською, тексти інтерфейсу — англійською.
- Нова поведінка — з тестом, що спершу падає.
- Коміти закінчуються рядком `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Історія

Переписано з Vite 4, React 18, Mantine 6 (Emotion), Tailwind 3, Firebase і Cloudinary на Vite 8, React 19, Mantine 9 і Convex у жовтні 2026; план і рішення — `docs/superpowers/plans/2026-10-18-vite-convex-migration.md` (там і баги старої версії, які міграція виправила).
