const { test, expect } = require('@playwright/test');
const { login } = require('./helpers/utils');
const { validData, invalidData } = require('./helpers/test-data');

test.describe('Partición de Equivalencia - HU-001, HU-017, HU-002, HU-008, HU-018, HU-020, HU-021, HU-024', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('HU-001: Crear nuevo almacén con datos válidos e inválidos', async ({ page }) => {
    // Clases válidas
    await test.step('Crear almacén con datos válidos', async () => {
      await page.goto('/admin/warehouses.php');
      
      // CP-001-01, CP-001-03, CP-001-05, CP-001-15, CP-001-17, CP-001-19, CP-001-21
      await page.fill('input[name="ref"]', validData.warehouse.ref);
      await page.fill('input[name="label"]', validData.warehouse.label);
      await page.selectOption('select[name="status"]', { value: '1' });
      await page.fill('input[name="country"]', validData.warehouse.country);
      await page.fill('input[name="town"]', validData.warehouse.town);
      await page.fill('input[name="zip"]', validData.warehouse.zip);
      await page.fill('textarea[name="address"]', validData.warehouse.address);
      
      await page.click('input[type="submit"]');
      
      // Verificar creación exitosa
      await expect(page.locator('.ok')).toBeVisible();
      await expect(page.locator(`text=${validData.warehouse.ref}`)).toBeVisible();
    });

    // Clases inválidas
    await test.step('Intentar crear almacén con referencia vacía', async () => {
      await page.goto('/admin/warehouses.php?action=create');
      
      // CP-001-02
      await page.fill('input[name="ref"]', '');
      await page.fill('input[name="label"]', 'Almacén Test');
      
      await page.click('input[type="submit"]');
      
      // Verificar mensaje de error
      await expect(page.locator('.error')).toBeVisible();
    });
  });

  test('HU-017: Crear factura con datos correctos e incorrectos', async ({ page }) => {
    await test.step('Crear factura con datos válidos', async () => {
      await page.goto('/compta/facture.php?action=create');
      
      // CP-017-01, CP-017-03, CP-017-05
      await page.selectOption('select[name="socid"]', { index: 1 });
      await page.fill('input[name="date"]', new Date().toISOString().split('T')[0]);
      
      // Agregar línea de producto
      await page.click('button[data-action="addline"]');
      await page.fill('input[name="product_ref"]', validData.product.ref);
      await page.fill('input[name="qty"]', '1');
      await page.fill('input[name="price"]', '100.00');
      
      await page.click('input[type="submit"]');
      
      // Verificar creación
      await expect(page.locator('.ok')).toBeVisible();
    });

    await test.step('Intentar crear factura sin cliente', async () => {
      await page.goto('/compta/facture.php?action=create');
      
      // CP-017-02
      await page.fill('input[name="date"]', new Date().toISOString().split('T')[0]);
      
      await page.click('input[type="submit"]');
      
      // Verificar error
      await expect(page.locator('.error')).toBeVisible();
    });
  });

  test('HU-002: Editar datos de almacén con datos válidos e inválidos', async ({ page }) => {
    await test.step('Editar almacén con datos válidos', async () => {
      await page.goto('/admin/warehouses.php');
      await page.click('a[href*="action=edit"]:first-child');
      
      // CP-002-01, CP-002-03
      await page.fill('input[name="label"]', 'Almacén Editado');
      await page.fill('textarea[name="address"]', 'Nueva dirección 123');
      
      await page.click('input[type="submit"]');
      
      await expect(page.locator('.ok')).toBeVisible();
    });
  });

  test('HU-008: Ajustes de inventario - búsqueda por fechas', async ({ page }) => {
    await test.step('Buscar movimientos con rango válido', async () => {
      await page.goto('/product/stock/movement_list.php');
      
      // CP-008-07 (fecha válida)
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      
      await page.fill('input[name="date_start"]', startDate);
      await page.fill('input[name="date_end"]', endDate);
      await page.click('input[type="submit"]');
      
      // Verificar que se muestran resultados
      await expect(page.locator('.liste')).toBeVisible();
    });

    await test.step('Buscar con rango inválido', async () => {
      await page.goto('/product/stock/movement_list.php');
      
      // CP-008-08 (fecha inválida)
      await page.fill('input[name="date_start"]', '2024-12-31');
      await page.fill('input[name="date_end"]', '2024-01-01');
      await page.click('input[type="submit"]');
      
      // Verificar comportamiento con rango invertido
      await expect(page.locator('.liste')).toBeVisible();
    });
  });
});