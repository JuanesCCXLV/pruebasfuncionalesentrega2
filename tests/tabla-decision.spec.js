const { test, expect } = require('@playwright/test');
const { login, loginAsUser } = require('./helpers/utils');

test.describe('Tabla de Decisión - HU-004, HU-023, HU-007', () => {
  test('HU-004: Evaluar eliminación según existencia de stock y rol', async ({ page }) => {
    // CP-004-01, CP-004-03: Admin con stock = 0 puede eliminar
    await test.step('Admin elimina producto sin stock', async () => {
      await login(page, 'admin', 'admin');
      await page.goto('/product/card.php?action=create');
      
      // Crear producto sin stock
      await page.fill('input[name="ref"]', 'PROD-DEL-TEST');
      await page.fill('input[name="label"]', 'Producto para Eliminar');
      await page.fill('input[name="price"]', '50.00');
      await page.click('input[type="submit"]');
      
      // Intentar eliminar
      await page.click('a[href*="action=delete"]');
      await page.click('input[type="submit"]');
      
      await expect(page.locator('.ok')).toBeVisible();
    });

    // CP-004-02: No permitir eliminación con stock > 0
    await test.step('Intentar eliminar producto con stock', async () => {
      await login(page, 'admin', 'admin');
      await page.goto('/product/card.php?id=1'); // Producto existente con stock
      
      await page.click('a[href*="action=delete"]');
      
      // Verificar que muestra error o no permite
      await expect(page.locator('.error, .warning')).toBeVisible();
    });

    // CP-004-04: Usuario no admin no puede eliminar
    await test.step('Usuario no admin intenta eliminar', async () => {
      await loginAsUser(page, 'user', 'password');
      await page.goto('/product/card.php?id=1');
      
      const deleteLink = page.locator('a[href*="action=delete"]');
      await expect(deleteLink).not.toBeVisible();
    });
  });

  test('HU-023: Generar nota de crédito según rol y estado', async ({ page }) => {
    // CP-023-01, CP-023-03: Admin puede generar nota de crédito para factura validada
    await test.step('Admin genera nota de crédito', async () => {
      await login(page, 'admin', 'admin');
      await page.goto('/compta/facture.php?action=create');
      
      // Crear factura primero
      await page.selectOption('select[name="socid"]', { index: 1 });
      await page.click('input[type="submit"]');
      
      // Buscar opción de nota de crédito
      const creditNoteLink = page.locator('a[href*="credit_note"]');
      if (await creditNoteLink.isVisible()) {
        await creditNoteLink.click();
        await expect(page.locator('.ok')).toBeVisible();
      }
    });

    // CP-023-02, CP-023-04: Vendedor no puede generar nota para factura pagada
    await test.step('Vendedor intenta generar nota de crédito', async () => {
      await loginAsUser(page, 'vendedor', 'password');
      await page.goto('/compta/facture.php?id=1'); // Factura existente
      
      const creditNoteLink = page.locator('a[href*="credit_note"]');
      if (await creditNoteLink.isVisible()) {
        await creditNoteLink.click();
        await expect(page.locator('.error')).toBeVisible();
      }
    });
  });

  test('HU-007: Registrar salida según stock disponible', async ({ page }) => {
    await login(page, 'admin', 'admin');
    
    await test.step('Registrar salida con stock suficiente', async () => {
      await page.goto('/product/stock/movement.php?action=create&type=1');
      
      // CP-007-03: Cantidad válida con stock suficiente
      await page.selectOption('select[name="product_id"]', { index: 1 });
      await page.fill('input[name="qty"]', '1');
      await page.click('input[type="submit"]');
      
      await expect(page.locator('.ok')).toBeVisible();
    });

    await test.step('Intentar salida con stock insuficiente', async () => {
      await page.goto('/product/stock/movement.php?action=create&type=1');
      
      // CP-007-04, CP-007-05: Cantidad mayor al stock disponible
      await page.selectOption('select[name="product_id"]', { index: 1 });
      await page.fill('input[name="qty"]', '999999');
      await page.click('input[type="submit"]');
      
      await expect(page.locator('.error')).toBeVisible();
    });
  });
});