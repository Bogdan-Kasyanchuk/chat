# chat

Онлайн-чат 1:1. Репозиторій: https://github.com/Bogdan-Kasyanchuk/chat, сайт на Netlify.

## Стек і структура

- Фронт: Vite 8, React 19, TypeScript ~6.0, React Router 8 (декларативний режим, імпорт з `react-router`), Mantine 9 (`@mantine/core`, `form`, `hooks`, `modals`, `notifications`, `mantine-contextmenu`), іконки `@tabler/icons-react`, пікер емодзі `frimousse` (дані `emojibase` копіює `scripts/copy-emojibase.mjs` у `predev`/`prebuild`).
- Стилі: тема Mantine (`src/theme.ts`), style props і `*.module.css` поруч із компонентом. Без Tailwind, SCSS, Emotion, `sx`/`createStyles`.
- Дизайн: канвас «Chat redesign» https://claude.ai/artifact/XLx5GvCkUuVC57mLRdFhid (приватний), копія в `docs/design/` (як читати — `docs/design/README.md`). Світла й темна тема, за замовчуванням системна; вибір System / Light / Dark зберігається на пристрої (ключ `chat-color-scheme`), смугу браузера фарбують `theme-color` в `index.html` і `useThemeColorMeta`. Шрифт Onest (`@fontsource-variable/onest`), акцент `brand-7`.
- Компонент — тека `src/components/X/` з `X.tsx`, `index.ts` (`export { default } from './X';`), `X.module.css`, `X.test.tsx`. Сторінки — `src/pages`, хуки — `src/hooks`, утиліти — `src/lib`, типи даних виводяться з API Convex у `src/types/chat.ts`.
- Бекенд: Convex (`convex/`). Чати, повідомлення, контакти, присутність, користувачі — `chats.ts`, `messages.ts`, `contacts.ts`, `presence.ts`, `users.ts`; чисті правила й ліміти — `chatRules.ts`; доступ — `access.ts`; каскадне видалення — `cascade.ts`. Вхід через Google або поштою з паролем (Convex Auth): `auth.ts`, `emailPassword.ts`, правила й тексти — `authRules.ts`. Усе, що має побачити людина, сервер кидає як `ConvexError` (звичайні `Error` на prod приховані); фронт імпортує тексти через `@convex/*`.
- Контакти як у Telegram: пошук за точною поштою, інших користувачів не видно. Користувач, що не є учасником чату, не читає й не змінює його повідомлень.

## Команди

- Node `>=24.19.0` (локально через nvm, на Netlify — `NODE_VERSION` у `netlify.toml`). Перший запуск: `npm install`, `npx convex dev`, `npx @convex-dev/auth` (ключі Convex Auth і `SITE_URL`), Google OAuth через `npx convex env set AUTH_GOOGLE_ID …` / `AUTH_GOOGLE_SECRET …`.
- Pre-commit: husky запускає `lint-staged` (`eslint --fix` для `*.{ts,tsx,mjs}`).
- `npx convex dev` — бекенд у режимі розробки; `npm run dev` — фронт на http://localhost:5173.
- `npm run test:once` — Vitest: функції Convex через `convex-test` (edge-runtime) і фронт (jsdom).
- `npm run test:e2e` — Playwright (проєкти `desktop` 1280px і `phone` 390px, `workers: 2`) проти `npm run dev`; Convex-бекенд має бути запущений. Тестові користувачі — лише `e2e-…@e2e.test`, прибирання — `npx convex run testing:deleteE2eUsers` (teardown робить це сам). `E2E_BASE_URL=<url>` — гнати тести проти вже запущеного/чужого фронту (тоді Playwright не піднімає Vite); `E2E_PROD=1` — teardown чистить prod (`convex run --prod`), а не dev.
- `npm run lint`, `npm run lint:fix`, `npm run typecheck` (три tsconfig: `src`, конфіги Vite/Vitest/Playwright, `convex`), `npm run build`.

## Конвенції

- Стиль коду — ESLint + `@stylistic`: 4 пробіли, `[ a ]`, `${ a }`, атрибути JSX у подвійних лапках, без висячих ком. Prettier не використовується. Після правок — `npm run lint:fix`.
- Стрілка, яка нічого не повертає, має блокове тіло (JSX-пропси, колбеки хуків, cleanup-и); стрілки, що повертають значення, лишаються як є.
- Кольори — лише токени `--chat-*` (значення для світлої й темної схем у `TOKENS`, `src/theme.ts`) і палітра Mantine з теми (`--mantine-color-brand-*`, `red-*`). Hex — тільки в `src/theme.ts`; білі, чорні, `gray-*` і `dark-*` Mantine у CSS не пишуться (`src/browserTheme.test.ts` це перевіряє). Новий токен — в обидві схеми; текстові пари мають 4.5:1 (тест у `src/theme.test.tsx`). Медіа-запити — міксинами `postcss-preset-mantine`. Перемикання десктоп/телефон — брейкпоінт `md` (48em).
- Нова поведінка — з тестом, що спершу падає.
- Тексти помилок і ліміти — константи в `convex/chatRules.ts` і `convex/authRules.ts`.

## Деплой і секрети

