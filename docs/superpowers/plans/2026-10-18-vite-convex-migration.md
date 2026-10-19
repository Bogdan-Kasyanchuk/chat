# Міграція chat на Vite 8 + Convex і новий функціонал месенджера — план реалізації

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** переписати чат з Vite 4 + Firebase + Mantine 6 на Vite 8 + React 19 + Mantine 9 + Convex за зразком міграції `tic-tac-toe`, виправити баги старої версії й додати функції популярних месенджерів: статус у мережі, контакти, дії з повідомленнями (ПКМ), налаштування чату, профіль, звук сповіщень, емодзі, вихід і видалення акаунта.

**Architecture:**
- **Бекенд.** Convex (`convex/`): таблиці `users` (розширена з `authTables`), `presence`, `contacts`, `chats`, `chatMembers`, `messages`. Уся логіка й перевірки доступу — у серверних функціях. Клієнт лише підписується на запити й викликає мутації. Вхід через Convex Auth: Google і пошта з паролем (провайдер `convex/emailPassword.ts` з `tic-tac-toe`). GitHub прибирається. Аватари зберігаються у Convex File Storage замість Cloudinary.
- **Фронт.** SPA на Vite з React Router 8 (декларативний режим, імпорт з `react-router`). UI — Mantine 9: тема в `createTheme`, розкладка через style props, решта стилів у `*.module.css` з `postcss-preset-mantine`. Відкритий чат визначає URL `/chat/:chatId`.
- **Вигляд.** Розкладка й палітра старої версії зберігаються приблизно: дві колонки на десктопі, одна на телефоні, сірий фон, темні акценти, кути без радіуса. Нові елементи (меню, діалоги, налаштування) робляться в тій самій палітрі. Піксель-у-піксель не потрібно: редизайн іде окремим планом `2026-10-18-redesign.md`. Тому компоненти розділені на логіку (хуки, запити) і презентацію, щоб редизайн міняв переважно тему, CSS modules і розмітку.

**Tech Stack:** Vite 8.3, React 19.3, TypeScript ~6.0.3, React Router 8.4, Mantine 9.7 (`@mantine/core`, `hooks`, `form`, `modals`, `notifications`), `mantine-contextmenu` 9.4, `frimousse` 0.4 + `emojibase-data` 16 (пікер емодзі), `@tabler/icons-react` 3, `postcss-preset-mantine` + `postcss-simple-vars`, Convex 1.47 + `@convex-dev/auth` 0.0.96 + `@auth/core` 0.41.3, `lucia` 3 (Scrypt), Vitest 5 + Testing Library + `convex-test`, Playwright, ESLint 9 + `@stylistic` + `perfectionist`, husky + lint-staged, Netlify.

**Виконання:** стан на 2026-10-19 — усі 17 задач виконані (subagent-driven) і пройшли фінальне рев'ю гілки, крім 👤-кроків: задача 2 кроки 2–3 і задача 17 крок 4. Галочки `- [x]` у кроках показують, що вже зроблено.

**Spec:** окремого документа немає. Специфікація — запит власника від 2026-10-18 і відповіді на уточнення, зведені в розділ «Рішення». Зразок рішень і тулінгу — `D:\WebDev\Projects\tic-tac-toe` (`CLAUDE.md`, `docs/superpowers/plans/2026-10-12-vite-convex-migration.md`, `docs/superpowers/plans/2026-10-15-redesign-email-auth.md`).

## Рішення

- Стек як у `tic-tac-toe`: Vite 8 + React 19 + TS 6 + React Router 8 + Convex з Convex Auth. **UI-бібліотека лишається Mantine**, оновлюється з 6 до 9. Tailwind, SCSS, Emotion і Prettier прибираються. Стилі: тема Mantine + style props + CSS modules (рішення власника).
- Пакетний менеджер — npm, як у `tic-tac-toe`. `yarn.lock` видаляється.
- **Вхід:** Google і пошта з паролем, як у `tic-tac-toe` (реєстрація одразу входить, без підтвердження пошти й скидання пароля; пароль від 8 до 128 символів; пошта обрізається й переводиться в нижній регістр; перевірка зайнятої пошти — на сервері, всередині реєстрації). **GitHub прибирається.** Під час реєстрації поштою людина вводить ім'я.
- **Повторний вхід через Google не перезаписує ім'я й аватар,** які людина змінила в профілі. Convex Auth за замовчуванням патчить `users` даними Google при кожному вході, тому в `convex/auth.ts` є власний `callbacks.createOrUpdateUser`.
- **Дані Firebase не переносяться** (рішення власника): Convex стартує з порожньою базою. Firebase-проєкт і Cloudinary власник вимикає сам, коли захоче.
- **Тільки особисті чати 1:1.** Груп немає.
- **Контакти як у Telegram** (рішення власника):
  - людину знаходять за точною поштою й додають у контакти;
  - чат з'являється у співрозмовника лише після першого повідомлення;
  - якщо пише людина не з контактів, над чатом показується банер «Add to contacts»;
  - інших користувачів ніхто не бачить, загального каталогу немає.
  Пошук за точною поштою дозволяє перевірити, чи зареєстрована адреса. Це свідомий компроміс, як пошук за номером у Telegram. Відповідь містить лише ім'я й аватар.
- **Статус у мережі — автоматичний,** як у месенджерах:
  - клієнт шле heartbeat кожні 25 с, поки вкладка відкрита;
  - якщо heartbeat не приходив 60 с, сервер через планувальник ставить `online: false`;
  - вихід з акаунта одразу ставить offline;
  - у шапці чату — «online» або «last seen …».
  Ручні статуси старої версії («do not disturb», «out of place») прибираються.
