import { type Browser, type Locator, type Page, expect, test } from '@playwright/test';

export const PASSWORD = 'chat-e2e-2026';

const suffix = () => `${ Date.now() }-${ Math.random().toString(36).slice(2, 7) }`;

export const testEmail = (label: string) => `e2e-${ label }-${ suffix() }@e2e.test`;

export const isPhone = () => test.info().project.name === 'phone';

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Окремий контекст — окреме сховище, тобто друга людина з власною сесією
export const newUserPage = async (browser: Browser) => {
    const { baseURL, viewport, userAgent, isMobile, hasTouch, deviceScaleFactor } = test.info().project.use;
    const context = await browser.newContext({ baseURL, viewport, userAgent, isMobile, hasTouch, deviceScaleFactor });

    return context.newPage();
};

export const signUp = async (page: Page, name: string, email = testEmail(name.toLowerCase())) => {
    await page.goto('/signup');
    await page.getByLabel('Name').fill(name);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
    await page.getByLabel('Confirm password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('button', { name: 'Account menu' })).toBeVisible();

    return email;
};

export const signIn = async (page: Page, email: string) => {
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();
};

// На телефоні бокова панель і розмова не видні разом: з розмови повертаємось до списку
const showSidebar = async (page: Page) => {
    if (isPhone() && new URL(page.url()).pathname.startsWith('/chat/')) {
        await page.getByRole('link', { name: 'Back to chats' }).click();
    }
};

const sidebarTab = async (page: Page, tab: 'Chats' | 'Contacts') => {
    await showSidebar(page);
    await page.getByText(tab, { exact: true }).click();
};

// Додає людину в контакти за точною поштою і відкриває з нею чат (кнопка «Message»)
export const addContact = async (page: Page, email: string) => {
    await sidebarTab(page, 'Contacts');
    await page.getByRole('button', { name: 'Add contact' }).click();

    const dialog = page.getByRole('dialog', { name: 'Add contact' });

    await dialog.getByLabel('Email').fill(email);
    await dialog.getByRole('button', { name: 'Find' }).click();
    await dialog.getByRole('button', { name: 'Add to contacts' }).click();
    await expect(dialog.getByRole('button', { name: 'In contacts' })).toBeVisible();
    await dialog.getByRole('button', { name: 'Message' }).click();
    await expect(page).toHaveURL(/\/chat\//);
};

// Пункт у списку чатів: ім'я співрозмовника, превʼю, час, позначки
export const chatItem = (page: Page, name: string) => page.getByRole('link', { name: new RegExp(escapeRegExp(name)) });

export const openChat = async (page: Page, name: string) => {
    await sidebarTab(page, 'Chats');
    await chatItem(page, name).click();
    await expect(page).toHaveURL(/\/chat\//);
};

// Клік по людині на вкладці контактів відкриває чат з нею
export const openContact = async (page: Page, name: string) => {
    await sidebarTab(page, 'Contacts');
    await page.getByRole('button', { name: new RegExp(escapeRegExp(name)) }).click();
    await expect(page).toHaveURL(/\/chat\//);
};

// Назад до списку: на телефоні — стрілка, на десктопі — Escape (закриває розмову)
export const leaveChat = async (page: Page) => {
    if (isPhone()) {
        await page.getByRole('link', { name: 'Back to chats' }).click();
    } else {
        // Поки закривається меню чи діалог, Escape належить їм, а не розмові
        await expect(page.getByRole('menu')).toHaveCount(0);
        await expect(page.getByRole('dialog')).toHaveCount(0);
        await page.keyboard.press('Escape');
    }

    await expect(page).toHaveURL(/\/$/);
};

// Бульбашка, чий власний текст (не цитата) дорівнює text
export const message = (page: Page, text: string) => page.getByRole('article').filter({
    has: page.locator('p', { hasText: new RegExp(`^${ escapeRegExp(text) }$`) })
});

export const sendMessage = async (page: Page, text: string) => {
    await page.getByLabel('Message', { exact: true }).fill(text);
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(message(page, text).last()).toBeVisible();
};

// Чесне довге натискання: палець тримається, доки не з'явиться меню, і лише тоді піднімається
const longPress = async (page: Page, target: Locator, menu: Locator) => {
    await target.scrollIntoViewIfNeeded();

    const box = await target.boundingBox();

    if (!box) {
        throw new Error('Message is not visible');
    }

    const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    const cdp = await page.context().newCDPSession(page);

    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [ point ] });
    await expect(menu).toBeVisible();
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await cdp.detach();
};

// Відкриває меню повідомлення: правий клік на десктопі, довге натискання на телефоні
export const openMessageMenu = async (page: Page, text: string) => {
    const target = message(page, text);
    const menu = page.locator('.mantine-contextmenu');

    if (isPhone()) {
        await longPress(page, target, menu);
    } else {
        await target.click({ button: 'right' });
    }

    return menu;
};

export const messageMenu = async (page: Page, text: string, item: string) => {
    const menu = await openMessageMenu(page, text);

    await menu.getByRole('button', { name: item, exact: true }).click();
};

// Відкриває налаштування через меню акаунта; на телефоні — зі списку чатів
export const openSettings = async (page: Page) => {
    await showSidebar(page);
    await page.getByRole('button', { name: 'Account menu' }).click();
    await page.getByRole('menuitem', { name: 'Settings' }).click();

    return page.getByRole('dialog', { name: 'Settings' });
};
