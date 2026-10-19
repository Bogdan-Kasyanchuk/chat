import { expect, test } from '@playwright/test';

import { addContact, message, newUserPage, openChat, openSettings, sendMessage, signIn, signUp } from './helpers';

const AVATAR = 'e2e/fixtures/avatar.png';

test('renaming and a new avatar reach the other person live', async ({ page, browser }) => {
    const bob = await newUserPage(browser);

    await signUp(page, 'Alice');

    const bobEmail = await signUp(bob, 'Bob');

    await addContact(page, bobEmail);
    await sendMessage(page, 'Hi');
    await openChat(bob, 'Alice');

    const header = bob.getByRole('main');

    await expect(header.getByText('Alice', { exact: true })).toBeVisible();

    const settings = await openSettings(page);

    await settings.getByLabel('Name').fill('Alicia');
    await settings.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Profile updated' })).toBeVisible();

    const chooser = page.waitForEvent('filechooser');

    await settings.getByRole('button', { name: 'Upload photo' }).click();
    await (await chooser).setFiles(AVATAR);
    await expect(page.getByRole('alert').filter({ hasText: 'Photo updated' })).toBeVisible();

    // У Bob нове ім'я і фото — без перезавантаження
    await expect(header.getByText('Alicia', { exact: true })).toBeVisible();
    await expect(header.getByRole('img', { name: 'Alicia' })).toHaveAttribute('src', /^http/);
    await expect(message(bob, 'Hi')).toBeVisible();

    await bob.context().close();
});

test('deleting an account leaves the partner a read-only Deleted account chat', async ({ page, browser }) => {
    const bob = await newUserPage(browser);

    await signUp(page, 'Alice');

    const bobEmail = await signUp(bob, 'Bob');

    await addContact(page, bobEmail);
    await sendMessage(page, 'Bye');
    await openChat(bob, 'Alice');
    await expect(message(bob, 'Bye')).toBeVisible();

    const settings = await openSettings(page);

    await settings.getByRole('tab', { name: 'Account' }).click();
    await settings.getByRole('button', { name: 'Delete account' }).click();
    await page.getByRole('dialog', { name: 'Delete account?' }).getByRole('button', { name: 'Delete account' }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();

    // Чат лишається: ім'я «Deleted account», повідомлення видно, писати не можна
    const main = bob.getByRole('main');

    await expect(main.getByText('Deleted account', { exact: true })).toBeVisible();
    await expect(main.getByText('You can\'t message a deleted account')).toBeVisible();
    await expect(bob.getByLabel('Message', { exact: true })).toHaveCount(0);
    await expect(message(bob, 'Bye')).toBeVisible();

    await bob.context().close();
});

test('a direct chat link survives sign-in', async ({ page, browser }) => {
    const bob = await newUserPage(browser);

    const aliceEmail = await signUp(page, 'Alice');
    const bobEmail = await signUp(bob, 'Bob');

    await addContact(page, bobEmail);
    await sendMessage(page, 'Link test');

    const chatUrl = page.url();

    // Та сама Alice у новому браузері без сесії
    const fresh = await newUserPage(browser);

    await fresh.goto(chatUrl);
    await expect(fresh).toHaveURL(/\/login$/);
    await signIn(fresh, aliceEmail);

    await expect(fresh).toHaveURL(chatUrl);
    await expect(message(fresh, 'Link test')).toBeVisible();
    await expect(fresh.getByRole('main').getByText('Bob', { exact: true })).toBeVisible();

    await fresh.context().close();
    await bob.context().close();
});
