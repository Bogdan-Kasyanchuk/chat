import { type Locator, expect, test } from '@playwright/test';

import { addContact, chatItem, isPhone, leaveChat, logOut, longPress, message, messageMenu, newUserPage, openChat, openContact, openMessageMenu, sendMessage, signUp, testEmail } from './helpers';

test('two people add each other, talk, reply, edit, forward and delete', async ({ page, browser }) => {
    const bob = await newUserPage(browser);

    await signUp(page, 'Alice');

    const bobEmail = await signUp(bob, 'Bob');

    await addContact(page, bobEmail);
    await sendMessage(page, 'Hi Bob');

    // Bob на головній: toast від Alice і чат у списку з одним непрочитаним
    await expect(bob.getByRole('alert').filter({ hasText: 'Alice' })).toContainText('Hi Bob');
    await expect(chatItem(bob, 'Alice').getByText('1', { exact: true })).toBeVisible();

    await openChat(bob, 'Alice');
    await expect(bob.getByText('Alice is not in your contacts')).toBeVisible();
    await expect(message(page, 'Hi Bob').getByLabel('Read')).toBeVisible();

    // Відповідь: у Alice цитата з оригіналом
    await messageMenu(bob, 'Hi Bob', 'Reply');
    await expect(bob.getByText('Reply to Alice')).toBeVisible();
    await sendMessage(bob, 'Hello!');
    await expect(message(page, 'Hello!')).toContainText('Hi Bob');

    // Редагування: у Bob новий текст з позначкою «edited»
    await messageMenu(page, 'Hi Bob', 'Edit');
    await expect(page.getByLabel('Message', { exact: true })).toHaveValue('Hi Bob');
    await sendMessage(page, 'Hi Bob!');
    await expect(message(bob, 'Hi Bob!')).toContainText('edited');

    // Пересилання: відповідь Bob повертається йому як «Forwarded from Bob»
    await messageMenu(page, 'Hello!', 'Forward');
    await page.getByRole('dialog', { name: 'Forward to' }).getByRole('button', { name: /Bob/ }).click();
    await expect(bob.getByRole('article').filter({ hasText: 'Forwarded from Bob' })).toContainText('Hello!');

    // Видалення для обох: у Bob повідомлення зникає
    await messageMenu(page, 'Hi Bob!', 'Delete');

    const confirm = page.getByRole('dialog', { name: 'Delete message?' });

    await confirm.getByLabel('Also delete for Bob').check();
    await confirm.getByRole('button', { name: 'Delete' }).click();
    // Артборд ToastDeleted: без Undo
    await expect(page.getByRole('alert').filter({ hasText: 'Message deleted' })).toBeVisible();
    await expect(page.getByRole('alert').filter({ hasText: 'Message deleted' }).getByRole('button')).toHaveCount(0);
    await expect(message(page, 'Hi Bob!')).toHaveCount(0);
    await expect(message(bob, 'Hi Bob!')).toHaveCount(0);

    await bob.context().close();
});

test('an emoji from the picker lands at the caret and arrives large', async ({ page, browser }) => {
    const bob = await newUserPage(browser);

    await signUp(page, 'Alice');

    const bobEmail = await signUp(bob, 'Bob');

    await addContact(page, bobEmail);

    const field = page.getByLabel('Message', { exact: true });

    await field.fill('See you');
    await field.press('End');
    await page.getByRole('button', { name: 'Emoji' }).click();

    // На телефоні панель без пошуку (MobileEmoji): емодзі — з першої категорії
    const [ name, emoji ] = isPhone() ? [ 'grinning face', '😀' ] : [ 'raising hands', '🙌' ];

    if (!isPhone()) {
        await page.getByLabel('Search emoji').fill(name);
    }

    await page.getByRole('gridcell', { name }).first().click();
    await expect(field).toHaveValue(`See you${ emoji }`);

    await page.getByRole('button', { name: 'Send' }).click();
    await expect(message(page, `See you${ emoji }`)).toBeVisible();
    await sendMessage(page, '🎉');

    await openChat(bob, 'Alice');
    await expect(message(bob, '🎉')).toHaveAttribute('data-emoji-only');
    await expect(message(bob, `See you${ emoji }`)).not.toHaveAttribute('data-emoji-only');

    await bob.context().close();
});