- **Прочитання:** для кожного учасника чату зберігається `lastReadAt`. Одна галочка — надіслано, дві — співрозмовник прочитав. Лічильник непрочитаних і розділювач «Unread messages» рахуються від `lastReadAt`. Чат позначається прочитаним, коли він відкритий, вкладка видима, а список прокручений донизу.
- **Дії з повідомленням** (ПКМ на десктопі, довге натискання на телефоні; `mantine-contextmenu`):
  - **Reply** — цитата над композером, у бульбашці — блок відповіді;
  - **Edit** — лише свої й не переслані; з'являється позначка «edited»;
  - **Copy text**;
  - **Forward** — вибір чату або контакту; у бульбашці «Forwarded from <ім'я автора оригіналу>»;
  - **Select** — режим вибору: кілька повідомлень можна переслати, скопіювати або видалити;
  - **Delete** — свої можна видалити для обох (чекбокс «Also delete for <ім'я>»), будь-які — лише для себе.
  Відповідь на видалене повідомлення показує «Deleted message».
- **Налаштування чату** (меню ⋮ у шапці):
  - **Mute / Unmute notifications** — без звуку й toast-а;
  - **Clear history** — для себе або й для співрозмовника;
  - **Delete chat** — для себе або для обох. Чат, видалений для себе, повертається при новому повідомленні, але лише з повідомленнями після видалення;
  - **Add to contacts / Remove from contacts**.
- **Профіль:**
  - ім'я — від 1 до 64 символів після обрізання;
  - аватар — PNG, JPEG, WebP або GIF до 5 MB, з прев'ю; файл перевіряється на сервері за метаданими сховища; старий файл видаляється;
  - аватар можна прибрати.
- **Звук сповіщень:** `classic` (наявний `newMessage.mp3`), `chime`, `pop`, `ding` (синтезуються через Web Audio, без файлів і ліцензій) і `none`. Зберігається на сервері в `users.sound`, у налаштуваннях є кнопка прослуховування.
- **Емодзі** (додано 2026-10-18 на прохання власника):
  - кнопка зі смайлом у композері відкриває пікер `frimousse`:
    - на десктопі — поповер над кнопкою;
    - на телефоні — панель висотою 300px замість клавіатури; кнопка стає «Show keyboard» і повертає фокус у поле;
  - у пікері: пошук англійською, «Recently used» (до 18 останніх, у `localStorage` під ключем `chat-recent-emoji`), категорії, вибір відтінку шкіри (теж запам'ятовується);
  - емодзі вставляється в позицію курсора, а не в кінець, і пікер лишається відкритим для наступного;
  - дані емодзі (`emojibase-data`) лежать на нашому сайті в `/emojibase`, а не тягнуться з CDN;
  - повідомлення з 1–3 емодзі без іншого тексту показується великим (44px) без бульбашки, як у Telegram і WhatsApp;
  - на сервері нічого не змінюється: емодзі — звичайний текст, ліміт `MAX_MESSAGE_LENGTH` рахує символи UTF-16 так само.
- **Сповіщення про нове повідомлення:** звук і toast з аватаром і текстом, клік відкриває чат. Не спрацьовує, коли:
  - чат замʼючений;
  - повідомлення моє (наприклад, з іншої вкладки);
  - цей чат відкритий і вкладка видима;
  - це перше завантаження списку.
- **Вихід** — з підтвердженням. **Видалення акаунта** — з підтвердженням, як у Telegram:
  - видаляються профіль, аватар, контакти в обидва боки, членства в чатах, presence, сесії й акаунти входу;
  - повідомлення лишаються у співрозмовників, автор показується як «Deleted account»;
  - писати такому акаунту не можна.
- Тексти UI англійською, як зараз.

### Помилки старої версії, що виправляються

1. Кожен клієнт завантажує всі повідомлення й усі контакти всіх користувачів: `useCollectionData(collection(...))` без фільтра. Це і витік приватності, і проблема з продуктивністю. **Тепер** сервер віддає лише чати й повідомлення, де людина учасник, повідомлення — посторінково.
2. Правил доступу немає: будь-який клієнт може змінити будь-яке повідомлення чи контакт. **Тепер** кожна мутація перевіряє `userId` і членство в чаті.
3. Статус «online» ніколи не скидається, якщо закрити вкладку, а не натиснути Logout. **Тепер** presence з heartbeat.
4. «Last seen, 2.02pm» захардкоджено (`MessagesBoard.tsx:937`). **Тепер** справжній `lastSeenAt`.
5. Галочки прочитання завжди червоні (`true ? red : gray` у `ContactItem` і `MessageItem`). **Тепер** одна або дві галочки за `lastReadAt` співрозмовника.
6. Дата зберігається рядком `toLocaleDateString('en-US')` із секундною точністю, і сортування парсить цей рядок. **Тепер** `_creationTime` (мс).
7. Позначення прочитаним через `setTimeout(3000)` без очищення таймера: спрацьовує після виходу з чату й повторно на кожну зміну даних. **Тепер** одна мутація `chats.markRead` за умов з «Рішень».
8. `MessagesBoard`: `useMemo` контакту без `idActiveContact` у залежностях, тож після перемикання видно старий контакт. Падіння, якщо контакт зник. **Тепер** чат береться з URL і запиту `chats.get`, а `null` веде на `/`.
9. Звук: `new Audio` на кожен рендер, немає перевірки видимості вкладки й mute, падіння на порожньому списку (`lastMessage.idInterlocutor`). **Тепер** чиста функція `findIncoming` з тестами і один плеєр.
10. Валідацію форм входу й реєстрації закоментовано, `confirmPassword` не перевіряється, форма скидається навіть після помилки входу. **Тепер** валідація на клієнті й сервері, після помилки поля лишаються.
11. Після реєстрації поштою ім'я — «User», аватар — чужа картинка з `dataUser.json`. **Тепер** ім'я вводиться при реєстрації, без аватара показуються ініціали.
12. «Update profile»: помилка Cloudinary пише `avatar: undefined`, порожнє ім'я пише `''`, шапка показує старе ім'я до перезавантаження (`useAuthState` не бачить `updateProfile`). **Тепер** серверна валідація і реактивний `users.me`.
13. «Delete profile» падає з `auth/requires-recent-login`, лишаючи акаунт без документа (наступний вхід його відтворює), а повідомлення — сиротами. **Тепер** одна транзакційна мутація каскаду.
14. Пункт «General setings», кнопки ⋮ і емодзі нічого не роблять. **Тепер** ⋮ — налаштування чату, «Settings» — модалка налаштувань, кнопка емодзі відкриває пікер (задача 15).
15. `useKeyDown` перепідписується на кожен рендер, і Escape закриває чат навіть під відкритою модалкою. **Тепер** Escape обробляють модалки Mantine; закриття чату — `useHotkeys` з `@mantine/hooks`, коли модалок немає.
16. Повідомлення з самих пробілів надсилається. **Тепер** сервер обрізає текст і відхиляє порожній.
17. `console.log` у `MessagesBoard`; `PrivateRoute` губить адресу, з якої прийшла людина. **Тепер** без логів; `state.from` повертає на `/chat/:id` після входу.

## Global Constraints

- Node `>=22.12` (вимога Vite 8).
- TypeScript `~6.0.3`, **не 7.x**: `typescript-eslint@8` має peer `typescript <6.1.0`.
- ESLint `^9`, **не 10**: `eslint-plugin-import@2.32` не підтримує ESLint 10.
- `@auth/core@^0.41.3` (у 0.41.1 є критичні вразливості); `@convex-dev/auth@^0.0.96`; `convex@^1.47.0`.
- Mantine — **усі пакети `@mantine/*` однієї версії `^9.7.3`**. `mantine-contextmenu@^9.4.0`. React `^19.2` (peer Mantine 9).
- Роутер імпортується з `react-router` (не `react-router-dom`), декларативний режим `BrowserRouter` / `Routes` / `Route`.
- **Стилі:**
  - лише тема Mantine (`src/theme.ts`), style props і `*.module.css` поруч із компонентом;
  - кольори в CSS — тільки через змінні Mantine (`var(--mantine-color-…)`) або через токени теми, не hex;
  - медіа-запити — міксинами `postcss-preset-mantine` (`@mixin smaller-than $mantine-breakpoint-md`);
  - без Tailwind, SCSS, Emotion і `sx`/`createStyles` (їх у Mantine 9 немає).
- Брейкпоінти як у старій темі: `xs` 22.5em, `sm` 36em, `md` 48em, `lg` 64em, `xl` 90em. Перемикання десктоп/телефон — `md`: у CSS і в `useMediaQuery('(min-width: 48em)')`.
- **Стиль коду як у `tic-tac-toe`:**
  - `eslint.config.mjs` копіюється звідти без змін правил, з власними `globalIgnores`;
  - 4 пробіли, `[ a ]`, `${ a }`, атрибути JSX у подвійних лапках, без висячих ком;
  - стрілка, яка нічого не повертає, має блокове тіло;
  - після правок — `npm run lint:fix`.
- Компонент — тека `components/X/X.tsx` + `index.ts` з `export { default } from './X';` (+ `X.module.css`, + `X.test.tsx`). Пропси типізуються поруч. Барелів `components/index.ts`, тек `interfaces/` і `types/T*.ts` немає. Типи даних виводяться з API Convex (`FunctionReturnType`) у `src/types/chat.ts`.
- Усе, що має побачити людина, сервер кидає як `ConvexError('текст')`: звичайні `Error` на prod приховані. Клієнт показує `error.data`, для інших помилок — запасний текст. Тексти помилок — константи в `convex/chatRules.ts` і `convex/authRules.ts`; фронт імпортує їх через `@convex/*`.
- Часові пороги — константи в `convex/chatRules.ts`: `HEARTBEAT_MS = 25_000`, `ONLINE_TIMEOUT_MS = 60_000`. Ліміти: `MAX_MESSAGE_LENGTH = 4096`, `MAX_NAME_LENGTH = 64`, `MAX_AVATAR_BYTES = 5 * 1024 * 1024`, `MAX_BATCH = 100` (повідомлень за одну дію), `DELETE_BATCH = 200` (повідомлень за один крок фонового видалення).
- **Тестові користувачі** — лише адреси `e2e-…@e2e.test`. Прибирання: `npx convex run testing:deleteE2eUsers`.
- Перевірки в браузері Claude робить сам через Playwright MCP на `npm run dev` із запущеним `npx convex dev`. Власника кличемо лише для входу через Google.
- Кроки з позначкою 👤 виконує власник: логіни в Convex, Google Cloud, Netlify і будь-які секрети. Claude лише каже, що зробити. Пушить на GitHub теж власник.
- Нова поведінка — з тестом, що спершу падає. Після кожної задачі: `npm run lint:fix && npm run typecheck && npm run test:once` — усе зелене.
- Кожен коміт закінчується рядком `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Повторний вхід через Google після зміни імені чи аватара.** Ім'я й аватар з профілю лишаються, Google їх не перезаписує. Тест — задача 2.
2. **Чужий чат.** Користувач, що не є учасником, не читає повідомлень (`messages.list` кидає «Chat not found»), не пише й не змінює їх, а `chats.get` повертає `null`. Тести — задачі 5 і 6.
3. **Сповіщення там, де їх не має бути:** замʼючений чат, моє повідомлення з іншої вкладки, відкритий чат у видимій вкладці, перше завантаження списку. Тест — задача 13 (`findIncoming`).
4. **Співрозмовник видалив акаунт посеред розмови.** Чат лишається з іменем «Deleted account», композер вимкнено, `messages.send` відхиляється. Повідомлення видаленого автора видно. Тести — задачі 8 і 11.
5. **«Delete chat» для себе, потім нове повідомлення.** Чат повертається в список лише з новими повідомленнями, лічильник непрочитаних рахує тільки їх. Тест — задача 7.

---

## Структура файлів після міграції

```
chat/
├─ .claude/launch.json               конфіг preview (vite, 5173), як у tic-tac-toe
├─ convex/
│  ├─ _generated/                    генерує `convex dev`, комітиться
│  ├─ auth.ts  auth.config.ts  http.ts   Convex Auth: Google + EmailPassword, createOrUpdateUser
│  ├─ authRules.ts / .test.ts        копія з tic-tac-toe + validateName
│  ├─ emailPassword.ts               копія з tic-tac-toe (+ обов'язкове ім'я при signUp)
│  ├─ chatRules.ts / .test.ts        константи, тексти помилок, normalizeBody, normalizeName, pairKey, SOUNDS
│  ├─ schema.ts                      users (розширена) presence contacts chats chatMembers messages
│  ├─ validators.ts                  soundValidator
│  ├─ access.ts                      requireUserId, requireMember, partnerOf, userView, avatarUrl
│  ├─ users.ts / .test.ts            me, findByEmail, updateName, generateAvatarUploadUrl, setAvatar, setSound, deleteAccount, internal emailStatus
│  ├─ presence.ts / .test.ts         heartbeat, disconnect, internal expire, presenceOf
│  ├─ contacts.ts / .test.ts         list, add, remove
│  ├─ chats.ts / .test.ts            list, get, open, markRead, setMuted, clearHistory, remove, internal deleteMessagesBatch
│  ├─ messages.ts / .test.ts         list, send, edit, remove, forward
│  ├─ cascade.ts                     deleteUserCascade (спільне для deleteAccount і testing)
│  ├─ testing.ts / .test.ts          internal deleteE2eUsers
│  └─ test.setup.ts                  modules, setup, asUser
├─ e2e/                              helpers.ts, chat.spec.ts, account.spec.ts, teardown.ts, fixtures/avatar.png
├─ public/                           іконки й маніфест без змін
├─ src/
│  ├─ main.tsx  App.tsx  theme.ts  global.css  vite-env.d.ts
│  ├─ assets/sounds/classic.mp3      (колишній newMessage.mp3)
│  ├─ lib/       errorMessage, authError, initials, formatTime(+test), lastSeen(+test), incoming(+test), sounds(+test), emoji(+test)
│  ├─ hooks/     useFrom, useIsDesktop, useNow, usePresenceHeartbeat, useIncomingNotifications, useMarkRead
│  ├─ types/     chat.ts
│  ├─ test/      setup.ts, render.tsx
│  ├─ routes/    PrivateRoute/, PublicRoute/
│  ├─ pages/     SignInPage/, SignUpPage/, ConversationPage/, NotFoundPage/
│  └─ components/
│     ├─ AuthCard  GoogleButton  ConfirmModal  PresenceAvatar  StatusText
│     ├─ ChatLayout  Sidebar  UserMenu  ChatList  ChatListItem  ContactsPanel  ContactItem  AddContactModal  EmptyChat
│     ├─ ConversationHeader  ChatSettingsMenu  StrangerBanner  MessageList  MessageBubble  DaySeparator
│     ├─ UnreadDivider  ScrollDownButton  Composer  EmojiPicker  SelectionBar
│     ├─ MessageMenu  DeleteMessagesModal  ForwardModal  ChatActionModal
│     └─ SettingsModal  ProfileSettings  AvatarUpload  SoundSettings  AccountSettings
├─ scripts/copy-emojibase.mjs        копіює дані emojibase-data у public/emojibase (gitignored)
├─ index.html  vite.config.ts  vitest.config.ts  playwright.config.ts  postcss.config.cjs
├─ tsconfig.json  tsconfig.node.json  eslint.config.mjs
└─ netlify.toml  package.json  README.md  CLAUDE.md
```

Видаляються: `src/service/` (Firebase, Cloudinary, Joi), `src/middlewares/`, `src/helpers/`, `src/interfaces/`, `src/types/TSetIdActiveContact.ts`, `src/data/`, `src/index.scss`, усі `*.styles.ts`, компоненти `Button`, `ButtonScroll`, `Chat`, `ContactsBoard`, `Form`, `Home`, `Login`, `Register`, `MessagesBoard`, `ModalConfirm`, `UpdateProfile`, `StartViewChat`, `Error_404`, старі хуки, `tailwind.config.cjs`, `.prettierrc.yaml`, `yarn.lock`, `.DS_Store`, `dist/` з git (якщо відстежується).

---

### Task 1: Репозиторій і тулінг (Vite 8, TS 6, Mantine 9, ESLint)

**Files:**
- Move: `src/` → `legacy/` (довідка до задачі 17), `legacy/assets/newMessage.mp3` → `src/assets/sounds/classic.mp3`
- Delete: `tailwind.config.cjs`, `.prettierrc.yaml`, `yarn.lock`, `**/.DS_Store`, `node_modules/`
- Create: `package.json` (перезапис), `vite.config.ts`, `tsconfig.json` і `tsconfig.node.json` (перезапис, як у `tic-tac-toe`), `postcss.config.cjs` (перезапис), `eslint.config.mjs` (копія з `tic-tac-toe`), `src/theme.ts`, `src/global.css`, `src/vite-env.d.ts`, `src/main.tsx` (тимчасовий), `.husky/pre-commit`, `.claude/launch.json`
- Modify: `.gitignore`, `index.html`

**Interfaces:**
- Produces:
  - аліаси `@/*` → `src/*` і `@convex/*` → `convex/*`;
  - `theme` (default export `src/theme.ts`, `createTheme`): `primaryColor: 'dark'`, `defaultRadius: 0`, брейкпоінти з Global Constraints;
  - скрипти `dev`, `build`, `preview`, `typecheck`, `lint`, `lint:fix`, `prepare`.

- [x] **Step 1: Гілка й прибирання старого**

```bash
git switch -c migrate/vite-convex
git mv src legacy
mkdir -p src/assets/sounds
git mv legacy/assets/newMessage.mp3 src/assets/sounds/classic.mp3
git rm tailwind.config.cjs .prettierrc.yaml yarn.lock
git rm --cached -r dist 2>/dev/null; find . -name .DS_Store -not -path './node_modules/*' -delete
rm -rf node_modules
```

Скопіюй цей план і `2026-10-18-redesign.md` у `docs/superpowers/plans/`, якщо їх там ще немає.

- [x] **Step 2: `package.json`**

Як у `tic-tac-toe`: `name: "chat"`, `version: "1.0.0"`, `private`, `type: "module"`, `engines.node: ">=22.12"`, `lint-staged` для `*.{ts,tsx,mjs}`. Скрипти: `dev` (`vite`), `build` (`npm run typecheck && vite build`), `preview`, `typecheck` (`tsc -p . && tsc -p tsconfig.node.json`), `lint`, `lint:fix`, `prepare` (`husky`).

```bash
npm i react@^19.3.0 react-dom@^19.3.0 react-router@^8.4.0 @mantine/core@^9.7.3 @mantine/hooks@^9.7.3 @mantine/form@^9.7.3 @mantine/modals@^9.7.3 @mantine/notifications@^9.7.3 mantine-contextmenu@^9.4.0 @tabler/icons-react@^3.49.0 clsx@^2.1.1
npm i -D vite@^8.3.4 @vitejs/plugin-react@^6.1.2 typescript@~6.0.3 @types/react@^19.3.0 @types/react-dom@^19.3.0 @types/node@^24 postcss@^8 postcss-preset-mantine@^1.18.0 postcss-simple-vars@^7 eslint@^9 @eslint/js@^9 typescript-eslint@^8.71.1 eslint-plugin-react-hooks@^7.1.1 eslint-plugin-react-refresh@^0.5.7 @stylistic/eslint-plugin@^5.10.0 eslint-plugin-import@^2.32.0 eslint-plugin-perfectionist@^5.12.1 globals@^17 husky@^9.1.7 lint-staged@^17.6.0
```

- [x] **Step 3: Конфіги**

- `vite.config.ts`: як у `tic-tac-toe` (плагін `react()`, `server.host: true`, аліаси `@` і `@convex`), без `tailwindcss()`.
- `tsconfig.json` і `tsconfig.node.json`: копії з `tic-tac-toe`.
- `postcss.config.cjs`: `postcss-preset-mantine` + `postcss-simple-vars` зі змінними `$mantine-breakpoint-xs/sm/md/lg/xl` = `22.5em / 36em / 48em / 64em / 90em` (за документацією Mantine «PostCSS preset»).
- `eslint.config.mjs`: копія з `tic-tac-toe`. У `globalIgnores`: `dist/**`, `legacy/**`, `convex/_generated/**`, `.claude/**`, `docs/**`.
- `.gitignore`: додати `*.local`, `.env.local`, `.superpowers`, `.playwright-mcp`, `playwright-report/`, `test-results/`.
- `.husky/pre-commit`: `npx lint-staged`. `.claude/launch.json`: копія з `tic-tac-toe`.
- `index.html`: `description` → `Online chat`, `theme-color` лишається.

- [x] **Step 4: Тема й тимчасовий `main.tsx`**

`src/theme.ts`: `createTheme` з `primaryColor: 'dark'`, `defaultRadius: 0`, `breakpoints` з Global Constraints, `components.Container.defaultProps = { size: 1440 }`. `src/global.css`: `html, body, #root { height: 100%; }` і фон `body` — `var(--mantine-color-gray-2)`. Фонова текстура з `transparenttextures.com` прибирається: це зовнішній хост.

`src/main.tsx` імпортує `@mantine/core/styles.css`, `@mantine/notifications/styles.css`, `mantine-contextmenu/styles.css` (у порядку з документації `mantine-contextmenu`) і `@/global.css`. Рендерить `<MantineProvider theme={ theme }><Title>Chat</Title></MantineProvider>`. `src/vite-env.d.ts` оголошує `VITE_CONVEX_URL: string`.

- [x] **Step 5: Перевірка**

```bash
npm run lint:fix && npm run lint && npm run typecheck && npm run build
```

Очікується: усе зелене, на `npm run dev` видно заголовок «Chat» шрифтом Mantine.

- [x] **Step 6: Коміт**

```bash
git add -A
git commit -m "chore: replace Vite 4, Tailwind and Mantine 6 with Vite 8, TS 6 and Mantine 9"
```

---

### Task 2: Convex, Convex Auth (Google + пошта) і `users.me`

**Files:**
- Create: `convex/schema.ts`, `convex/validators.ts`, `convex/chatRules.ts` (поки лише `NOT_SIGNED_IN`, `SOUNDS`, `DEFAULT_SOUND`; задача 3 доповнює), `convex/authRules.ts` + `.test.ts`, `convex/emailPassword.ts`, `convex/users.ts` + `.test.ts`, `convex/access.ts`, `convex/test.setup.ts`, `vitest.config.ts`, `src/test/setup.ts`, `src/test/viewport.ts` (копія з `tic-tac-toe`), `src/test/render.tsx`
- Create (генератор): `convex/auth.ts`, `convex/auth.config.ts`, `convex/http.ts`, `convex/tsconfig.json`, `convex/_generated/*`, `.env.local`
- Modify: `package.json` (скрипти)

**Interfaces:**
- Produces:
  - `api.users.me`: query → `{ id: Id<'users'>, name: string, email: string, avatar: string | null, sound: Sound } | null`;
  - `internal.users.emailStatus({ email })` → `EmailStatus` (як у `tic-tac-toe`);
  - з `convex/access.ts`:
    - `requireUserId(ctx): Promise<Id<'users'>>` — без входу кидає `ConvexError(NOT_SIGNED_IN)`;
    - `avatarUrl(ctx, user: Doc<'users'>): Promise<string | null>` — URL файлу `avatarId`, інакше `user.image ?? null`;
  - `soundValidator` у `convex/validators.ts`, тип `Sound = 'classic' | 'chime' | 'pop' | 'ding' | 'none'`;
  - `setup()` і `asUser(t, name)` у `convex/test.setup.ts` (як у `tic-tac-toe`);
  - `renderWithProviders(ui, { route?: string })` у `src/test/render.tsx` (`MantineProvider` з темою + `MemoryRouter`);
  - `mockViewport(desktop: boolean): void` у `src/test/viewport.ts` (підміняє `matchMedia` для `(min-width: 48em)`; `setup.ts` викликає `mockViewport(false)` перед кожним тестом);
  - скрипти `dev:convex`, `test`, `test:once`; `typecheck` додає `tsc -p convex`.

- [x] **Step 1: Залежності, скрипти, Vitest**

```bash
npm i convex@^1.47.0 @convex-dev/auth@^0.0.96 @auth/core@^0.41.3 lucia@^3.2.2
npm i -D vitest@^5.0.5 convex-test@^0.0.62 @edge-runtime/vm@^5 jsdom@^30 @testing-library/react@^16 @testing-library/dom@^10 @testing-library/user-event@^14
```

`vitest.config.ts` — копія з `tic-tac-toe` (проєкти `convex` у edge-runtime і `frontend` у jsdom). `src/test/setup.ts`:
- поліфіли з документації Mantine «Testing with Vitest» (`window.matchMedia`, `ResizeObserver`, `getComputedStyle`, `scrollIntoView`);
- `HTMLMediaElement.prototype.play = () => Promise.resolve()`.

- [ ] **Step 2: 👤 Проєкт Convex і Convex Auth** (поки що замість нього анонімний локальний деплоймент, див. CLAUDE.md)

```bash
npx convex dev
npx @convex-dev/auth
```

Створити проєкт `chat`. `npx convex dev` лишити працювати в окремому терміналі. На запит `SITE_URL` відповісти `http://localhost:5173`.

- [ ] **Step 3: 👤 Google OAuth**

Окремий від `tic-tac-toe` клієнт «Web application» у Google Auth Platform:
- origins `http://localhost:5173`;
- redirect URI `https://<dev-deployment>.convex.site/api/auth/callback/google`.

```bash
npx convex env set AUTH_GOOGLE_ID <client id>
npx convex env set AUTH_GOOGLE_SECRET <client secret>
```

- [x] **Step 4: Схема**

`convex/schema.ts`: `...authTables`, а таблиця `users` перевизначена за документацією Convex Auth «Customizing schema». Поля `authTables.users` (`name`, `image`, `email`, `emailVerificationTime`, `phone`, `phoneVerificationTime`, `isAnonymous`) плюс `avatarId: v.optional(v.id('_storage'))` і `sound: v.optional(soundValidator)`. Індекси `email` і `phone`. Решту таблиць додають задачі 3–5.

- [x] **Step 5: Правила входу й провайдер пошти**

`convex/authRules.ts` і `convex/emailPassword.ts` копіюються з `tic-tac-toe` разом із `authRules.test.ts`. Зміни:
- у `authRules.ts` додати `validateName(value: unknown): string`. Вона обрізає рядок і кидає `ConvexError('Name is required')`, якщо він порожній, або `ConvexError('Name is too long')`, якщо довший за 64;
- у `emailPassword.ts` під час `signUp` ім'я обов'язкове: `profile: { email, name: validateName(params.name) }`.

`convex/auth.ts` — як у `tic-tac-toe` (`providers: [ Google, EmailPassword ]`, `callbacks.redirect` через `redirectUrl`) плюс `callbacks.createOrUpdateUser`:

```ts
// Без цього Convex Auth при кожному вході через Google патчить users даними Google і стирає ім'я та аватар з профілю
createOrUpdateUser: async (ctx, { existingUserId, profile }) => {
    if (existingUserId) {
        return existingUserId;
    }

    return ctx.db.insert('users', { name: profile.name, email: profile.email, image: profile.image });
}
```

Поля `profile` типізуються як `string | undefined`: Convex Auth віддає `Record<string, unknown>`, тож значення приводяться через `typeof … === 'string'`.

- [x] **Step 6: Тести `users`**

```ts
test('me returns null for an anonymous visitor', …)       // null
test('me returns the profile with the default sound', …)  // { id, name: 'Alice', email: 'alice@example.com', avatar: 'https://example.com/Alice.png', sound: 'classic' }
test('me prefers the uploaded avatar over the provider image', …) // storage file → avatar = ctx.storage.getUrl(id)
// Review Focus 1
test('signing in again through Google keeps the edited name and avatar', async () => {
    // Вставити користувача з name 'Edited', викликати callback createOrUpdateUser з existingUserId і profile { name: 'Google Name', image: 'g.png' }
    // Очікується: повертає existingUserId, у документі name === 'Edited', image не змінився
});
// emailStatus — три тести з tic-tac-toe без змін
```

Callback тестується напряму: експортувати `createOrUpdateUser` з `convex/auth.ts` окремою іменованою функцією й передати її в `convexAuth`.

- [x] **Step 7: Реалізація `users.me` і `access.ts`**

`me` повертає `sound: user.sound ?? 'classic'` і `avatar: await avatarUrl(ctx, user)`.

- [x] **Step 8: Перевірка й коміт**

Run: `npm run lint:fix && npm run typecheck && npm run test:once`. Очікується: усе зелене.

```bash
git add -A
git commit -m "feat(convex): Google and email sign-in that keeps edited profiles, users.me"
```

---

### Task 3: Presence — статус у мережі

**Files:**
- Create: `convex/chatRules.test.ts`, `convex/presence.ts` + `.test.ts`
- Modify: `convex/schema.ts`, `convex/chatRules.ts`

**Interfaces:**
- Consumes: `requireUserId`.
- Produces:
  - таблиця `presence { userId: Id<'users'>, lastSeenAt: number, online: boolean, expireJobId?: Id<'_scheduled_functions'> }`, індекс `by_user`;
  - `api.presence.heartbeat({})` і `api.presence.disconnect({})` → `null`;
  - `internal.presence.expire({ userId })` → `null`;
  - `presenceOf(ctx, userId): Promise<{ online: boolean, lastSeenAt: number | null }>`;
  - з `convex/chatRules.ts`:
    - константи з Global Constraints;
    - тексти `NOT_SIGNED_IN = 'Not signed in'`, `CHAT_NOT_FOUND = 'Chat not found'`, `MESSAGE_NOT_FOUND = 'Message not found'`, `MESSAGE_EMPTY = 'Message is empty'`, `MESSAGE_TOO_LONG = 'Message is too long'`, `NOT_YOUR_MESSAGE = 'You can only edit your own messages'`, `FORWARDED_NOT_EDITABLE = 'Forwarded messages can\'t be edited'`, `DELETE_FOR_EVERYONE_OWN_ONLY = 'You can only delete your own messages for everyone'`, `ACCOUNT_DELETED = 'This account was deleted'`, `USER_NOT_FOUND = 'User not found'`, `CANNOT_ADD_SELF = 'You can\'t add yourself'`, `AVATAR_TYPE = 'Upload a PNG, JPEG, WebP or GIF image'`, `AVATAR_TOO_BIG = 'Image must be 5 MB or smaller'`, `DELETED_ACCOUNT = 'Deleted account'`, `DELETED_MESSAGE = 'Deleted message'`;
    - `AVATAR_TYPES = [ 'image/png', 'image/jpeg', 'image/webp', 'image/gif' ]`, `SOUNDS`, `DEFAULT_SOUND = 'classic'`;
    - `normalizeBody(value: string): string` — обрізає й кидає `MESSAGE_EMPTY` / `MESSAGE_TOO_LONG`;
    - `pairKey(a: string, b: string): string` — відсортовані id через `|`.

- [x] **Step 1: Тести `chatRules`**

```ts
test('normalizeBody trims and rejects blank text', () => {
    expect(normalizeBody('  hi \n')).toBe('hi');
    expect(() => normalizeBody(' \n\t ')).toThrow(MESSAGE_EMPTY);
    expect(() => normalizeBody('a'.repeat(4097))).toThrow(MESSAGE_TOO_LONG);
});
test('pairKey does not depend on the order', () => {
    expect(pairKey('b', 'a')).toBe('a|b');
    expect(pairKey('a', 'b')).toBe('a|b');
});
```

- [x] **Step 2: Тести `presence`** (фейкові таймери, як у `tic-tac-toe/convex/games.test.ts`)

```ts
test('heartbeat marks the user online', …)                // presenceOf → { online: true, lastSeenAt: Date.now() }
test('without heartbeats the user goes offline after the timeout', …)
    // heartbeat; vi.advanceTimersByTime(ONLINE_TIMEOUT_MS); finishInProgressScheduledFunctions → online false, lastSeenAt = час heartbeat
test('a newer heartbeat cancels the pending expiry', …)
    // heartbeat; +40 с; heartbeat; +40 с; виконати заплановане → online true
test('disconnect marks offline at once', …)
test('a user who never connected has no last seen', …)   // { online: false, lastSeenAt: null }
test('heartbeat requires sign-in', …)                     // rejects NOT_SIGNED_IN
```

- [x] **Step 3: Реалізація**

`heartbeat` робить upsert рядка: `lastSeenAt = Date.now()`, `online = true`. Попереднє завдання скасовується (`ctx.scheduler.cancel(expireJobId)`), нове ставиться `ctx.scheduler.runAfter(ONLINE_TIMEOUT_MS, internal.presence.expire, { userId })`, його id зберігається. `expire` ставить `online = false`. `disconnect` ставить `online = false` і `lastSeenAt = now`, а також скасовує завдання.

- [x] **Step 4: Перевірка й коміт**

```bash
npm run lint:fix && npm run typecheck && npm run test:once
git add -A && git commit -m "feat(convex): presence with heartbeat and scheduled expiry"
```

---

### Task 4: Контакти, пошук за поштою, відкриття чату

**Files:**
- Create: `convex/contacts.ts` + `.test.ts`, `convex/chats.ts` (лише `open`) + `.test.ts`
- Modify: `convex/schema.ts`, `convex/users.ts` (+ `findByEmail`), `convex/users.test.ts`, `convex/access.ts`

**Interfaces:**
- Consumes: `requireUserId`, `presenceOf`, `avatarUrl`, `normalizeEmail` (`authRules`), `pairKey`.
- Produces:
  - таблиці:
    - `contacts { ownerId, contactId }`, індекси `by_owner [ownerId, contactId]` і `by_contact [contactId]`;
    - `chats { pairKey: string, lastMessageAt: number }`, індекс `by_pair`;
    - `chatMembers { chatId, userId, lastReadAt: number, clearedAt: number, muted: boolean, hidden: boolean }`, індекси `by_user [userId]` і `by_chat [chatId, userId]`;
  - тип `UserView = { userId: Id<'users'> | null, name: string, avatar: string | null, online: boolean, lastSeenAt: number | null }`. Для видаленого користувача: `userId: null`, `name: DELETED_ACCOUNT`, `avatar: null`, `online: false`, `lastSeenAt: null`;
  - з `access.ts`: `userView(ctx, userId): Promise<UserView>`;
  - `api.users.findByEmail({ email })` → `{ userId, name, avatar, isContact: boolean } | null`. Для себе й для неіснуючої адреси — `null`; некоректна пошта — `ConvexError` з `normalizeEmail`;
  - `api.contacts.list({})` → `Array<UserView & { userId: Id<'users'>, chatId: Id<'chats'> | null }>`, сортування за `name` (`localeCompare`);
  - `api.contacts.add({ userId })` і `api.contacts.remove({ userId })` → `null`. `add` ідемпотентна, кидає `CANNOT_ADD_SELF` / `USER_NOT_FOUND`;
  - `api.chats.open({ userId })` → `Id<'chats'>`:
    - знаходить чат за `pairKey` або створює його;
    - мій `chatMembers` створюється з `hidden: false`, співрозмовника — з `hidden: true`;
    - якщо мій рядок був `hidden`, відкриває його.

- [x] **Step 1: Тести**

```ts
test('findByEmail finds a user by exact email, case-insensitive', …)  // ' Bob@Example.com ' → { name: 'Bob', isContact: false }
test('findByEmail returns null for yourself and for unknown emails', …)
test('contacts.add is idempotent and shows up in the list with presence', …) // add двічі → один рядок, online/lastSeenAt із presence
test('contacts.add rejects yourself', …)                               // CANNOT_ADD_SELF
test('contacts are private to their owner', …)                         // Bob не бачить контактів Alice
test('chats.open returns the same chat for both directions', …)        // alice.open(bob) === bob.open(alice)
test('a new chat is hidden for the partner until the first message', …) // у Bob chatMembers.hidden === true
test('contacts.list links an existing chat', …)                         // chatId не null після open
```

- [x] **Step 2: Реалізація й перевірка**

Run: `npm run test:once`. Очікується: PASS.

- [x] **Step 3: Коміт**

```bash
git add -A && git commit -m "feat(convex): contacts, email lookup and opening a chat"
```

---

### Task 5: Повідомлення й список чатів

**Files:**
- Create: `convex/messages.ts` (`list`, `send`) + `.test.ts`
- Modify: `convex/schema.ts`, `convex/chats.ts` (`list`, `get`, `markRead`), `convex/chats.test.ts`, `convex/access.ts`

**Interfaces:**
- Consumes: `userView`, `normalizeBody`, `requireUserId`.
- Produces:
  - таблиця `messages { chatId, authorId: Id<'users'>, body: string, replyToId?: Id<'messages'>, forwardedFromId?: Id<'users'>, editedAt?: number, hiddenFor: Id<'users'>[] }`, індекс `by_chat [chatId]` (діапазон по `_creationTime` іде через індекс);
  - з `access.ts`: `requireMember(ctx, chatId, userId): Promise<Doc<'chatMembers'>>` — кидає `CHAT_NOT_FOUND`, якщо рядка немає або він `hidden`; `partnerOf(ctx, chatId, userId): Promise<Doc<'chatMembers'> | null>`;
  - `api.messages.list({ chatId, paginationOpts })` → `PaginationResult<MessageView>`, від нових до старих. Береться лише `_creationTime > clearedAt`, повідомлення з `hiddenFor ∋ me` відфільтровуються зі сторінки. `MessageView`:
    - `id`, `body`, `createdAt` (= `_creationTime`), `authorIsMe`;
    - `editedAt: number | null`;
    - `forwardedFrom: string | null` — ім'я або `DELETED_ACCOUNT`;
    - `replyTo: { id: Id<'messages'> | null, authorName: string, body: string } | null` — для видаленого оригіналу `{ id: null, authorName: '', body: DELETED_MESSAGE }`;
    - `read: boolean` — для моїх: `partner.lastReadAt >= createdAt`, для чужих `true`;
  - `api.messages.send({ chatId, body, replyToId? })` → `Id<'messages'>`:
    - перевіряє членство, наявність співрозмовника (інакше `ACCOUNT_DELETED`) і що `replyToId` з цього чату;
    - ставить `chats.lastMessageAt`, обом `hidden: false`, мені `lastReadAt = now`;
  - `api.chats.list({})` → `ChatSummary[]` за `lastMessageAt` спадно, без `hidden`. `ChatSummary`:
    - `chatId`, `partner: UserView & { isContact: boolean }`;
    - `lastMessage: { id, body, authorIsMe, createdAt, read } | null` — останнє видиме після `clearedAt` і не приховане;
    - `unread: number` — чужі після `max(lastReadAt, clearedAt)`, не приховані, рахуються до 100;
    - `muted`, `lastMessageAt`;
  - `api.chats.get({ chatId })` → `{ chatId, partner: UserView & { isContact }, muted, lastReadAt, canSend: boolean } | null`. `null` — не учасник або `hidden`;
  - `api.chats.markRead({ chatId })` → `null`, `lastReadAt = Date.now()`.

- [x] **Step 1: Тести**

```ts
test('send trims the text and the partner sees the chat after the first message', …)
test('a blank message is rejected', …)                                   // MESSAGE_EMPTY
// Review Focus 2
test('an outsider cannot read, send to or see a chat', async () => {
    // Carol: messages.list → rejects CHAT_NOT_FOUND; messages.send → rejects CHAT_NOT_FOUND; chats.get → null
});
test('list pages from newest to oldest', …)                              // 30 повідомлень, numItems 20 → 20 найновіших, isDone false
test('my message becomes read when the partner marks the chat read', …)  // read false → bob.markRead → read true
test('unread counts only the partner messages after lastReadAt', …)      // 3 від Bob, 1 від Alice → unread 3; markRead → 0
test('chats.list orders by the last message', …)
test('a reply carries the quoted message', …)                            // replyTo { authorName: 'Alice', body: 'hi' }
test('a reply to a message from another chat is rejected', …)            // MESSAGE_NOT_FOUND
test('sending marks the chat read for the sender', …)
```

- [x] **Step 2: Реалізація й перевірка**

Пагінація — `paginationOptsValidator` і `.order('desc').paginate(...)` по індексу `by_chat` з `.gt('_creationTime', clearedAt)`. Run: `npm run test:once` → PASS.

- [x] **Step 3: Коміт**

```bash
git add -A && git commit -m "feat(convex): paginated messages, chat list with unread counts and read receipts"
```

---

### Task 6: Дії з повідомленнями — редагування, видалення, пересилання

**Files:**
- Modify: `convex/messages.ts` (+ `edit`, `remove`, `forward`), `convex/messages.test.ts`

**Interfaces:**
- Consumes: `requireMember`, `partnerOf`, `normalizeBody`.
- Produces:
  - `api.messages.edit({ messageId, body })` → `null`. Ставить `editedAt = now`. Кидає `NOT_YOUR_MESSAGE`, `FORWARDED_NOT_EDITABLE`, `MESSAGE_NOT_FOUND` (зокрема для повідомлення з чужого чату чи прихованого для мене);
  - `api.messages.remove({ messageIds: Id<'messages'>[], forEveryone: boolean })` → `null`:
    - від 1 до `MAX_BATCH` повідомлень, усі з одного чату, де я учасник;
    - `forEveryone` — документи видаляються, але лише якщо всі мої (інакше `DELETE_FOR_EVERYONE_OWN_ONLY`);
    - без `forEveryone` — мій id додається в `hiddenFor`;
  - `api.messages.forward({ messageIds, toChatId })` → `null`:
    - нові повідомлення в `toChatId` у порядку `_creationTime` оригіналів;
    - `forwardedFromId = original.forwardedFromId ?? original.authorId`;
    - ті самі побічні ефекти, що й у `send`.

- [x] **Step 1: Тести**

```ts
test('the author edits a message and it is marked edited', …)
test('nobody edits someone else\'s message', …)                 // NOT_YOUR_MESSAGE
test('a forwarded message cannot be edited', …)
test('delete for me hides the message only for me', …)          // у Alice немає, у Bob є
test('delete for everyone removes my messages for both', …)
test('delete for everyone refuses a selection with the partner\'s message', …) // DELETE_FOR_EVERYONE_OWN_ONLY, нічого не видалено
test('a reply to a deleted message shows Deleted message', …)
test('forward keeps the original author through a second forward', …) // Alice → Carol → Dave: forwardedFrom 'Alice'
test('forward to a chat I am not in is rejected', …)             // CHAT_NOT_FOUND
test('remove rejects messages from different chats', …)          // MESSAGE_NOT_FOUND
```

- [x] **Step 2: Реалізація, перевірка, коміт**

```bash
npm run test:once
git add -A && git commit -m "feat(convex): edit, delete for me or everyone, and forward messages"
```

---

### Task 7: Налаштування чату — mute, очищення, видалення

**Files:**
- Modify: `convex/chats.ts` (+ `setMuted`, `clearHistory`, `remove`, internal `deleteMessagesBatch`), `convex/chats.test.ts`

**Interfaces:**
- Produces:
  - `api.chats.setMuted({ chatId, muted })` → `null`;
  - `api.chats.clearHistory({ chatId, forEveryone })` → `null`. Для себе — `clearedAt = now`. Для обох — `internal.chats.deleteMessagesBatch({ chatId, deleteChat: false })`;
  - `api.chats.remove({ chatId, forEveryone })` → `null`. Для себе — `hidden: true`, `clearedAt = now`. Для обох — обидва `hidden: true`, потім `deleteMessagesBatch({ chatId, deleteChat: true })`, яка в кінці видаляє `chatMembers` і `chats`;
  - `internal.chats.deleteMessagesBatch({ chatId, deleteChat })` видаляє до `DELETE_BATCH` повідомлень. Якщо лишились ще, ставить себе знову `runAfter(0)`.

- [x] **Step 1: Тести**

```ts
test('a muted chat reports muted in the list', …)
test('clear history for me keeps the partner\'s history', …)
test('clear history for everyone empties the chat for both', …)        // finishAllScheduledFunctions; 450 повідомлень → 0
test('delete chat for everyone removes the chat and members', …)
// Review Focus 5
test('a chat deleted for me comes back with only the new messages', async () => {
    // 2 повідомлення → alice.remove(forEveryone false) → у списку Alice чату немає
    // bob.send('new') → чат у списку Alice, lastMessage.body 'new', unread 1, messages.list містить лише 'new'
});
```

- [x] **Step 2: Реалізація, перевірка, коміт**

```bash
npm run test:once
git add -A && git commit -m "feat(convex): mute, clear history and delete chat"
```

---

### Task 8: Профіль, звук і видалення акаунта

**Files:**
- Create: `convex/cascade.ts`, `convex/testing.ts` + `.test.ts`
- Modify: `convex/users.ts` (+ `updateName`, `generateAvatarUploadUrl`, `setAvatar`, `setSound`, `deleteAccount`), `convex/users.test.ts`

**Interfaces:**
- Consumes: `validateName`, `AVATAR_TYPES`, `MAX_AVATAR_BYTES`.
- Produces:
  - `api.users.updateName({ name })` → `null`;
  - `api.users.generateAvatarUploadUrl({})` → `string`;
  - `api.users.setAvatar({ storageId: Id<'_storage'> | null })` → `null`:
    - метадані беруться з `ctx.db.system.get('_storage', storageId)`;
    - якщо тип не з `AVATAR_TYPES` чи розмір більший за `MAX_AVATAR_BYTES`, файл видаляється і кидається `AVATAR_TYPE` / `AVATAR_TOO_BIG`;
    - старий `avatarId` видаляється зі сховища;
    - `null` прибирає аватар: `avatarId` і `image` → `undefined`;
  - `api.users.setSound({ sound })` → `null`;
  - `api.users.deleteAccount({})` → `null`, викликає `deleteUserCascade`;
  - `deleteUserCascade(ctx: MutationCtx, userId): Promise<void>` у `convex/cascade.ts` видаляє:
    - `contacts` за `by_owner` і `by_contact`;
    - мої `chatMembers`. Якщо в чаті не лишилось учасників — повідомлення й сам чат через `deleteMessagesBatch(deleteChat: true)`;
    - `presence` (зі скасуванням `expireJobId`);
    - файл `avatarId`;
    - `authAccounts`, `authSessions` з `authRefreshTokens`, `authVerificationCodes` та `authVerifiers` цих сесій;
    - сам `users`;
  - `internal.testing.deleteE2eUsers({})` → `number` — `deleteUserCascade` для кожного `@e2e.test`.

- [x] **Step 1: Тести**

```ts
test('updateName trims and validates', …)                        // '  Al  ' → 'Al'; '' → 'Name is required'
test('setAvatar replaces and deletes the previous file', …)       // t.run: ctx.storage.store(new Blob([...], { type: 'image/png' }))
test('setAvatar rejects a non-image and deletes the upload', …)   // text/plain → AVATAR_TYPE, файлу немає
test('setAvatar rejects files over 5 MB', …)
test('setAvatar(null) falls back to initials', …)                 // me.avatar === null
test('setSound stores the choice', …)
// Review Focus 4
test('after deleting an account the partner keeps the chat as Deleted account and cannot send', async () => {
    // Alice і Bob переписались, Bob у контактах Alice; bob.deleteAccount
    // alice: chats.list[0].partner.name === 'Deleted account', userId null; contacts.list порожній
    // messages.list містить повідомлення Bob; alice.send → rejects ACCOUNT_DELETED; chats.get.canSend === false
});
test('deleteAccount removes sessions so the old token is useless', …) // authSessions за userId порожні
test('deleteE2eUsers deletes only @e2e.test users', …)
```

- [x] **Step 2: Реалізація, перевірка, коміт**

```bash
npm run test:once
git add -A && git commit -m "feat(convex): profile name, avatar upload, sound and account deletion"
```

---

### Task 9: Каркас фронту — провайдери, маршрути, вхід і реєстрація

**Files:**
- Create:
  - `src/main.tsx` (перезапис), `src/App.tsx`
  - `src/lib/errorMessage.ts`, `src/lib/authError.ts` (копії з `tic-tac-toe`), `src/lib/initials.ts`
  - `src/hooks/useFrom.ts` (копія), `src/hooks/useIsDesktop.ts`, `src/hooks/usePresenceHeartbeat.ts`
  - `src/routes/{PrivateRoute,PublicRoute}/` + тести (копії з `tic-tac-toe` з `/chat/:chatId` замість `/game/:gameId`)
  - `src/components/{AuthCard,GoogleButton,ConfirmModal,PresenceAvatar}/`
  - `src/pages/{SignInPage,SignUpPage,NotFoundPage}/` + тести
  - `src/types/chat.ts`

**Interfaces:**
- Consumes: `api.users.me`, `api.presence.*`, `HEARTBEAT_MS`, `MIN_PASSWORD_LENGTH`, `normalizeEmail`.
- Produces:
  - `main.tsx`: `ConvexAuthProvider` → `BrowserRouter` → `MantineProvider theme` → `ContextMenuProvider` → `ModalsProvider` + `Notifications position="top-center" autoClose={ 4000 }` → `App`;
  - маршрути `App`:
    - `/login` і `/signup` — `PublicRoute restricted`;
    - `/` і `/chat/:chatId` — `PrivateRoute` → `ChatLayout` (задача 10);
    - `*` — `NotFoundPage`;
    - поки `useConvexAuth().isLoading` — `LoadingOverlay`;
  - `useIsDesktop(): boolean` — `useMediaQuery('(min-width: 48em)')`;
  - `usePresenceHeartbeat(): void`:
    - `heartbeat` одразу й кожні `HEARTBEAT_MS`, поки `useDocumentVisibility() === 'visible'`;
    - при поверненні у вкладку — одразу;
    - очищення інтервалу в cleanup;
  - `ConfirmModal({ opened, title, children, confirmLabel, danger?, loading?, onConfirm, onClose })`;
  - `PresenceAvatar({ name, avatar, online?, size })` — `Avatar` з ініціалами (`initials(name)`), `Indicator` зеленого кольору, коли `online`;
  - `initials(name: string): string` — до двох перших літер слів, верхній регістр, `'?'` для порожнього;
  - у `src/types/chat.ts`: `ChatSummary`, `ChatView`, `MessageView`, `ContactView`, `UserView` як `FunctionReturnType<typeof api.…>`.

- [x] **Step 1: Тести сторінок і маршрутів**

Тести `SignInPage` і `PrivateRoute` / `PublicRoute` переносяться з `tic-tac-toe` з `/chat/c1` замість `/game/g1`. Нові:

```ts
// SignUpPage
test('requires a name and matching passwords before calling the server', …)
    // порожнє Name → 'Name is required'; Confirm password ≠ → 'Passwords do not match'; signIn не викликано
test('signs up with a trimmed name and lowercased email', …)
    // signIn('password', { name: 'Alice', email: 'alice@example.com', password, flow: 'signUp' })
test('keeps the fields after a server error', …)  // ConvexError(EMAIL_TAKEN) → текст видно, Email не очищено
```

- [x] **Step 2: Реалізація**

- Форми — `@mantine/form` з валідаторами `isEmail('Enter a valid email')`, `hasLength({ min: 8 }, 'Password must be at least 8 characters')`, `matchesField('password', 'Passwords do not match')`.
- `AuthCard` — центрована `Paper` шириною 360px у старій палітрі: заголовок, Google-кнопка, `Divider label="or"`, форма, посилання між входом і реєстрацією.
- Тексти:
  - кнопки — «Continue with Google», «Sign in», «Create account»;
  - поля — «Name», «Email», «Password», «Confirm password»;
  - посилання — «No account? Sign up» і «Have an account? Sign in»;
  - `NotFoundPage` — тексти старого `Error_404`.

- [x] **Step 3: Перевірка й коміт**

Run: `npm run lint:fix && npm run typecheck && npm run test:once` → PASS. Перевірка в браузері: реєстрація `e2e-…@e2e.test` веде на `/`, а `/chat/x` без входу — на `/login` і назад.

```bash
git add -A && git commit -m "feat: app shell with Convex auth, sign-in and sign-up on Mantine 9"
```

---

### Task 10: Бічна панель — чати, контакти, меню користувача

**Files:**
- Create:
  - `src/lib/formatTime.ts` + `.test.ts`, `src/lib/lastSeen.ts` + `.test.ts`, `src/hooks/useNow.ts`
  - `src/components/{ChatLayout,Sidebar,UserMenu,ChatList,ChatListItem,ContactsPanel,ContactItem,AddContactModal,EmptyChat,StatusText}/` + `*.module.css`
  - тести `ChatListItem.test.tsx`, `AddContactModal.test.tsx`

**Interfaces:**
- Consumes: `api.chats.list`, `api.contacts.*`, `api.users.findByEmail`, `api.chats.open`, `usePresenceHeartbeat`, `useIsDesktop`.
- Produces:
  - `formatListTime(ts: number, now: number): string` — сьогодні `14:02` (24 год), у межах 6 днів — `Mon`, цього року — `Oct 12`, інакше — `Oct 12, 2025`;
  - `formatClock(ts: number): string` — `14:02`;
  - `dayLabel(ts: number, now: number): string` — `Today`, `Yesterday`, `October 12`, `October 12, 2025`;
  - `lastSeenText(view: { online: boolean, lastSeenAt: number | null }, now: number): string`:
    - `online`;
    - `last seen just now` — до 1 хв;
    - `last seen 5 minutes ago` (`1 minute ago` в однині) — до 60 хв;
    - `last seen today at 14:02`, `last seen yesterday at 09:15`;
    - `last seen Oct 12` (цього року), `last seen Oct 12, 2025`;
    - `last seen a long time ago` для `null`;
  - `useNow(intervalMs = 30_000): number`;
  - `ChatLayout`:
    - на десктопі — `Sidebar` 35% (мін. 340px) + `Outlet`, без відкритого чату — `EmptyChat` («Choose who you would like to write to»);
    - на телефоні — `Sidebar` на `/`, лише `Outlet` на `/chat/:chatId`;
    - викликає `usePresenceHeartbeat()` і `useIncomingNotifications` (задача 13);
  - `Sidebar`:
    - `UserMenu`;
    - `SegmentedControl` «Chats» / «Contacts»;
    - пошук `TextInput type="search"` (фільтр за іменем, без регістру) у кожній вкладці;
  - `UserMenu` — аватар та ім'я, `Menu` з пунктами «Settings», «Logout». «Logout» відкриває `ConfirmModal` «Log out?» з кнопкою «Log out»: `presence.disconnect`, потім `signOut()`, потім `/login`. Модалку налаштувань дає задача 14;
  - `ChatListItem({ chat, active, now })`:
    - `PresenceAvatar`, ім'я, прев'ю останнього повідомлення з префіксом `You: ` для мого;
    - час `formatListTime`;
    - для мого останнього — галочки `IconCheck` / `IconChecks`;
    - бейдж `unread` (`99+` понад 99), сірий для `muted`, іконка `IconVolumeOff` для `muted`;
    - `NavLink` на `/chat/:chatId`;
  - `ContactsPanel` — кнопка «Add contact» і список `ContactItem`. Клік — `chats.open`, потім `/chat/:id`;
  - `AddContactModal`:
    - поле «Email», кнопка «Find»;
    - результат — картка з «Add to contacts» (або «In contacts») і «Message»;
    - нічого не знайдено — «No user with this email».

- [x] **Step 1: Тести чистих функцій**

```ts
const now = new Date(2026, 9, 18, 15, 0).getTime();
test('formatListTime', () => {
    expect(formatListTime(new Date(2026, 9, 18, 14, 2).getTime(), now)).toBe('14:02');
    expect(formatListTime(new Date(2026, 9, 12, 9, 0).getTime(), now)).toBe('Mon');
    expect(formatListTime(new Date(2026, 3, 1).getTime(), now)).toBe('Apr 1');
    expect(formatListTime(new Date(2025, 9, 12).getTime(), now)).toBe('Oct 12, 2025');
});
test('dayLabel', …)       // Today / Yesterday / October 12 / October 12, 2025
test('lastSeenText', () => {
    expect(lastSeenText({ online: true, lastSeenAt: now }, now)).toBe('online');
    expect(lastSeenText({ online: false, lastSeenAt: now - 30_000 }, now)).toBe('last seen just now');
    expect(lastSeenText({ online: false, lastSeenAt: now - 60_000 }, now)).toBe('last seen 1 minute ago');
    expect(lastSeenText({ online: false, lastSeenAt: now - 5 * 60_000 }, now)).toBe('last seen 5 minutes ago');
    expect(lastSeenText({ online: false, lastSeenAt: new Date(2026, 9, 18, 9, 5).getTime() }, now)).toBe('last seen today at 09:05');
    expect(lastSeenText({ online: false, lastSeenAt: new Date(2026, 9, 17, 22, 0).getTime() }, now)).toBe('last seen yesterday at 22:00');
    expect(lastSeenText({ online: false, lastSeenAt: null }, now)).toBe('last seen a long time ago');
});
```

- [x] **Step 2: Тести компонентів** (`vi.mock('convex/react')`, як у `tic-tac-toe`)

```ts
test('ChatListItem shows You: prefix, read ticks and a capped unread badge', …) // unread 120 → '99+'
test('ChatListItem greys the badge of a muted chat', …)                       // data-muted
test('AddContactModal finds a user and adds them', …)                         // findByEmail → 'Bob' → «Add to contacts» → contacts.add({ userId })
test('AddContactModal says when nobody has the email', …)
```

- [x] **Step 3: Реалізація, перевірка в браузері (1280px і 390px), коміт**

```bash
npm run lint:fix && npm run typecheck && npm run test:once
git add -A && git commit -m "feat: sidebar with chats, contacts, email lookup and logout"
```

---

### Task 11: Розмова — шапка, стрічка, композер

**Files:**
- Create:
  - `src/pages/ConversationPage/` + тест
  - `src/hooks/useMarkRead.ts`
  - `src/components/{ConversationHeader,StrangerBanner,MessageList,MessageBubble,DaySeparator,UnreadDivider,ScrollDownButton,Composer}/` + `*.module.css`
  - тести `MessageBubble.test.tsx`, `Composer.test.tsx`

**Interfaces:**
- Consumes: `api.chats.get`, `api.messages.list` (`usePaginatedQuery`, сторінка 30), `api.messages.send`, `api.chats.markRead`, `api.contacts.add`, `lastSeenText`, `dayLabel`, `formatClock`.
- Produces:
  - `ConversationPage`:
    - `chatId` з URL; `chats.get === null` — `Navigate` на `/` з toast-ом «Chat not found»;
    - стан `replyTo: MessageView | null`, `editing: MessageView | null` (заповнює задача 12);
    - Escape без відкритих модалок: скасовує відповідь чи редагування, інакше закриває чат (`useHotkeys`);
  - `ConversationHeader({ chat, now })`:
    - «назад» на телефоні;
    - `PresenceAvatar`, ім'я, `StatusText` (`lastSeenText`);
    - для `Deleted account` статусу немає;
    - справа слот для `ChatSettingsMenu` (задача 12);
  - `StrangerBanner({ chat })` — коли `!chat.partner.isContact && chat.partner.userId`: «<name> is not in your contacts» + «Add to contacts»;
  - `MessageList({ chatId, lastReadAtOnOpen, onReply, … })`:
    - старіші сторінки підвантажуються, коли до верху лишається менше 200px, позиція прокрутки при цьому зберігається;
    - `DaySeparator` між днями;
    - `UnreadDivider` («Unread messages») перед першим чужим повідомленням, новішим за `lastReadAtOnOpen` (знімок `chat.lastReadAt` на момент відкриття);
    - при відкритті прокрутка до розділювача, інакше донизу;
    - нове повідомлення прокручує донизу, якщо людина була внизу або це її повідомлення;
  - `MessageBubble({ message, partnerName, selected?, onContextMenu? })`:
    - мої — справа темні, чужі — зліва сірі;
    - блок «Forwarded from X»;
    - цитата відповіді (клік прокручує до оригіналу, якщо він завантажений);
    - текст з `white-space: pre-wrap`;
    - час `formatClock`, «edited», галочки для моїх;
  - `ScrollDownButton({ visible, unread, onClick })`;
  - `Composer({ disabled, replyTo, editing, onCancel, onSubmit })`:
    - `Textarea autosize maxRows={ 6 }`, Enter надсилає, Shift+Enter переносить рядок;
    - кнопка `IconSend` з `aria-label="Send"`;
    - панель «Reply to <name>» / «Edit message» з кнопкою закрити;
    - якщо `disabled` — замість поля текст «You can't message a deleted account»;
  - `useMarkRead(chatId, { atBottom: boolean, hasUnread: boolean }): void` — `markRead`, коли `atBottom && hasUnread && document.visibilityState === 'visible'`, і повторно при поверненні у вкладку.

- [x] **Step 1: Тести**

```ts
test('Composer sends on Enter and adds a newline on Shift+Enter', …)
test('Composer does not send whitespace', …)                     // onSubmit не викликано
test('MessageBubble shows forwarded, reply quote, edited and read ticks', …)
test('MessageBubble renders a deleted reply as Deleted message', …)
// Review Focus 4
test('ConversationPage disables the composer for a deleted account', …) // chats.get → canSend false → текст видно, поля немає
test('ConversationPage redirects home when the chat is gone', …)     // chats.get → null → '/'
```

- [x] **Step 2: Реалізація й перевірка в браузері**

Два контексти Playwright MCP, `e2e-…@e2e.test`:
- повідомлення доходить без перезавантаження;
- галочки стають подвійними, коли другий відкриває чат;
- розділювач «Unread messages» на місці;
- 60+ повідомлень підвантажуються вгору без стрибка.

- [x] **Step 3: Коміт**

```bash
npm run lint:fix && npm run typecheck && npm run test:once
git add -A && git commit -m "feat: conversation with paginated history, unread divider, read receipts and composer"
```

---

### Task 12: ПКМ-меню, вибір, пересилання, видалення, налаштування чату

**Files:**
- Create:
  - `src/components/{MessageMenu,SelectionBar,DeleteMessagesModal,ForwardModal,ChatSettingsMenu,ChatActionModal}/` + тести
- Modify: `ConversationPage`, `MessageList`, `MessageBubble`, `ConversationHeader`

**Interfaces:**
- Consumes: `api.messages.{edit,remove,forward}`, `api.chats.{setMuted,clearHistory,remove,list,open}`, `api.contacts.{add,remove,list}`, `useContextMenu` з `mantine-contextmenu`, `useLongPress` і `useClipboard` з `@mantine/hooks`.
- Produces:
  - `messageActions(message: MessageView): Array<'reply' | 'edit' | 'copy' | 'forward' | 'select' | 'delete'>` у `src/components/MessageMenu/messageActions.ts` — `edit` лише для `authorIsMe && !forwardedFrom`;
  - `MessageMenu`:
    - ПКМ (`onContextMenu`) на десктопі й `useLongPress` (400 мс, `cancelOnMove: true`) на телефоні відкривають `showContextMenu`;
    - пункти «Reply», «Edit», «Copy text», «Forward», «Select», «Delete» з іконками `@tabler/icons-react`;
    - «Copy text» показує toast «Copied»;
  - режим вибору в `ConversationPage`: `selected: Set<Id<'messages'>>`. Клік по бульбашці перемикає вибір, Escape скасовує. `SelectionBar` замість шапки: «N selected», «Forward», «Copy», «Delete», «Cancel». «Copy» склеює тексти в хронологічному порядку через `\n\n`;
  - `DeleteMessagesModal({ messages, partnerName, onDone })`:
    - заголовок «Delete message?» / «Delete N messages?»;
    - чекбокс «Also delete for <partnerName>» лише коли всі вибрані мої й співрозмовник існує;
    - кнопка «Delete»;
  - `ForwardModal({ messageIds, onDone })`:
    - пошук і список чатів (`chats.list`) плюс контакти без чату (`contacts.list`, без дублів за `userId`);
    - вибір контакту — спершу `chats.open`;
    - після пересилання — перехід у цільовий чат;
  - `ChatSettingsMenu({ chat })` — ⋮ з `aria-label="Chat settings"`. Пункти:
    - «Mute notifications» / «Unmute notifications»;
    - «Add to contacts» / «Remove from contacts»;
    - «Clear history», «Delete chat» (червоний);
  - `ChatActionModal({ kind: 'clear' | 'delete', chat, onDone })`:
    - «Clear history?» / «Delete chat?»;
    - чекбокс «Also for <name>» (для «Deleted account» його немає);
    - після «Delete chat» — перехід на `/`.

- [x] **Step 1: Тести**

```ts
test('messageActions offers edit only for my own non-forwarded messages', …)
test('right click opens the menu and Reply fills the composer bar', …)
test('Select mode toggles messages and Delete removes them for me', …)        // remove({ messageIds: [a, b], forEveryone: false })
test('Delete offers Also delete for Bob only when all selected are mine', …)
test('Forward to a contact without a chat opens it first', …)                 // chats.open → forward({ toChatId })
test('Delete chat for everyone calls remove and goes home', …)                // remove({ chatId, forEveryone: true }) → '/'
test('Mute toggles the label', …)
```

- [x] **Step 2: Реалізація, перевірка в браузері (ПКМ на 1280px, довге натискання на 390px з `hasTouch`), коміт**

```bash
npm run lint:fix && npm run typecheck && npm run test:once
git add -A && git commit -m "feat: message context menu, selection, forward, delete and chat settings"
```

---

### Task 13: Сповіщення й звуки

**Files:**
- Create: `src/lib/incoming.ts` + `.test.ts`, `src/lib/sounds.ts` + `.test.ts`, `src/hooks/useIncomingNotifications.ts`
- Modify: `src/components/ChatLayout/ChatLayout.tsx`

**Interfaces:**
- Consumes: `ChatSummary`, `Sound`, `api.users.me`.
- Produces:
  - `findIncoming(prev: ChatSummary[] | undefined, next: ChatSummary[], options: { activeChatId: string | null, pageVisible: boolean }): ChatSummary[]` — чати, де `lastMessage.id` змінився і він:
    - не мій;
    - чат не `muted`;
    - не `activeChatId` при `pageVisible`.
    При `prev === undefined` (перше завантаження) повертає `[]`;
  - `SOUND_OPTIONS: Array<{ value: Sound, label: string }>` — `Classic`, `Chime`, `Pop`, `Ding`, `None`;
  - `playSound(sound: Sound): Promise<void>`:
    - `classic` — один `HTMLAudioElement` з `@/assets/sounds/classic.mp3`, створений ліниво;
    - решта — синтез через спільний `AudioContext`;
    - `none` — нічого;
    - відмову автоплею браузера мовчки ковтає;
  - синтез, `SYNTH: Record<'chime' | 'pop' | 'ding', Array<{ freq: number, start: number, duration: number, type: OscillatorType }>>`, гучність 0.2 з експоненційним затуханням:
    - `chime` — 880 Гц 0–0.12 с і 1320 Гц 0.1–0.3 с, `sine`;
    - `pop` — 620 Гц 0–0.08 с, `triangle`;
    - `ding` — 1046 Гц 0–0.4 с, `sine`;
  - `useIncomingNotifications(chats: ChatSummary[] | undefined, activeChatId: string | null): void`:
    - тримає попередній список у ref;
    - для кожного з `findIncoming` грає `me.sound` (один раз на оновлення) і показує `notifications.show` з аватаром, іменем і текстом;
    - клік по сповіщенню веде на `/chat/:chatId`.

- [x] **Step 1: Тести** (Review Focus 3)

```ts
test('the first load never notifies', …)                            // prev undefined → []
test('a new partner message notifies', …)
test('my own message from another tab does not notify', …)          // authorIsMe
test('a muted chat does not notify', …)
test('the open chat notifies only when the tab is hidden', …)       // activeChatId = chat, pageVisible true → []; false → [chat]
test('an unchanged last message does not notify again', …)
test('playSound none plays nothing and classic reuses one audio element', …)
```

- [x] **Step 2: Реалізація, перевірка (два контексти: toast і звук у фоновому чаті, тиша в замʼюченому), коміт**

```bash
npm run lint:fix && npm run typecheck && npm run test:once
git add -A && git commit -m "feat: new message notifications with selectable sounds and per-chat mute"
```

---

### Task 14: Налаштування — профіль, звук, акаунт

**Files:**
- Create: `src/components/{SettingsModal,ProfileSettings,AvatarUpload,SoundSettings,AccountSettings}/` + тести
- Modify: `src/components/UserMenu/UserMenu.tsx`

**Interfaces:**
- Consumes: `api.users.{me,updateName,generateAvatarUploadUrl,setAvatar,setSound,deleteAccount}`, `api.presence.disconnect`, `useAuthActions().signOut`, `SOUND_OPTIONS`, `playSound`, `AVATAR_TYPES`, `MAX_AVATAR_BYTES`.
- Produces:
  - `SettingsModal({ opened, onClose })` — `Tabs` «Profile», «Notifications», «Account»; на телефоні `fullScreen`;
  - `ProfileSettings`: поле «Name» (валідація як на сервері) і «Save», toast «Profile updated»;
  - `AvatarUpload`:
    - `FileButton accept={ AVATAR_TYPES.join(',') }`, кнопки «Upload photo» і «Remove photo»;
    - прев'ю через `URL.createObjectURL` (звільняється в cleanup);
    - перевірка типу й розміру на клієнті тими самими текстами;
    - відправка: `generateAvatarUploadUrl` → `fetch(url, { method: 'POST', headers: { 'Content-Type': file.type }, body: file })` → `{ storageId }` → `setAvatar`;
    - під час відправки — `loading`;
  - `SoundSettings`: `Radio.Group` з `SOUND_OPTIONS`. Вибір одразу викликає `setSound` і `playSound`; кнопка «Play» біля кожного варіанта;
  - `AccountSettings`:
    - «Log out» (той самий сценарій, що в `UserMenu`);
    - «Delete account» відкриває `ConfirmModal` «Delete account?» з текстом «Your profile, contacts and chats will be deleted. Your messages stay visible to other people as Deleted account. This cannot be undone.» і червоною кнопкою «Delete account»;
    - підтвердження: `deleteAccount` → `signOut()` (помилку ігнорувати: сесії вже немає) → `/login`.

- [x] **Step 1: Тести**

```ts
test('ProfileSettings saves a trimmed name', …)
test('AvatarUpload rejects a 6 MB file without uploading', …)       // 'Image must be 5 MB or smaller', fetch не викликано
test('AvatarUpload uploads and saves the storage id', …)            // fetch mock → { storageId: 's1' } → setAvatar({ storageId: 's1' })
test('choosing a sound saves and previews it', …)                  // setSound({ sound: 'pop' }), playSound('pop')
test('Delete account asks first, then deletes and signs out', …)
```

- [x] **Step 2: Реалізація, перевірка в браузері (аватар з `e2e/fixtures/avatar.png` видно в другого користувача без перезавантаження), коміт**

```bash
npm run lint:fix && npm run typecheck && npm run test:once
git add -A && git commit -m "feat: settings with profile, avatar upload, notification sound, logout and account deletion"
```

---

### Task 15: Емодзі

**Files:**
- Create:
  - `scripts/copy-emojibase.mjs`
  - `src/lib/emoji.ts` + `.test.ts`
  - `src/components/EmojiPicker/` (`EmojiPicker.tsx`, `EmojiPicker.module.css`, `EmojiPicker.test.tsx`)
- Modify: `package.json` (залежності, скрипти `predev`, `prebuild`), `.gitignore` (`public/emojibase/`), `src/components/Composer/*`, `src/components/MessageBubble/*`

**Interfaces:**
- Consumes: `Composer` (задача 11), `useIsDesktop`, `MAX_MESSAGE_LENGTH`.
- Produces:
  - `insertAtCursor(value: string, start: number, end: number, insert: string, maxLength: number): { value: string, caret: number }` у `src/lib/emoji.ts`:
    - замінює виділення `[start, end)` на `insert`, курсор ставить після вставки;
    - якщо результат довший за `maxLength`, повертає вхід без змін (`caret = end`);
  - `emojiOnlyCount(text: string): number` — кількість графем, якщо текст (без пробілів) складається лише з емодзі, інакше `0`. Графеми — через `Intl.Segmenter('en', { granularity: 'grapheme' })`, перевірка — `/^\p{Extended_Pictographic}/u` або регіональні прапорці `\p{Regional_Indicator}`;
  - `RECENT_EMOJI_KEY = 'chat-recent-emoji'`, `MAX_RECENT_EMOJI = 18`;
  - `pushRecent(list: string[], emoji: string): string[]` — емодзі на початок, без дублів, не довше `MAX_RECENT_EMOJI`;
  - `readRecent(): string[]` і `writeRecent(list: string[]): void` — `localStorage` у `try/catch` (у приватному режимі сховище може кидати);
  - `EmojiPicker({ onSelect: (emoji: string) => void })` — обгортка `EmojiPicker.Root` / `Search` / `Viewport` / `List` / `SkinToneSelector` з `frimousse`:
    - `emojibaseUrl="/emojibase"`, `locale="en"`, `columns={ 9 }` на десктопі й `8` на телефоні;
    - рядок «Recently used» над списком з `readRecent()`; вибір емодзі викликає `onSelect` і `writeRecent(pushRecent(…))`;
    - стилі — `EmojiPicker.module.css` на змінних Mantine; комірки 36px на десктопі, 44px на телефоні;
    - стан завантаження — `Loader` Mantine, порожній пошук — «No emoji found»;
  - `Composer`:
    - кнопка `IconMoodSmile` з `aria-label="Emoji"` і `aria-expanded`;
    - десктоп — `Popover position="top-start"` з `EmojiPicker`, закривається Escape і кліком поза ним; фокус лишається в полі;
    - телефон — панель 300px під композером замість клавіатури: при відкритті поле втрачає фокус (клавіатура ховається), кнопка міняється на `IconKeyboard` з `aria-label="Show keyboard"`, яка закриває панель і фокусує поле;
    - вибір емодзі — `insertAtCursor` з поточним `selectionStart` / `selectionEnd` поля, потім курсор у нову позицію;
  - `MessageBubble` — при `emojiOnlyCount(body)` від 1 до 3 текст 44px без фону бульбашки й тіні, час на плашці (`data-emoji-only`).

- [x] **Step 1: Залежності й дані**

```bash
npm i frimousse@^0.4.0
npm i -D emojibase-data@^16.0.2
```

`scripts/copy-emojibase.mjs` копіює `node_modules/emojibase-data/en/data.json` і `messages.json` у `public/emojibase/en/` (створює теку, перезаписує). У `package.json`: `"predev": "node scripts/copy-emojibase.mjs"`, `"prebuild": "node scripts/copy-emojibase.mjs"`. У `.gitignore`: `public/emojibase/`.

- [x] **Step 2: Тести чистих функцій**

```ts
test('insertAtCursor replaces the selection and moves the caret after the emoji', () => {
    expect(insertAtCursor('Hi there', 2, 2, ' 👋', 4096)).toEqual({ value: 'Hi 👋 there', caret: 5 });
    expect(insertAtCursor('Hi there', 3, 8, '🙂', 4096)).toEqual({ value: 'Hi 🙂', caret: 5 });
});
test('insertAtCursor refuses to go over the limit', () => {
    expect(insertAtCursor('abc', 3, 3, '😀', 4)).toEqual({ value: 'abc', caret: 3 });
});
test('emojiOnlyCount', () => {
    expect(emojiOnlyCount('🎉')).toBe(1);
    expect(emojiOnlyCount(' 🎉🙌 ')).toBe(2);
    expect(emojiOnlyCount('👍🏽')).toBe(1);        // з відтінком шкіри — одна графема
    expect(emojiOnlyCount('👨‍👩‍👧')).toBe(1);       // ZWJ-послідовність — одна графема
    expect(emojiOnlyCount('🇺🇦')).toBe(1);
    expect(emojiOnlyCount('ok 👍')).toBe(0);
    expect(emojiOnlyCount('123')).toBe(0);         // цифри не емодзі, хоч і мають варіант-емодзі
    expect(emojiOnlyCount('')).toBe(0);
});
test('pushRecent moves a repeat to the front and keeps 18', …)
test('readRecent survives a throwing localStorage', …)        // vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw … }) → []
```

- [x] **Step 3: Тести компонентів** (`frimousse` мокається: `Root` рендерить кнопку «😀», що викликає `onEmojiSelect({ emoji: '😀' })`)

```ts
test('picking an emoji inserts it at the caret and keeps the picker open', …)  // поле 'Hi there', курсор 2 → 'Hi😀 there'
test('a picked emoji goes to Recently used', …)
test('on a phone the emoji button swaps for Show keyboard and back', …)        // mockViewport(false)
test('Escape closes the picker without clearing the draft', …)
test('a message of two emoji renders large without a bubble', …)               // data-emoji-only
```

- [x] **Step 4: Реалізація й перевірка в браузері**

Run: `npm run lint:fix && npm run typecheck && npm run test:once` → PASS. У Playwright MCP перевірити:
- поповер на 1280px і панель на 390px;
- запит іде на `/emojibase/en/data.json` нашого сайту, а не на `cdn.jsdelivr.net` (`browser_network_requests`);
- надіслане «🎉🙌» у співрозмовника велике й без бульбашки.

- [x] **Step 5: Коміт**

```bash
git add -A && git commit -m "feat: emoji picker in the composer and large emoji-only messages"
```

---

### Task 16: E2E-тести на Playwright

**Files:**
- Create: `playwright.config.ts` (копія з `tic-tac-toe`), `e2e/helpers.ts`, `e2e/teardown.ts` (копія), `e2e/chat.spec.ts`, `e2e/account.spec.ts`, `e2e/fixtures/avatar.png` (PNG 64×64)
- Modify: `package.json` (`test:e2e`), `tsconfig.node.json` (`include` + `e2e`)

**Interfaces:**
- Consumes: усі екрани; `internal.testing.deleteE2eUsers`.
- Produces: у `e2e/helpers.ts` — `PASSWORD`, `testEmail(label)`, `isPhone()`, `newUserPage(browser)`, `signUp(page, name, email?)`, `addContact(page, email)`, `openChat(page, name)`, `messageMenu(page, text, item)` (ПКМ на десктопі, довге натискання на телефоні).

- [x] **Step 1: `npm i -D @playwright/test@^1.64.1 && npx playwright install chromium`**

- [x] **Step 2: `e2e/chat.spec.ts`**

```ts
test('two people add each other, talk, reply, edit, forward and delete', …)
    // Alice додає Bob за поштою → Message → 'Hi Bob'
    // у Bob: toast 'Alice', чат у списку з бейджем 1 і банером «Alice is not in your contacts»
    // Bob відкриває → у Alice дві галочки (aria-label 'Read')
    // Bob: Reply на 'Hi Bob' → 'Hello!' → у Alice цитата
    // Alice: Edit 'Hi Bob' → 'Hi Bob!' → у Bob 'edited'
    // Alice: Delete з 'Also delete for Bob' → у Bob повідомлення зникає
test('an emoji from the picker lands at the caret and arrives large', …)
    // 'See you' → курсор у кінець → Emoji → 🙌 → 'See you🙌'; надіслати '🎉' окремо → у Bob data-emoji-only
test('mute silences a chat and clear history empties it for me only', …)
test('status shows online and switches to last seen after logout', …)
```

- [x] **Step 3: `e2e/account.spec.ts`**

```ts
test('renaming and a new avatar reach the other person live', …)
test('deleting an account leaves the partner a read-only Deleted account chat', …)
test('a direct chat link survives sign-in', …)   // /chat/<id> → /login → вхід → той самий чат
```

- [x] **Step 4: Прогін і коміт**

Run: `npm run test:e2e` (з запущеним `npx convex dev`). Очікується: усі тести зелені в проєктах `desktop` і `phone`, після прогону `@e2e.test`-користувачів немає.

```bash
git add -A && git commit -m "test: end-to-end chat and account flows with Playwright"
```

---

### Task 17: Прибирання, документація, деплой

**Files:**
- Delete: `legacy/`
- Modify: `CLAUDE.md` (переписати за зразком `tic-tac-toe/CLAUDE.md`; зараз там стан робіт перед міграцією)
- Modify: `netlify.toml`, `README.md`, `eslint.config.mjs` (без `legacy/**`)

- [x] **Step 1: Прибрати старий код**

`git rm -r legacy`. Перевірити, що в коді немає `firebase`, `cloudinary`, `joi`, `@emotion`, `tailwind`: `grep -rniE "firebase|cloudinary|joi|emotion|tailwind" src convex package.json` нічого не знаходить.

- [x] **Step 2: `netlify.toml`**

Як у `tic-tac-toe`: `command = "npx convex deploy --cmd 'npm run build'"`, `publish = "dist"`, `NODE_VERSION = "22"`, SPA-редирект.

- [x] **Step 3: README і CLAUDE.md**

- README: стек, запуск (`npm install`, `npx convex dev`, Google OAuth, `npm run dev`), скрипти, деплой.
- CLAUDE.md:
  - стек і структура;
  - команди;
  - конвенції (Mantine 9 + CSS modules, змінні Mantine замість hex, ESLint-стиль, тест спершу);
  - деплой і секрети (👤);
  - поточна робота — посилання на `docs/superpowers/plans/2026-10-18-redesign.md`;
  - історія.

- [ ] **Step 4: 👤 Продакшн**

1. Netlify:
   - підключити сайт `075f926c-…` до `Bogdan-Kasyanchuk/chat`, production branch `main`;
   - додати `CONVEX_DEPLOY_KEY` (Production deploy key з дашборду Convex) лише для контексту Production;
   - deploy previews вимкнути;
   - видалити старі `VITE_API_KEY`, `VITE_AUTH_DOMAIN`, `VITE_PROJECT_ID`, `VITE_STORAGE_BUCKET`, `VITE_MESSAGING_SENDER_ID`, `VITE_APP_ID`, `VITE_UPLOAD_PRESET`, `VITE_CLOUD_NAME`.
2. `npx @convex-dev/auth --prod` з `SITE_URL=https://<site>.netlify.app`, потім `npx convex env set --prod AUTH_GOOGLE_ID …` і `AUTH_GOOGLE_SECRET …`.
3. У Google OAuth client додати origin `https://<site>.netlify.app` і redirect URI `https://<prod-deployment>.convex.site/api/auth/callback/google`.
4. Після деплою — локальний `.env` з ключами Firebase і Cloudinary більше не потрібен; Firebase і Cloudinary вимикає власник, коли вирішить.

- [x] **Step 5: Фінальна перевірка**

```bash
npm run lint && npm run typecheck && npm run test:once && npm run build && npm run test:e2e
```

Очікується: усе зелене. Перевірити на prod: вхід через Google 👤, реєстрацію поштою, повідомлення між двома акаунтами.

- [x] **Step 6: Коміт і PR**

```bash
git add -A && git commit -m "chore: remove legacy code, document the project and deploy via Convex on Netlify"
```

Власник пушить гілку `migrate/vite-convex` і відкриває PR у `main`.
