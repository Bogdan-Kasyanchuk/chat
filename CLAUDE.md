# chat

Онлайн-чат 1:1. Репозиторій: https://github.com/Bogdan-Kasyanchuk/chat, сайт на Netlify (деплой поки вручну через `netlify deploy -p`).

## Поточна робота (стан на 2026-10-18)

Проєкт переписується за двома планами. Код ще старий — жодна задача не виконана.

1. **Міграція й новий функціонал** — `docs/superpowers/plans/2026-10-18-vite-convex-migration.md`, 17 задач.
   - Наступний крок: задача 1, нова гілка `migrate/vite-convex` від `feature/temp` (вона на один коміт попереду `main`).
   - Перед стартом спитай власника, як виконувати: subagent-driven (рекомендовано для цього плану) чи native.
   - Позначай виконані кроки `- [x]` у плані й онови цей розділ наприкінці сесії.
2. **Редизайн** — `docs/superpowers/plans/2026-10-18-redesign.md`, 9 задач, виконується після міграції.
   - Канвас «Chat redesign» уже намальовано: https://claude.ai/artifact/XLx5GvCkUuVC57mLRdFhid (приватний, 26 артбордів). Задача 1, кроки 1–3 виконані.
   - Чекає огляду власником (задача 1, крок 4). Після погодження канвас копіюється в `docs/design/` (крок 5), щоб сесії без доступу до claude.ai теж його бачили.

Рішення власника, які вже ухвалені й не переглядаються (подробиці — розділ «Рішення» кожного плану):
- стек як у `tic-tac-toe`: Vite 8, React 19, TS ~6.0, React Router 8, Convex + Convex Auth (Google і пошта з паролем), GitHub-вхід прибирається;
- **UI лишається на Mantine**, оновлення до 9.x, стилі — тема Mantine + CSS modules (без Tailwind, SCSS, Emotion);
- контакти як у Telegram: пошук за точною поштою, інших користувачів не видно;
- дані з Firebase не переносяться, Convex стартує з порожньою базою;
- редизайн — світла й темна тема (за замовчуванням системна);
- емодзі: пікер `frimousse` у композері, великі повідомлення з 1–3 емодзі (задача 15 міграції).

## Зразок

`D:\WebDev\Projects\tic-tac-toe` — та сама міграція й редизайн, уже виконані. Звідти копіюються тулінг (`eslint.config.mjs`, `tsconfig*.json`, `vitest.config.ts`, `playwright.config.ts`), Convex Auth (`convex/auth.ts`, `authRules.ts`, `emailPassword.ts`, `test.setup.ts`, `testing.ts`) і підхід до тестів. Його `CLAUDE.md` і плани в `docs/superpowers/plans/` пояснюють рішення.

## Старий стек (до міграції)

Vite 4, React 18, Mantine 6 (`createStyles`, Emotion), Tailwind 3, Firebase (Auth + Firestore), Cloudinary для аватарів, Joi, yarn. Ключі Firebase і Cloudinary — у локальному `.env` (не в git). Баги старої версії, які виправляє міграція, — у плані міграції, розділ «Помилки старої версії».

## Правила

- Логіни в Convex, Google Cloud, Netlify і будь-які секрети робить власник (кроки 👤 у планах); Claude лише каже, що зробити. Пушить на GitHub теж власник.
- Документи й плани — українською, тексти інтерфейсу — англійською.
- Нова поведінка — з тестом, що спершу падає.
- Коміти закінчуються рядком `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