test('mute silences a chat and clear history empties it for me only', async ({ page, browser }) => {
    const bob = await newUserPage(browser);

    await signUp(page, 'Alice');

    const bobEmail = await signUp(bob, 'Bob');

    await addContact(page, bobEmail);
    await sendMessage(page, 'First');

    // Без mute повідомлення приходить з toast; клік по ньому відкриває чат
    const toast = bob.getByRole('alert').filter({ hasText: 'Alice' });

    await expect(toast).toContainText('First');
    await toast.click();
    await expect(bob).toHaveURL(page.url());
    await expect(toast).toHaveCount(0);

    await bob.getByRole('button', { name: 'Chat settings' }).click();
    await bob.getByRole('menuitem', { name: 'Mute notifications' }).click();
    await leaveChat(bob);
    await expect(chatItem(bob, 'Alice').getByLabel('Muted')).toBeVisible();

    // Після mute список оновлюється, а toast немає
    await sendMessage(page, 'Second');
    await expect(chatItem(bob, 'Alice')).toContainText('Second');
    await expect(bob.getByRole('alert')).toHaveCount(0);

    // Alice очищає історію лише в себе
    await page.getByRole('button', { name: 'Chat settings' }).click();
    await page.getByRole('menuitem', { name: 'Clear history' }).click();
    await page.getByRole('dialog', { name: 'Clear history?' }).getByRole('button', { name: 'Clear' }).click();
    await expect(page.getByText('No messages here yet')).toBeVisible();
    await expect(page.getByRole('article')).toHaveCount(0);
    // Toast живе 4 с: якби «Second» його показав, він був би ще тут
    await expect(bob.getByRole('alert')).toHaveCount(0);

    await openChat(bob, 'Alice');
    await expect(message(bob, 'First')).toBeVisible();
    await expect(message(bob, 'Second')).toBeVisible();

    await bob.context().close();
});

