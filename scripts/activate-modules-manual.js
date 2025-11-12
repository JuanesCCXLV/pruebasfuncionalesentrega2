const { chromium } = require('playwright');

async function activateModulesManual() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000  // Más lento para ver qué pasa
  });
  const page = await browser.newPage();
  
  console.log('🔧 ACTIVACIÓN MANUAL DE MÓDULOS');
  console.log('💡 Por favor observa la pantalla y sigue las instrucciones...');
  
  try {
    // 1. Ir a la página principal
    await page.goto('http://localhost:8080');
    console.log('✅ Página principal cargada');
    
    // 2. Hacer login MANUALMENTE (más confiable)
    console.log('\n👤 POR FAVOR HAZ LOGIN MANUALMENTE:');
    console.log('   - Usuario: admin');
    console.log('   - Password: admin');
    console.log('   - Después del login, presiona ENTER aquí en la terminal...');
    
    // Esperar a que el usuario haga login manual
    await page.waitForFunction(() => {
      return !document.querySelector('input[type="password"]') || 
             document.querySelector('.logout, .user');
    }, { timeout: 120000 }); // 2 minutos para login manual
    
    console.log('✅ Login detectado');
    
    // 3. Ir a módulos
    await page.goto('http://localhost:8080/admin/modules.php');
    console.log('✅ Página de módulos cargada');
    
    // 4. Tomar screenshot para debug
    await page.screenshot({ path: 'test-results/modules-page.png', fullPage: true });
    console.log('📸 Screenshot de módulos guardado');
    
    // 5. Buscar módulos específicos
    console.log('\n🔍 BUSCANDO MÓDULOS PARA ACTIVAR...');
    
    // Lista de módulos a buscar
    const targetModules = [
      'product', 'stock', 'inventory', 'warehouse', 
      'invoice', 'facture', 'order', 'commande'
    ];
    
    // Buscar todos los textos de la página
    const pageText = await page.textContent('body');
    const lines = pageText.split('\n').filter(line => line.trim().length > 0);
    
    console.log('📋 MÓDULOS ENCONTRADOS EN LA PÁGINA:');
    let foundModules = [];
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      for (const module of targetModules) {
        if (lowerLine.includes(module) && line.trim().length < 100) {
          if (!foundModules.includes(line.trim())) {
            foundModules.push(line.trim());
            console.log(`   📍 ${line.trim()}`);
          }
        }
      }
    }
    
    if (foundModules.length === 0) {
      console.log('❌ No se encontraron módulos relacionados con productos/stock');
      console.log('💡 Los módulos pueden estar en otra sección o con otros nombres');
    }
    
    // 6. Estrategia: Buscar checkboxes para activar
    console.log('\n🎯 BUSCANDO CHECKBOXES PARA ACTIVAR...');
    const checkboxes = await page.$$('input[type="checkbox"]');
    console.log(`   Checkboxes encontrados: ${checkboxes.length}`);
    
    let activatedCount = 0;
    for (const checkbox of checkboxes) {
      try {
        // Obtener texto alrededor del checkbox
        const surroundingText = await checkbox.evaluate(el => {
          const row = el.closest('tr');
          return row ? row.textContent : '';
        });
        
        const lowerText = surroundingText.toLowerCase();
        
        // Verificar si es un módulo que queremos activar
        const shouldActivate = targetModules.some(module => 
          lowerText.includes(module)
        );
        
        if (shouldActivate) {
          const isChecked = await checkbox.isChecked();
          if (!isChecked) {
            await checkbox.check();
            console.log(`✅ ACTIVADO: ${surroundingText.substring(0, 50)}...`);
            activatedCount++;
          } else {
            console.log(`ℹ️  YA ACTIVADO: ${surroundingText.substring(0, 50)}...`);
          }
        }
      } catch (error) {
        // Continuar con el siguiente checkbox
      }
    }
    
    if (activatedCount > 0) {
      // 7. Guardar cambios
      console.log('\n💾 GUARDANDO CAMBIOS...');
      
      // Buscar botón de guardar
      const saveSelectors = [
        'input[type="submit"]',
        'button[type="submit"]', 
        'input[value*="Save"]',
        'input[value*="save"]',
        'button'
      ];
      
      for (const selector of saveSelectors) {
        const buttons = await page.$$(selector);
        for (const button of buttons) {
          const value = await button.getAttribute('value');
          const text = await button.textContent();
          
          if (value?.toLowerCase().includes('save') || 
              value?.toLowerCase().includes('apply') ||
              text?.toLowerCase().includes('save') ||
              text?.toLowerCase().includes('appliquer')) {
            
            await button.click();
            console.log(`✅ Botón clickeado: ${value || text}`);
            await page.waitForTimeout(5000);
            
            // Verificar si se guardó
            const successIndicators = await page.$$('.ok, .success, .alert-success');
            if (successIndicators.length > 0) {
              console.log('🎉 ¡Cambios guardados exitosamente!');
            }
            
            break;
          }
        }
      }
    } else {
      console.log('\n💡 No se activaron nuevos módulos. Posibles razones:');
      console.log('   - Ya están activados');
      console.log('   - No están instalados');
      console.log('   - Tienen nombres diferentes');
    }
    
    // 8. Tomar screenshot final
    await page.screenshot({ path: 'test-results/modules-after-activation.png' });
    console.log('\n📸 Screenshot final guardado');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    await page.screenshot({ path: 'test-results/activation-error.png' });
  } finally {
    console.log('\n🎯 INSTRUCCIONES MANUALES:');
    console.log('   1. Ve a http://localhost:8080/admin/modules.php');
    console.log('   2. Busca y activa estos módulos:');
    console.log('      - Products/Services');
    console.log('      - Stock/Warehouse'); 
    console.log('      - Invoices');
    console.log('      - Orders');
    console.log('   3. Haz clic en "Save" o "Apply"');
    console.log('   4. Luego ejecuta las pruebas nuevamente');
    
    await browser.close();
  }
}

activateModulesManual();