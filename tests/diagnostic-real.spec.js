const { test, expect } = require('@playwright/test');
const { login } = require('./helpers/utils');

test('Diagnóstico real de la estructura de Dolibarr', async ({ page }) => {
  console.log('🔍 DIAGNÓSTICO DE ESTRUCTURA DOLIBARR');
  
  // Login exitoso (esto ya funciona)
  await login(page);
  
  // Navegar a la página principal y analizar
  await page.goto('/');
  
  // 1. Analizar la estructura del menú
  console.log('\n📊 ANALIZANDO MENÚS DISPONIBLES:');
  const menuLinks = await page.$$eval('a, .menu, .tabs, nav a', elements => 
    elements.map(el => ({
      text: el.textContent?.trim(),
      href: el.getAttribute('href'),
      class: el.className
    })).filter(item => item.text && item.href)
  );
  
  console.log('Enlaces encontrados:', menuLinks.slice(0, 10)); // Mostrar primeros 10
  
  // 2. Buscar módulos específicos
  const modulesToCheck = [
    '/product/index.php',
    '/product/stock/index.php', 
    '/compta/facture.php',
    '/societe/index.php',
    '/admin/company.php',
    '/admin/modules.php'
  ];
  
  console.log('\n🔍 VERIFICANDO MÓDULOS:');
  for (const module of modulesToCheck) {
    try {
      await page.goto(module);
      const title = await page.title();
      console.log(`✅ ${module} - ${title}`);
      
      // Analizar formularios en esta página
      const forms = await page.$$('form');
      console.log(`   📝 Formularios: ${forms.length}`);
      
      if (forms.length > 0) {
        const inputs = await page.$$('form input, form select, form textarea');
        console.log(`   🎯 Campos: ${inputs.length}`);
        
        // Mostrar algunos campos
        for (let i = 0; i < Math.min(inputs.length, 3); i++) {
          const input = inputs[i];
          const name = await input.getAttribute('name');
          const type = await input.getAttribute('type');
          console.log(`      ${i+1}. name="${name}", type="${type}"`);
        }
      }
      
    } catch (error) {
      console.log(`❌ ${module} - No accesible`);
    }
  }
  
  // 3. Tomar screenshot del dashboard
  await page.screenshot({ path: 'test-results/dashboard-structure.png' });
  console.log('\n📸 Screenshot del dashboard: test-results/dashboard-structure.png');
});