test('a chat deleted for me opens again from contacts, empty', async ({ page, browser }) => {
    const bob = await newUserPage(browser);

    await signUp(page, 'Alice');

    const bobEmail = await signUp(bob, 'Bob');

    await addContact(page, bobEmail);
    await sendMessage(page, 'Before');

    const chatUrl = page.url();

    await page.getByRole('button', { name: 'Chat settings' }).click();
    await page.getByRole('menuitem', { name: 'Delete chat' }).click();
    await page.getByRole('dialog', { name: 'Delete chat?' }).getByRole('button', { name: 'Delete chat' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(chatItem(page, 'Bob')).toHaveCount(0);

    // Той самий чат повертається з контактів, без старих повідомлень і без «Chat not found»
    await openContact(page, 'Bob');
    await expect(page).toHaveURL(chatUrl);
    await expect(page.getByText('No messages here yet')).toBeVisible();
    await expect(page.getByText('Chat not found')).toHaveCount(0);

    await sendMessage(page, 'After');
    await openChat(bob, 'Alice');
    await expect(message(bob, 'Before')).toBeVisible();
    await expect(message(bob, 'After')).toBeVisible();

    await bob.context().close();
});

test('status shows online and switches to last seen after logout', async ({ page, browser }) => {
    const bob = await newUserPage(browser);

    await signUp(page, 'Alice');

    const bobEmail = await signUp(bob, 'Bob');

    await addContact(page, bobEmail);

    const status = page.getByRole('main').getByText(/^(online|last seen .+)$/);

    await expect(status).toHaveText('online');

    await logOut(bob);
    await expect(bob.getByRole('heading', { name: 'Sign in' })).toBeVisible();

    await expect(status).toHaveText('last seen just now');

    await bob.context().close();
});

test('the text of message menu items cannot be selected', async ({ page, browser }) => {
    const bob = await newUserPage(browser);

    await signUp(page, 'Alice');

    const bobEmail = await signUp(bob, 'Bob');

    await addContact(page, bobEmail);
    await sendMessage(page, 'Hold me');

    // Меню відкривається під пальцем, і Android виділяв слово пункту під ним
    const menu = await openMessageMenu(page, 'Hold me');
    const userSelect = await menu.evaluate(element => Array.from(element.querySelectorAll('*'), child => getComputedStyle(child).userSelect));

    expect(new Set(userSelect)).toEqual(new Set([ 'none' ]));

    await bob.context().close();
});

test('on a touch screen the menu item under the finger is not highlighted', async ({ page, browser }) => {
    test.skip(!isPhone(), 'Hover highlight is a touch-screen issue');

    const bob = await newUserPage(browser);

    await signUp(page, 'Alice');

    const bobEmail = await signUp(bob, 'Bob');

    await addContact(page, bobEmail);
    await sendMessage(page, 'Hold me');

    const items = (await openMessageMenu(page, 'Hold me')).getByRole('button');
    // Фон пункту змінюється з transition — читаємо його, коли перехід уже скінчився
    const background = (item: Locator) => item.evaluate(async element => {
        await Promise.all(element.getAnimations().map(animation => animation.finished));

        return getComputedStyle(element).backgroundColor;
    });

    // Меню відкривається під пальцем, і мобільний браузер ставить :hover пунктові під ним
    await items.first().hover();
    expect(await background(items.first())).toBe(await background(items.nth(1)));

    await bob.context().close();
});

// Артборди ChatsEmpty і AddContactNotFound: новий акаунт без чатів, пошта, якої ніхто не реєстрував
test('a new account sees No chats yet and Add contact explains an unknown email', async ({ page }) => {
    await signUp(page, 'Alice');

    await expect(page.getByRole('heading', { name: 'No chats yet' })).toBeVisible();
    await page.getByRole('button', { name: 'Add contact' }).click();

    const dialog = page.getByRole('dialog', { name: 'Add contact' });

    await dialog.getByLabel('Email').fill(testEmail('nobody'));
    await dialog.getByRole('button', { name: 'Find' }).click();
    await expect(dialog.getByRole('alert')).toHaveText('No one has signed up with this email. Check the spelling.');
    await expect(dialog.getByRole('button', { name: 'Add to contacts' })).toBeDisabled();
    await dialog.getByRole('button', { name: isPhone() ? 'Back to chats' : 'Cancel' }).click();
    await expect(dialog).toHaveCount(0);
});

// Review Focus 3: слово без пробілів не розпирає бульбашку й не дає горизонтальної прокрутки
test('a 300-character word wraps inside the bubble without horizontal scroll', async ({ page, browser }) => {
    const bob = await newUserPage(browser);

    await signUp(page, 'Alice');

    const bobEmail = await signUp(bob, 'Bob');

    await bob.context().close();
    await addContact(page, bobEmail);

    const word = 'w'.repeat(300);

    await sendMessage(page, word);

    const bubble = await message(page, word).boundingBox();
    const main = await page.getByRole('main').boundingBox();

    expect(bubble && main).toBeTruthy();
    expect(bubble!.x).toBeGreaterThanOrEqual(main!.x);
    expect(bubble!.x + bubble!.width).toBeLessThanOrEqual(main!.x + main!.width);
    // Ні сторінка, ні стрічка не прокручуються вбік
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    expect(await message(page, word).evaluate(element => {
        const feed = element.closest('[data-feed]') as HTMLElement;

        return feed.scrollWidth <= feed.clientWidth;
    })).toBe(true);
});

// Плашка дати липне до верху стрічки, поки видно її день
test('the date chip sticks to the top of the feed while scrolling its day', async ({ page, browser }) => {
    const bob = await newUserPage(browser);

    await signUp(page, 'Alice');

    const bobEmail = await signUp(bob, 'Bob');

    await bob.context().close();
    await addContact(page, bobEmail);

    // Три високі повідомлення — стрічка довша за екран
    for (const n of [ 1, 2, 3 ]) {
        await page.getByLabel('Message', { exact: true }).fill(Array.from({ length: 14 }, (_, i) => `${ n }.${ i }`).join('\n'));
        await page.getByRole('button', { name: 'Send' }).click();
    }

    await expect(page.getByRole('article')).toHaveCount(3);

    const feed = page.locator('[data-feed]');

    await feed.evaluate(element => {
        element.scrollTop = element.scrollHeight / 2;
    });

    const chip = page.getByText('Today', { exact: true });
    const [ chipBox, feedBox ] = [ await chip.boundingBox(), await feed.boundingBox() ];

    expect(chipBox && feedBox).toBeTruthy();
    expect(Math.abs(chipBox!.y - (feedBox!.y + 8))).toBeLessThanOrEqual(2);

    // Стрічка справді прокручена: верх дня вже за краєм
    expect(await feed.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
});

// Рев'ю етапу 5: чат відкривається на «Unread messages», і липка плашка дати його не накриває
test('the sticky date chip leaves the unread divider visible when a chat opens', async ({ page, browser }) => {
    const bob = await newUserPage(browser);

    await signUp(page, 'Alice');

    const bobEmail = await signUp(bob, 'Bob');

    await addContact(page, bobEmail);

    const sendTall = async (n: number) => {
        await page.getByLabel('Message', { exact: true }).fill(Array.from({ length: 14 }, (_, i) => `${ n }.${ i }`).join('\n'));
        await page.getByRole('button', { name: 'Send' }).click();
        await expect(page.getByRole('article')).toHaveCount(n);
    };

    for (const n of [ 1, 2, 3 ]) {
        await sendTall(n);
    }

    // Bob читає все, виходить, і приходить ще стрічка — розділювач опиняється вгорі екрана
    await openChat(bob, 'Alice');
    await expect(bob.getByRole('article')).toHaveCount(3);
    await leaveChat(bob);

    for (const n of [ 4, 5, 6 ]) {
        await sendTall(n);
    }

    await openChat(bob, 'Alice');

    const divider = bob.getByText('Unread messages', { exact: true });

    await expect(divider).toBeInViewport();

    const [ dividerBox, chipBox ] = [ await divider.boundingBox(), await bob.getByText('Today', { exact: true }).boundingBox() ];

    expect(dividerBox && chipBox).toBeTruthy();
    expect(chipBox!.y + chipBox!.height).toBeLessThanOrEqual(dividerBox!.y);

    await bob.context().close();
});

// Рев'ю етапу 5: вкладки категорій спираються на DOM frimousse — перевіряємо зі справжньою бібліотекою
test('an emoji category tab scrolls the picker to its category', async ({ page, browser }) => {
    const bob = await newUserPage(browser);

    await signUp(page, 'Alice');

    const bobEmail = await signUp(bob, 'Bob');

    await bob.context().close();
    await addContact(page, bobEmail);
    await page.getByRole('button', { name: 'Emoji' }).click();

    const flags = page.getByRole('button', { name: 'Flags' });

    await expect(page.getByRole('gridcell').first()).toBeVisible();
    await flags.click();
    await expect(flags).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('gridcell', { name: /flag/i }).first()).toBeInViewport();
});

// Review Focus 2: прокрутка стрічки пальцем не відкриває панель дій, довге натискання — відкриває
test('on a phone scrolling the feed does not open the message actions, a long press does', async ({ page, browser }) => {
    test.skip(!isPhone(), 'Long press is a phone gesture');

    const bob = await newUserPage(browser);

    await signUp(page, 'Alice');

    const bobEmail = await signUp(bob, 'Bob');

    await addContact(page, bobEmail);

    for (let i = 1; i <= 12; i += 1) {
        await sendMessage(page, `Line ${ i }`);
    }

    const sheet = page.getByRole('dialog', { name: 'Message actions' });
    const box = await message(page, 'Line 10').boundingBox();

    if (!box) {
        throw new Error('Message is not visible');
    }

    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    const cdp = await page.context().newCDPSession(page);

    // Палець веде стрічку вниз (до старіших) і тримається довше за поріг довгого натискання
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [ { x, y } ] });

    for (let step = 1; step <= 10; step += 1) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [ { x, y: y + step * 20 } ] });
        await page.waitForTimeout(30);
    }

    await page.waitForTimeout(600);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await cdp.detach();
    await expect(sheet).toHaveCount(0);

    await longPress(page, message(page, 'Line 12'), sheet);
    await expect(sheet.getByText('Line 12')).toBeVisible();
    await sheet.getByRole('button', { name: 'Select' }).click();
    await expect(page.getByText('1 selected')).toBeVisible();
    await expect(page.getByRole('toolbar', { name: 'Selected messages' })).toBeVisible();

    await bob.context().close();
});

