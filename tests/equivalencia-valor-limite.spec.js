const { test, expect } = require('@playwright/test');
const { login } = require('./helpers/utils');
const { validData, invalidData } = require('./helpers/test-data');

test.describe('Equivalencia + Valor Límite - HU-006, HU-010, HU-019, HU-022, HU-025', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('HU-006: Registrar entrada de productos con distintas cantidades', async ({ page }) => {
    await test.step('Registrar entrada con cantidad válida', async () => {
      await page.goto('/product/stock/movement.php?action=create&type=0');
      
      // CP-006-08 (cantidad válida)
      await page.selectOption('select[name="product_id"]', { index: 1 });
      await page.selectOption('select[name="warehouse_id"]', { index: 1 });
      await page.fill('input[name="qty"]', '10');
      await page.fill('input[name="price"]', '25.50');
      
      await page.click('input[type="submit"]');
      
      await expect(page.locator('.ok')).toBeVisible();
    });

    await test.step('Intentar registrar entrada con cantidad inválida', async () => {
      await page.goto('/product/stock/movement.php?action=create&type=0');
      
      // CP-006-09 (cantidad negativa)
      await page.selectOption('select[name="product_id"]', { index: 1 });
      await page.fill('input[name="qty"]', '-5');
      
      await page.click('input[type="submit"]');
      
      await expect(page.locator('.error')).toBeVisible();
    });

    await test.step('Registrar entrada con valor límite (0)', async () => {
      await page.goto('/product/stock/movement.php?action=create&type=0');
      
      // CP-006-07 (valor límite 0)
      await page.selectOption('select[name="product_id"]', { index: 1 });
      await page.fill('input[name="qty"]', '0');
      
      await page.click('input[type="submit"]');
      
      // Verificar comportamiento con cantidad 0
      await expect(page.locator('.error, .ok')).toBeVisible();
    });
  });

  test('HU-010: Generar reporte de inventario con parámetros correctos', async ({ page }) => {
    await test.step('Generar reporte con fechas válidas', async () => {
      await page.goto('/product/stock/report.php');
      
      // CP-010-03 (fecha válida)
      await page.fill('input[name="date_start"]', '2024-01-01');
      await page.fill('input[name="date_end"]', '2024-12-31');
      await page.check('input[name="show_zero"]');
      
      await page.click('input[value="Generar"]');
      
      await expect(page.locator('table.liste')).toBeVisible();
    });
  });

  test('HU-019: Crear producto con valores límite', async ({ page }) => {
    await test.step('Crear producto con precio límite superior', async () => {
      await page.goto('/product/card.php?action=create');
      
      // CP-019-6 (precio límite superior)
      await page.fill('input[name="ref"]', 'PROD-LIMITE-SUP');
      await page.fill('input[name="label"]', 'Producto Precio Máximo');
      await page.fill('input[name="price"]', '9999.99');
      
      await page.click('input[type="submit"]');
      
      await expect(page.locator('.ok, .error')).toBeVisible();
    });

    await test.step('Intentar crear producto con precio inválido', async () => {
      await page.goto('/product/card.php?action=create');
      
      // CP-019-4 (precio negativo)
      await page.fill('input[name="ref"]', 'PROD-INVALIDO');
      await page.fill('input[name="label"]', 'Producto Precio Inválido');
      await page.fill('input[name="price"]', '-10.50');
      
      await page.click('input[type="submit"]');
      
      await expect(page.locator('.error')).toBeVisible();
    });
  });
});