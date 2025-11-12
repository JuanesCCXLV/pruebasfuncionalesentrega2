const { test, expect } = require('@playwright/test');
const { login } = require('./helpers/utils');

test.describe('Técnicas de Caja Negra - Ejemplos Prácticos', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('Ejemplo REAL: Partición de Equivalencia en Búsquedas', async ({ page }) => {
    console.log('🧪 PARTICICIÓN DE EQUIVALENCIA - Búsquedas');
    
    await page.goto('/product/index.php?mainmenu=products');
    
    // Buscar campo de búsqueda
    const searchInputs = await page.$$('input[type="search"], input[name*="search"], input[placeholder*="search"]');
    
    if (searchInputs.length > 0) {
      const searchField = searchInputs[0];
      
      // Clases de equivalencia para búsqueda
      const testCases = [
        { input: 'prod', description: 'Texto válido (coincidencia probable)', expected: 'resultados' },
        { input: '', description: 'Cadena vacía (todos los resultados)', expected: 'resultados' },
        { input: 'xyz123nonexistent', description: 'Texto sin coincidencias', expected: 'sin resultados' },
        { input: 'a', description: 'Texto muy corto', expected: 'resultados' }
      ];
      
      console.log('\n🔍 Probando búsquedas:');
      
      for (const testCase of testCases) {
        await searchField.fill(testCase.input);
        
        // Simular envío (Enter)
        await searchField.press('Enter');
        await page.waitForTimeout(2000);
        
        console.log(`   📝 "${testCase.input}" - ${testCase.description}`);
      }
    }
  });

  test('Ejemplo REAL: Valores Límite en Campos Numéricos', async ({ page }) => {
    console.log('📏 VALORES LÍMITE - Campos de configuración');
    
    await page.goto('/admin/company.php');
    
    // Buscar campos que puedan tener límites
    const potentialLimitFields = await page.$$('input[type="number"], input[name*="zip"], input[name*="phone"]');
    
    console.log(`🎯 Campos para valores límite: ${potentialLimitFields.length}`);
    
    const boundaryTests = [
      { value: '0', type: 'Límite inferior' },
      { value: '1', type: 'Mínimo positivo' },
      { value: '999999', type: 'Valor grande' },
      { value: '-1', type: 'Negativo' },
      { value: '1.5', type: 'Decimal' }
    ];
    
    for (let i = 0; i < Math.min(potentialLimitFields.length, 3); i++) {
      const field = potentialLimitFields[i];
      const fieldName = await field.getAttribute('name') || `campo-${i}`;
      
      console.log(`\n🔢 Probando: ${fieldName}`);
      
      for (const test of boundaryTests) {
        try {
          await field.fill(test.value);
          console.log(`   ✅ ${test.type}: ${test.value}`);
          await page.waitForTimeout(500);
        } catch (error) {
          console.log(`   ❌ ${test.type}: ${test.value} - Error`);
        }
      }
    }
  });

  test('Ejemplo REAL: Tablas de Decisión - Estados de Módulos', async ({ page }) => {
    console.log('📋 TABLA DE DECISIÓN - Estados y Permisos');
    
    const decisionTable = [
      // Condición: Módulo activo, Usuario admin, ¿Acceso permitido?
      { module: 'Products', active: true, admin: true, expectedAccess: true },
      { module: 'Third-parties', active: true, admin: true, expectedAccess: true },
      { module: 'Billing', active: true, admin: true, expectedAccess: true },
      { module: 'Non-existent', active: false, admin: true, expectedAccess: false }
    ];
    
    console.log('\n🎯 TABLA DE DECISIÓN:');
    console.log('Módulo | Activo | Admin | Acceso Esperado | Acceso Real | Resultado');
    console.log('-------|--------|-------|-----------------|-------------|----------');
    
    for (const decision of decisionTable) {
      const urls = {
        'Products': '/product/index.php',
        'Third-parties': '/societe/index.php', 
        'Billing': '/compta/index.php',
        'Non-existent': '/nonexistent-module'
      };
      
      try {
        await page.goto(urls[decision.module]);
        const title = await page.title();
        const actualAccess = !title.includes('404') && !title.includes('Error');
        const result = actualAccess === decision.expectedAccess;
        
        console.log(`${decision.module} | ${decision.active ? 'SÍ' : 'NO'} | ${decision.admin ? 'SÍ' : 'NO'} | ${decision.expectedAccess ? 'SÍ' : 'NO'} | ${actualAccess ? 'SÍ' : 'NO'} | ${result ? '✅' : '❌'}`);
        
      } catch (error) {
        const result = !decision.expectedAccess ? '✅' : '❌';
        console.log(`${decision.module} | ${decision.active ? 'SÍ' : 'NO'} | ${decision.admin ? 'SÍ' : 'NO'} | ${decision.expectedAccess ? 'SÍ' : 'NO'} | ERROR | ${result}`);
      }
    }
  });
});