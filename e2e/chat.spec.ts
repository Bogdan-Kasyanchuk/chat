import { type Locator, expect, test } from '@playwright/test';

import { addContact, chatItem, isPhone, leaveChat, message, messageMenu, newUserPage, openChat, openContact, openMessageMenu, sendMessage, signUp } from './helpers';

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
    await page.getByLabel('Search emoji').fill('raising hands');
    await page.getByRole('gridcell', { name: 'raising hands' }).first().click();
    await expect(field).toHaveValue('See you🙌');

    await page.getByRole('button', { name: 'Send' }).click();
    await expect(message(page, 'See you🙌')).toBeVisible();
    await sendMessage(page, '🎉');

    await openChat(bob, 'Alice');
    await expect(message(bob, '🎉')).toHaveAttribute('data-emoji-only');
    await expect(message(bob, 'See you🙌')).not.toHaveAttribute('data-emoji-only');

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
    await page.getByRole('dialog', { name: 'Delete chat?' }).getByRole('button', { name: 'Delete' }).click();
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

    await bob.getByRole('button', { name: 'Account menu' }).click();
    await bob.getByRole('menuitem', { name: 'Logout' }).click();
    await bob.getByRole('dialog', { name: 'Log out?' }).getByRole('button', { name: 'Log out' }).click();
    await expect(bob).toHaveURL(/\/login$/);
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
