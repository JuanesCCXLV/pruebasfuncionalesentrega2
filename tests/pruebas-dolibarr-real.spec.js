const { test, expect } = require('@playwright/test');
const { login } = require('./helpers/utils');

test.describe('Pruebas para Dolibarr con módulos básicos', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('Configurar empresa/organización', async ({ page }) => {
    console.log('🏢 Configurando datos de empresa...');
    
    await page.goto('/admin/company.php');
    
    // Buscar y llenar campos básicos de empresa
    const textInputs = await page.$$('input[type="text"]');
    console.log(`📝 Campos de texto encontrados: ${textInputs.length}`);
    
    // Llenar campos comunes
    const fieldMapping = {
      'name': 'Empresa de Pruebas Automatizadas',
      'address': 'Calle Prueba 123',
      'zip': '28001',
      'town': 'Madrid',
      'email': 'pruebas@empresa.com',
      'phone': '912345678'
    };
    
    for (const input of textInputs) {
      const name = await input.getAttribute('name');
      if (name && fieldMapping[name]) {
        await input.fill(fieldMapping[name]);
        console.log(`✅ ${name}: ${fieldMapping[name]}`);
      }
    }
    
    // Guardar
    const saveBtn = await page.$('input[type="submit"], button[type="submit"]');
    if (saveBtn) {
      await saveBtn.click();
      await page.waitForTimeout(2000);
      console.log('💾 Datos de empresa guardados');
    }
    
    await page.screenshot({ path: 'test-results/empresa-configurada.png' });
  });

  test('Gestionar productos - Búsqueda de funcionalidad', async ({ page }) => {
    console.log('📦 Explorando gestión de productos...');
    
    // Intentar diferentes URLs de productos
    const productUrls = [
      '/product/index.php',
      '/product/card.php',
      '/product/list.php',
      '/product/stock/index.php'
    ];
    
    for (const url of productUrls) {
      try {
        await page.goto(url);
        const title = await page.title();
        
        // Buscar elementos de gestión de productos
        const createButtons = await page.$$('a.btn-new, .button-add, [href*="action=create"]');
        const productTables = await page.$$('table.liste');
        
        console.log(`🔗 ${url}:`);
        console.log(`   📄 Título: ${title}`);
        console.log(`   ➕ Botones crear: ${createButtons.length}`);
        console.log(`   📊 Tablas productos: ${productTables.length}`);
        
        if (createButtons.length > 0) {
          console.log('   ✅ ¡Funcionalidad de productos disponible!');
          await createButtons[0].click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: `test-results/productos-${url.split('/').pop()}.png` });
          break;
        }
        
      } catch (error) {
        console.log(`   ❌ ${url} no accesible`);
      }
    }
  });

  test('Explorar módulos disponibles', async ({ page }) => {
    console.log('🔍 Explorando todos los módulos disponibles...');
    
    await page.goto('/');
    
    // Obtener todos los enlaces del menú
    const allLinks = await page.$$eval('a', links => 
      links.map(link => ({
        text: link.textContent?.trim(),
        href: link.href,
        class: link.className
      })).filter(link => link.text && link.href && link.href.includes('/'))
    );
    
    console.log('📋 MÓDULOS Y SECCIONES DISPONIBLES:');
    
    // Agrupar por categorías
    const modules = {
      administracion: [],
      productos: [],
      terceros: [],
      contabilidad: [],
      otros: []
    };
    
    for (const link of allLinks) {
      const text = link.text.toLowerCase();
      const href = link.href;
      
      if (text.includes('admin') || text.includes('setup') || text.includes('config')) {
        modules.administracion.push({ text: link.text, href });
      } else if (text.includes('product') || text.includes('stock') || text.includes('warehouse')) {
        modules.productos.push({ text: link.text, href });
      } else if (text.includes('societe') || text.includes('contact') || text.includes('client')) {
        modules.terceros.push({ text: link.text, href });
      } else if (text.includes('compta') || text.includes('facture') || text.includes('invoice')) {
        modules.contabilidad.push({ text: link.text, href });
      } else {
        modules.otros.push({ text: link.text, href });
      }
    }
    
    // Mostrar módulos disponibles
    for (const [category, items] of Object.entries(modules)) {
      if (items.length > 0) {
        console.log(`\n${category.toUpperCase()}:`);
        items.forEach(item => console.log(`   📍 ${item.text} -> ${item.href}`));
      }
    }
    
    await page.screenshot({ path: 'test-results/modulos-disponibles.png' });
  });

  test('Prueba de formularios básicos', async ({ page }) => {
    console.log('🧪 Probando formularios del sistema...');
    
    // Probar formularios en diferentes secciones
    const testSections = [
      '/admin/company.php',
      '/societe/card.php?action=create',
      '/user/card.php?action=create'
    ];
    
    for (const section of testSections) {
      try {
        await page.goto(section);
        const forms = await page.$$('form');
        
        console.log(`🔗 ${section}:`);
        console.log(`   📝 Formularios: ${forms.length}`);
        
        if (forms.length > 0) {
          const inputs = await forms[0].$$('input, select, textarea');
          console.log(`   🎯 Campos: ${inputs.length}`);
          
          // Contar tipos de campos
          const fieldTypes = {};
          for (const input of inputs) {
            const type = await input.getAttribute('type') || await input.evaluate(el => el.tagName);
            fieldTypes[type] = (fieldTypes[type] || 0) + 1;
          }
          console.log(`   📊 Tipos:`, fieldTypes);
          
          // Probar llenar algunos campos
          const textInputs = await forms[0].$$('input[type="text"]');
          if (textInputs.length > 0) {
            await textInputs[0].fill('TEST-' + Date.now());
            console.log('   ✅ Campo de texto llenado');
          }
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
  });
});