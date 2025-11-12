const { chromium } = require('playwright');

async function setupBasicData() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🏗️ CONFIGURANDO DATOS BÁSICOS');
  
  try {
    // Login
    await page.goto('http://localhost:8080');
    const inputs = await page.$$('input');
    if (inputs.length >= 2) {
      await inputs[0].fill('admin');
      await inputs[1].fill('admin');
      const buttons = await page.$$('button, input[type="submit"]');
      if (buttons.length > 0) await buttons[0].click();
      await page.waitForTimeout(3000);
    }

    // 1. Crear un producto básico
    console.log('📦 Creando producto de prueba...');
    await page.goto('/product/card.php?action=create');
    
    const productInputs = await page.$$('input[type="text"]');
    if (productInputs.length > 0) {
      await productInputs[0].fill('PROD-TEST-001');
      console.log('✅ Referencia producto: PROD-TEST-001');
    }
    if (productInputs.length > 1) {
      await productInputs[1].fill('Producto de Prueba Automática');
      console.log('✅ Nombre producto: Producto de Prueba Automática');
    }

    const priceInputs = await page.$$('input[type="number"], input[name*="price"]');
    if (priceInputs.length > 0) {
      await priceInputs[0].fill('100.00');
      console.log('💰 Precio: 100.00');
    }

    // Guardar producto
    const saveButtons = await page.$$('input[type="submit"], button[type="submit"]');
    if (saveButtons.length > 0) {
      await saveButtons[0].click();
      await page.waitForTimeout(2000);
      console.log('💾 Producto guardado');
    }

    // 2. Crear un almacén básico
    console.log('🏗️ Creando almacén de prueba...');
    await page.goto('/product/stock/warehouse/card.php?action=create');
    
    const warehouseInputs = await page.$$('input[type="text"]');
    if (warehouseInputs.length > 0) {
      await warehouseInputs[0].fill('ALM-TEST-001');
      console.log('✅ Referencia almacén: ALM-TEST-001');
    }
    if (warehouseInputs.length > 1) {
      await warehouseInputs[1].fill('Almacén de Prueba Automática');
      console.log('✅ Nombre almacén: Almacén de Prueba Automática');
    }

    // Guardar almacén
    if (saveButtons.length > 0) {
      await saveButtons[0].click();
      await page.waitForTimeout(2000);
      console.log('💾 Almacén guardado');
    }

    console.log('🎉 Configuración básica completada');
    await page.screenshot({ path: 'test-results/setup-completed.png' });

  } catch (error) {
    console.log('❌ Error en configuración:', error.message);
    await page.screenshot({ path: 'test-results/setup-error.png' });
  } finally {
    await browser.close();
  }
}

setupBasicData();