// Артборд ToastCopied: «Text copied» на 90 над нижнім краєм, посередині над розмовою
test('Copy text shows Text copied centred over the conversation', async ({ page, browser }) => {
    await page.context().grantPermissions([ 'clipboard-read', 'clipboard-write' ]);

    const bob = await newUserPage(browser);

    await signUp(page, 'Alice');

    const bobEmail = await signUp(bob, 'Bob');

    await addContact(page, bobEmail);
    await sendMessage(page, 'Copy me');
    await messageMenu(page, 'Copy me', 'Copy text');

    const toast = page.getByRole('alert').filter({ hasText: 'Text copied' });

    await expect(toast).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('Copy me');

    const viewport = page.viewportSize()!;
    // Розмова на десктопі — праворуч від бічної панелі 380
    const centre = isPhone() ? viewport.width / 2 : 380 + (viewport.width - 380) / 2;
    // Toast в'їжджає знизу: міряємо, коли анімація скінчилась
    const offsets = async () => {
        const box = (await toast.boundingBox())!;

        return [ Math.round(box.x + box.width / 2 - centre), Math.round(viewport.height - (box.y + box.height) - 90) ];
    };

    await expect.poll(async () => (await offsets()).every(offset => Math.abs(offset) <= 4), { timeout: 2000 }).toBe(true);

    await bob.context().close();
});
