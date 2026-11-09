import { type Locator, expect, test } from '@playwright/test';

import { addContact, isPhone, newUserPage, signUp } from './helpers';

// Стани полів і чекбоксів з артборду Components живуть у global.css, тож jsdom їх не бачить — перевіряємо в браузері
const ACCENT = 'rgb(11, 122, 117)';
const MUTED = 'rgb(90, 107, 104)';

const style = (locator: Locator, property: string) => locator.evaluate((element, name) => getComputedStyle(element).getPropertyValue(name), property);

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
});

test('the password field gets the focus ring and keeps the accent border under the cursor', async ({ page }) => {
    test.skip(isPhone(), 'hover is a desktop state');
    await page.goto('/login');

    const field = page.locator('.mantine-PasswordInput-root .mantine-Input-input');

    await page.getByLabel('Password', { exact: true }).focus();
    await field.hover();

    await expect.poll(async () => style(field, 'box-shadow')).toContain('3px');
    await expect.poll(async () => style(field, 'border-top-color')).toBe(ACCENT);
});

test('an unchecked checkbox is a 2px muted ring', async ({ page, browser }) => {
    test.skip(isPhone(), 'same CSS on both projects');
    const other = await newUserPage(browser);
    const otherEmail = await signUp(other, 'Marko');

    await signUp(page, 'Olena');
    await addContact(page, otherEmail);
    await page.getByRole('button', { name: 'Chat settings' }).click();
    await page.getByRole('menuitem', { name: 'Clear history' }).click();

    const checkbox = page.getByRole('checkbox');

    await expect(checkbox).not.toBeChecked();
    expect(await style(checkbox, 'border-top-width')).toBe('2px');
    expect(await style(checkbox, 'border-top-color')).toBe(MUTED);
});