- Продакшн працює: https://bogkas-chat.netlify.app, Convex prod — `reliable-bulldog-316` (регіон `eu-west-1`). Netlify підключений до GitHub (production branch `main`), збірка `npx convex deploy --cmd 'npm run build'` (`netlify.toml`) оновлює функції Convex на prod і фронт. У Netlify потрібен лише `CONVEX_DEPLOY_KEY` (контекст Production, право `deployment:deploy`), deploy previews вимкнені. Кожен злитий у `main` коміт одразу йде на prod.
- Google OAuth: змінні `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` задаються через `npx convex env set` (dev) і `… --prod`. Redirect URI prod містить регіон: `https://reliable-bulldog-316.eu-west-1.convex.site/api/auth/callback/google`.
- Буфер обміну працює лише на https або localhost, тож «Copy text» у dev за LAN-адресою дає помилку.

## Поточна робота (міграція — стан на 2026-11-04, редизайн — на 2026-11-11)

**Міграція завершена:** PR #2 злитий у `main`, продакшн запущений 2026-11-04. План — `docs/superpowers/plans/2026-10-18-vite-convex-migration.md`, усі 17 задач. На prod пройшли e2e (19 тестів, 1 навмисно пропущений), власник перевірив вхід через Google і «Copy text» на телефоні.

Ще чекає на власника (👤): вимкнути Firebase і Cloudinary, коли вирішить.

Відкладене після фінального рев'ю: попередження `InvalidCursor` від `usePaginatedQuery` після масових видалень; «last seen» рахується від годинника браузера, тож у людини з неточним годинником він зсувається.

Розробка йде на **хмарному dev-деплойменті** Convex `academic-cormorant-489` (`.env.local`, вхід через Google і поштою працюють на http://localhost:5173). Для e2e бекенд має бути запущений, а годинник ПК — синхронізований, інакше тест «last seen just now» падає. Довге натискання перевірено на Android (2026-10-19).

**Редизайн** — `docs/superpowers/plans/2026-10-18-redesign.md`: 8 етапів (0–7), кожен — окрема гілка й PR у `develop`; етап 7 — фінальна звірка, документація і реліз одним PR `develop` → `main`. **Нова сесія починає з розділу «Стан» цього документа**: там видно, чи реліз уже на prod і що лишилось власнику (перевірка на телефоні, e2e проти prod). Поки реліз не злитий, у `main` — лише термінові виправлення prod (потім `git merge main` у `develop`).
- Netlify `develop` не збирає, і branch deploys для неї вмикати не можна: збірка робить `npx convex deploy` у prod;
- Undo після видалення повідомлень немає (рішення 2026-11-09);
- блокування користувачів немає: кнопки «Block» на смузі незнайомця не буде (рішення 2026-11-11).

Рішення власника, які вже ухвалені й не переглядаються (подробиці — розділ «Рішення» кожного плану):
- стек як у `tic-tac-toe`: Vite 8, React 19, TS ~6.0, React Router 8, Convex + Convex Auth (Google і пошта з паролем), GitHub-вхід прибрано;
- **UI лишається на Mantine**, оновлення до 9.x, стилі — тема Mantine + CSS modules (без Tailwind, SCSS, Emotion);
- контакти як у Telegram: пошук за точною поштою, інших користувачів не видно;
- дані з Firebase не переносяться, Convex стартує з порожньою базою;
- редизайн — світла й темна тема (за замовчуванням системна);
- емодзі: пікер `frimousse` у композері, великі повідомлення з 1–3 емодзі;
- одна пошта може належати двом акаунтам (пароль і Google, не зливаються): `users.findByEmail` віддає перевагу акаунту з Google-входом, серед рівних — найстарішому; вхід через Google не блокується, щоб той, хто першим зареєстрував чужу пошту з паролем, не міг відрізати власнику пошти вхід через Google (погоджено 2026-10-19).

## Зразок

`~/Documents/Projects/tic-tac-toe` — та сама міграція й редизайн, уже виконані. Його `CLAUDE.md` і плани в `docs/superpowers/plans/` пояснюють рішення.

## Правила

- Логіни в Convex, Google Cloud, Netlify і будь-які секрети робить власник (кроки 👤 у планах); Claude лише каже, що зробити. Пушить на GitHub теж власник.
- Документи й плани — українською, тексти інтерфейсу — англійською.
- Нова поведінка — з тестом, що спершу падає.
- Коміти закінчуються рядком `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Історія

Переписано з Vite 4, React 18, Mantine 6 (Emotion), Tailwind 3, Firebase і Cloudinary на Vite 8, React 19, Mantine 9 і Convex у жовтні 2026; план і рішення — `docs/superpowers/plans/2026-10-18-vite-convex-migration.md` (там і баги старої версії, які міграція виправила).

Редизайн за канвасом «Chat redesign» (листопад 2026): тема й токени для світлої й темної схем, шрифт Onest, вхід і реєстрація з вітриною, бічна панель з меню ☰ і нижніми вкладками на телефоні, налаштування панеллю, бульбашки групами, пікер емодзі, контекстне меню й нижні панелі дій, toast-и. Вісім етапів через гілку `develop`, на prod — одним релізом; план, рішення й журнал — `docs/superpowers/plans/2026-10-18-redesign.md`.
