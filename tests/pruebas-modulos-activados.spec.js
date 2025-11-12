const { test, expect } = require('@playwright/test');
const { login } = require('./helpers/utils');

test.describe('Pruebas para módulos ACTIVADOS en Dolibarr', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('HU-001: Crear Producto - Módulo ACTIVADO', async ({ page }) => {
    console.log('📦 HU-001: Probando creación de producto...');
    
    await page.goto('/product/index.php?mainmenu=products&leftmenu=');
    
    // Buscar botón de crear producto
    const createButtons = await page.$$('a.btn, .button-new, [href*="action=create"]');
    console.log(`➕ Botones crear encontrados: ${createButtons.length}`);
    
    if (createButtons.length > 0) {
      await createButtons[0].click();
      console.log('✅ Navegando a creación de producto...');
      await page.waitForTimeout(3000);
      
      // Buscar formulario de producto
      const forms = await page.$$('form');
      console.log(`📝 Formularios en creación producto: ${forms.length}`);
      
      if (forms.length > 0) {
        // Estrategia: Buscar campos por placeholder o nombre común
        const fieldSelectors = [
          'input[placeholder*="ref"]',
          'input[placeholder*="Reference"]', 
          'input[name*="ref"]',
          'input[type="text"]:first-of-type'
        ];
        
        for (const selector of fieldSelectors) {
          const field = await page.$(selector);
          if (field) {
            await field.click(); // Primero hacer click
            await field.fill('PROD-TEST-' + Date.now());
            console.log(`✅ Campo referencia llenado con selector: ${selector}`);
            break;
          }
        }
        
        // Buscar campo nombre
        const nameSelectors = [
          'input[placeholder*="label"]',
          'input[placeholder*="Name"]',
          'input[name*="label"]',
          'input[type="text"]:nth-of-type(2)'
        ];
        
        for (const selector of nameSelectors) {
          const field = await page.$(selector);
          if (field) {
            await field.click();
            await field.fill('Producto Prueba Automática');
            console.log(`✅ Campo nombre llenado con selector: ${selector}`);
            break;
          }
        }
        
        // Buscar y hacer submit
        const submitButtons = await page.$$('input[type="submit"], button[type="submit"]');
        if (submitButtons.length > 0) {
          await submitButtons[0].click();
          console.log('💾 Intentando guardar producto...');
          await page.waitForTimeout(3000);
        }
      }
    } else {
      console.log('❌ No se encontró botón de crear producto');
    }
    
    await page.screenshot({ path: 'test-results/producto-creacion.png' });
  });

  test('HU-006: Gestión de Stock - Explorar módulo', async ({ page }) => {
    console.log('📊 HU-006: Explorando módulo de stock...');
    
    // Navegar a productos (el stock suele estar ahí)
    await page.goto('/product/index.php?mainmenu=products&leftmenu=');
    
    // Buscar enlaces relacionados con stock
    const stockLinks = await page.$$eval('a', links => 
      links.filter(link => 
        link.textContent?.toLowerCase().includes('stock') ||
        link.href?.includes('stock')
      ).map(link => ({ text: link.textContent, href: link.href }))
    );
    
    console.log('🔗 Enlaces de stock encontrados:', stockLinks);
    
    if (stockLinks.length > 0) {
      await page.goto(stockLinks[0].href);
      console.log(`✅ Navegando a: ${stockLinks[0].text}`);
      
      // Explorar la página de stock
      const forms = await page.$$('form');
      const tables = await page.$$('table');
      
      console.log(`📝 Formularios en stock: ${forms.length}`);
      console.log(`📊 Tablas en stock: ${tables.length}`);
      
      await page.screenshot({ path: 'test-results/stock-exploracion.png' });
    }
  });

  test('HU-017: Módulo Facturas - Verificar disponibilidad', async ({ page }) => {
    console.log('🧾 HU-017: Verificando módulo de facturas...');
    
    await page.goto('/compta/index.php?mainmenu=billing&leftmenu=');
    
    // Buscar enlaces de facturas
    const invoiceLinks = await page.$$eval('a', links => 
      links.filter(link => 
        link.textContent?.toLowerCase().includes('factur') ||
        link.textContent?.toLowerCase().includes('invoice') ||
        link.href?.includes('facture')
      ).map(link => ({ text: link.textContent, href: link.href }))
    );
    
    console.log('🔗 Enlaces de facturas encontrados:', invoiceLinks);
    
    if (invoiceLinks.length > 0) {
      console.log('✅ Módulo de facturas disponible');
      await page.goto(invoiceLinks[0].href);
      await page.waitForTimeout(2000);
      
      // Verificar si podemos crear factura
      const createButtons = await page.$$('a.btn, .button-new, [href*="action=create"]');
      console.log(`➕ Botones crear factura: ${createButtons.length}`);
      
      if (createButtons.length > 0) {
        console.log('✅ Se puede crear facturas');
      }
    } else {
      console.log('❌ Módulo de facturas no accesible desde el menú principal');
    }
    
    await page.screenshot({ path: 'test-results/facturas-disponibilidad.png' });
  });

  test('HU-002: Gestión de Terceros/Clientes', async ({ page }) => {
    console.log('👥 HU-002: Probando gestión de terceros...');
    
    await page.goto('/societe/index.php?mainmenu=companies&leftmenu=');
    
    // Buscar botón de crear tercero
    const createButtons = await page.$$('a.btn, .button-new, [href*="action=create"]');
    console.log(`➕ Botones crear tercero: ${createButtons.length}`);
    
    if (createButtons.length > 0) {
      await createButtons[0].click();
      console.log('✅ Navegando a creación de tercero...');
      await page.waitForTimeout(3000);
      
      // Estrategia inteligente para formularios complejos
      const forms = await page.$$('form');
      console.log(`📝 Formularios en creación tercero: ${forms.length}`);
      
      if (forms.length > 0) {
        // Hacer click en el formulario primero para activar campos
        await forms[0].click();
        await page.waitForTimeout(1000);
        
        // Buscar campo nombre de empresa
        const nameSelectors = [
          'input[placeholder*="Name"]',
          'input[placeholder*="Company"]',
          'input[name*="name"]',
          'input[type="text"]:first-of-type'
        ];
        
        for (const selector of nameSelectors) {
          const field = await page.$(selector);
          if (field) {
            // Scroll al elemento y hacer click
            await field.scrollIntoViewIfNeeded();
            await field.click({ force: true });
            await field.fill('Cliente Prueba ' + Date.now());
            console.log(`✅ Campo nombre empresa llenado: ${selector}`);
            break;
          }
        }
        
        await page.screenshot({ path: 'test-results/tercero-creacion.png' });
      }
    }
  });

  test('Explorar TODOS los módulos activos', async ({ page }) => {
    console.log('🔍 Explorando TODOS los módulos activados...');
    
    const modulesToTest = [
      { name: 'Products', url: '/product/index.php?mainmenu=products' },
      { name: 'Third-parties', url: '/societe/index.php?mainmenu=companies' },
      { name: 'Billing', url: '/compta/index.php?mainmenu=billing' },
      { name: 'Projects', url: '/projet/index.php?mainmenu=project' },
      { name: 'MRP', url: '/mrp/index.php?mainmenu=mrp' }
    ];
    
    for (const module of modulesToTest) {
      try {
        await page.goto(module.url);
        const title = await page.title();
        
        // Buscar elementos de creación
        const createButtons = await page.$$('a.btn, .button-new, [href*="action=create"]');
        const forms = await page.$$('form');
        const tables = await page.$$('table');
        
        console.log(`\n📦 ${module.name}:`);
        console.log(`   📄 ${title}`);
        console.log(`   ➕ Botones crear: ${createButtons.length}`);
        console.log(`   📝 Formularios: ${forms.length}`);
        console.log(`   📊 Tablas: ${tables.length}`);
        console.log(`   🔗 ${module.url}`);
        
        if (createButtons.length > 0) {
          console.log('   ✅ Módulo funcional y listo para pruebas');
        }
        
      } catch (error) {
        console.log(`\n❌ ${module.name}: ${error.message}`);
      }
    }
  });
});