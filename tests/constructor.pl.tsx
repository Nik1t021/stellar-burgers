import { expect, test } from '@playwright/test';

import type { TIngredient, TOrder, TUser } from '../src/utils/types';

test('регистрация, повторный вход, создание заказа и история профиля', async ({
  page,
}) => {
  const email = 'student@example.com';
  const password = 'test-password';
  const ingredients: TIngredient[] = ['bun', 'main'].map((type) => ({
    _id: type,
    name: type === 'bun' ? 'Тестовая булка' : 'Тестовая начинка',
    type,
    price: type === 'bun' ? 100 : 50,
    proteins: 10,
    fat: 10,
    carbohydrates: 10,
    calories: 100,
    image: '',
    image_large: '',
    image_mobile: '',
  }));
  let user: TUser | null = null;
  let isAuthenticated = false;
  let orders: TOrder[] = [];

  await page.route('https://norma.ffapi.ru/api/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/api', '');
    const method = request.method();
    const values = request.postDataJSON() as {
      name?: string;
      email?: string;
      password?: string;
      ingredients?: string[];
    } | null;
    let response: unknown;
    let status = 200;
    if (path === '/ingredients') response = { success: true, data: ingredients };
    else if (path === '/auth/register') {
      user = { name: values?.name ?? '', email: values?.email ?? '' };
      isAuthenticated = true;
      response = {
        success: true,
        user,
        accessToken: 'Bearer test-access',
        refreshToken: 'test-refresh',
      };
    } else if (path === '/auth/login') {
      expect(values).toEqual({ email, password });
      isAuthenticated = true;
      response = {
        success: true,
        user,
        accessToken: 'Bearer test-access',
        refreshToken: 'test-refresh',
      };
    } else if (path === '/auth/logout') {
      isAuthenticated = false;
      response = { success: true };
    } else if (path === '/auth/user') response = { success: true, user };
    else if (path === '/orders/all')
      response = {
        success: true,
        orders,
        total: orders.length,
        totalToday: orders.length,
      };
    else if (path === '/orders') {
      expect(isAuthenticated).toBe(true);
      expect(request.headers().authorization).toBe('Bearer test-access');
      if (method === 'POST') {
        expect(values?.ingredients).toEqual(['bun', 'main', 'bun']);
        const order: TOrder = {
          _id: 'test-order',
          number: 123,
          status: 'done',
          name: 'Тестовый бургер',
          ingredients: values?.ingredients ?? [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        orders = [order];
        response = { success: true, order, name: order.name };
      } else
        response = {
          success: true,
          orders,
          total: orders.length,
          totalToday: orders.length,
        };
    } else if (path === '/orders/123') response = { success: true, orders };
    else {
      status = 404;
      response = { success: false, message: 'Unknown test endpoint' };
    }
    await route.fulfill({ status, json: response });
  });
  
  await page.goto('/register');
  await page.locator('input[name="name"]').fill('Студент');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
  await expect(page).toHaveURL('/');
  await page.getByRole('link', { name: 'Студент' }).click();
  await page.getByRole('button', { name: 'Выход' }).click();
  await expect(page).toHaveURL('/login');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect(page).toHaveURL('/profile');
  await page.getByRole('link', { name: 'Конструктор' }).click();
  for (const ingredient of ingredients) {
    await page
      .locator('li')
      .filter({ has: page.locator(`a[href="/ingredients/${ingredient._id}"]`) })
      .getByRole('button', { name: 'Добавить' })
      .click();
  }
  await page.getByRole('button', { name: 'Оформить заказ' }).click();
  await expect(page.locator('#modals')).toContainText('123');
  await page.getByRole('button', { name: 'Закрыть' }).click();
  await page.getByRole('link', { name: 'Студент' }).click();
  await page.getByRole('link', { name: 'История заказов' }).click();
  const orderLink = page.getByRole('link', { name: /Тестовый бургер/ });
  await expect(orderLink).toBeVisible();
  await expect(orderLink).toContainText('250');
  await orderLink.click();
  await expect(page).toHaveURL('/profile/orders/123');
  await expect(page.locator('#modals')).toContainText('Тестовый бургер');
  await page.getByRole('button', { name: 'Закрыть' }).click();
  await expect(page).toHaveURL('/profile/orders');
  await page.getByRole('button', { name: 'Выход' }).click();
  await page.goto('/profile/orders/123');
  await expect(page).toHaveURL('/login');
});
