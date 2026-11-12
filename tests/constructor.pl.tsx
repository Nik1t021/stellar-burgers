import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

const apiHar = fileURLToPath(new URL('./hars/burger-api.har', import.meta.url));
const bunName = 'Булка для конструктора';
const fillingName = 'Начинка для конструктора';
const userName = 'Студент';
const accessToken = 'Bearer test-access';
const orderNumber = 54321;
 
test.beforeEach(async ({ page }) => {
  await page.routeFromHAR(apiHar, { url: '**/api/**', notFound: 'abort' });
});

const ingredientCard = (page: Page, name: string) =>
  page.getByRole('listitem').filter({ has: page.getByRole('link', { name }) });

const addBurgerIngredients = async (page: Page) => {
  for (const name of [bunName, fillingName]) {
    await ingredientCard(page, name).getByRole('button', { name: 'Добавить' }).click();
  }
};

const submitOrder = async (page: Page) => {
  const [request] = await Promise.all([
    page.waitForRequest(
      (request) =>
        request.method() === 'POST' && new URL(request.url()).pathname === '/api/orders'
    ),
    page.getByRole('button', { name: 'Оформить заказ' }).click(),
  ]);
  expect(request.postDataJSON()).toEqual({ ingredients: ['bun', 'main', 'bun'] });
  expect(request.headers().authorization).toBe(accessToken);
};
 
test.describe('Авторизация и история заказов', () => {
  test('регистрация, повторный вход, создание заказа и история профиля', async ({
    page,
  }) => {
    const email = 'student@example.com';
    const password = 'test-password';
 
    await page.goto('/register');
    await page.locator('input[name="name"]').fill(userName);
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
    await expect(page).toHaveURL('/');
    await page.getByRole('link', { name: userName }).click();
    await page.getByRole('button', { name: 'Выход' }).click();
    await expect(page).toHaveURL('/login');
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.getByRole('button', { name: 'Войти', exact: true }).click();
    await expect(page).toHaveURL('/profile');
    await page.getByRole('link', { name: 'Конструктор' }).click();
    await addBurgerIngredients(page);
    await submitOrder(page);
    await expect(
      page
        .locator('#modals')
        .getByRole('heading', { name: String(orderNumber), exact: true })
    ).toBeVisible();
    await page.getByRole('button', { name: 'Закрыть' }).click();
    await page.getByRole('link', { name: userName }).click();
    await page.getByRole('link', { name: 'История заказов' }).click();
    const orderLink = page.getByRole('link', { name: /Тестовый бургер/ });
    await expect(orderLink).toBeVisible();
    await expect(orderLink).toContainText('250');
    await orderLink.click();
    await expect(page).toHaveURL('/profile/orders/54321');
    await expect(page.locator('#modals')).toContainText('Тестовый бургер');
    await page.getByRole('button', { name: 'Закрыть' }).click();
    await expect(page).toHaveURL('/profile/orders');
    await page.getByRole('button', { name: 'Выход' }).click();
    await page.goto('/profile/orders/54321');
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Конструктор бургера', () => {
   test('добавляет булку и начинку в конструктор', async ({ page }) => {
    await page.goto('/');
    const constructor = page.locator('section').filter({
      has: page.getByRole('button', { name: 'Оформить заказ' }),
    });
    await expect(constructor.getByText('Выберите булки', { exact: true })).toHaveCount(
      2
    );
    await expect(constructor.getByText('Выберите начинку')).toBeVisible();
 
    await addBurgerIngredients(page);
 
    await expect(
      constructor.getByText(`${bunName} (верх)`, { exact: true })
    ).toBeVisible();
    await expect(
      constructor.getByText(`${bunName} (низ)`, { exact: true })
    ).toBeVisible();
    await expect(constructor.getByText(fillingName, { exact: true })).toBeVisible();
  });
 
  for (const method of ['крестиком', 'кликом по оверлею'] as const) {
    test(`открывает детали ингредиента и закрывает их ${method}`, async ({ page }) => {
      await page.goto('/');
      await page.getByRole('link', { name: new RegExp(bunName) }).click();
 
      const modal = page.locator('#modals');
      const title = modal.getByRole('heading', { name: 'Детали ингредиента' });
      await expect(page).toHaveURL('/ingredients/bun');
      await expect(title).toBeVisible();
      await expect(modal.getByText(bunName, { exact: true })).toBeVisible();
 
      if (method === 'крестиком') {
        await modal.getByRole('button', { name: 'Закрыть' }).click();
      } else {
        await modal.locator('[class*="modal-overlay__overlay"]').click({
          position: { x: 8, y: 8 },
        });
      }
 
      await expect(title).toHaveCount(0);
      await expect(page).toHaveURL('/');
    });
  }
 
  test('оформляет заказ, очищает конструктор и закрывает окно', async ({
    page,
    context,
    baseURL,
  }) => {
    await context.addCookies([
      { name: 'accessToken', value: encodeURIComponent(accessToken), url: baseURL! },
    ]);
    await page.addInitScript(() => localStorage.setItem('refreshToken', 'test-refresh'));
    await page.goto('/');
    await expect(page.getByRole('link', { name: userName })).toBeVisible();
    await addBurgerIngredients(page);
 
    const orderButton = page.getByRole('button', { name: 'Оформить заказ' });
    const constructor = page.locator('section').filter({ has: orderButton });
    await submitOrder(page);
    const modal = page.locator('#modals');
    const orderHeading = modal.getByRole('heading', {
      name: String(orderNumber),
      exact: true,
    });
    await expect(orderHeading).toBeVisible();
    await expect(constructor.getByText('Выберите булки', { exact: true })).toHaveCount(
      2
    );
    await expect(
      constructor.getByText('Выберите начинку', { exact: true })
    ).toBeVisible();
    await expect(constructor.getByText(fillingName, { exact: true })).toHaveCount(0);
 
    await modal.getByRole('button', { name: 'Закрыть' }).click();
    await expect(modal).toBeEmpty();
  });
});