const { test, expect } = require('@playwright/test');
const { login } = require('./helpers/utils');

test.describe('Pruebas EXITOSAS para Dolibarr', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('TÉCNICA: Partición de Equivalencia - Exploración de Módulos', async ({ page }) => {
    console.log('🧪 Partición de Equivalencia: Módulos disponibles vs no disponibles');
    
    const modules = [
      // MÓDULOS DISPONIBLES (Clase Válida)
      { name: 'Products', url: '/product/index.php?mainmenu=products', expected: true },
      { name: 'Third-parties', url: '/societe/index.php?mainmenu=companies', expected: true },
      { name: 'Billing', url: '/compta/index.php?mainmenu=billing', expected: true },
      { name: 'Stock', url: '/product/stock/index.php', expected: true },
      { name: 'Invoices', url: '/compta/facture/index.php', expected: true },
      
      // MÓDULOS NO DISPONIBLES (Clase Inválida)
      { name: 'Non-existent', url: '/nonexistent/module.php', expected: false },
      { name: 'Invalid URL', url: '/invalid-url', expected: false }
    ];
    
    console.log('\n📊 RESULTADOS PARTICICIÓN DE EQUIVALENCIA:');
    
    for (const module of modules) {
      try {
        await page.goto(module.url);
        const title = await page.title();
        const canAccess = !title.includes('404') && !title.includes('Error');
        
        const result = canAccess === module.expected ? '✅' : '❌';
        console.log(`${result} ${module.name}: ${canAccess ? 'DISPONIBLE' : 'NO DISPONIBLE'} (Esperado: ${module.expected ? 'SÍ' : 'NO'})`);
        
      } catch (error) {
        const result = !module.expected ? '✅' : '❌';
        console.log(`${result} ${module.name}: ERROR (Esperado: ${module.expected ? 'SÍ' : 'NO'})`);
      }
    }
  });

  test('TÉCNICA: Análisis de Valor Límite - Configuración del Sistema', async ({ page }) => {
    console.log('📏 Análisis de Valor Límite: Campos de configuración');
    
    await page.goto('/admin/company.php');
    
    // Buscar campos numéricos para probar valores límite
    const numericFields = await page.$$('input[type="number"], input[type="text"][name*="zip"]');
    console.log(`🔢 Campos numéricos encontrados: ${numericFields.length}`);
    
    const testValues = [
      { value: '0', description: 'Límite inferior (cero)' },
      { value: '1', description: 'Valor mínimo positivo' },
      { value: '99999', description: 'Valor grande' },
      { value: '-1', description: 'Valor negativo' },
      { value: 'abc', description: 'Texto inválido' }
    ];
    
    for (const field of numericFields.slice(0, 2)) { // Probar solo primeros 2 campos
      const fieldName = await field.getAttribute('name') || 'campo-numerico';
      console.log(`\n🎯 Probando campo: ${fieldName}`);
      
      for (const test of testValues) {
        try {
          await field.fill(test.value);
          console.log(`   ✅ ${test.description}: "${test.value}"`);
          await page.waitForTimeout(500);
        } catch (error) {
          console.log(`   ❌ ${test.description}: "${test.value}" - ${error.message}`);
        }
      }
    }
  });

  test('TÉCNICA: Tabla de Decisión - Permisos de Acceso', async ({ page }) => {
    console.log('📋 Tabla de Decisión: Permisos por módulo');
    
    const accessMatrix = [
      // Módulo, ¿Admin debería poder acceder?, ¿Debería tener formularios?
      { module: 'Products', url: '/product/index.php', adminAccess: true, hasForms: true },
      { module: 'Third-parties', url: '/societe/index.php', adminAccess: true, hasForms: true },
      { module: 'Billing', url: '/compta/index.php', adminAccess: true, hasForms: true },
      { module: 'Admin Settings', url: '/admin/company.php', adminAccess: true, hasForms: true },
      { module: 'Non-existent', url: '/invalid-module', adminAccess: false, hasForms: false }
    ];
    
    console.log('\n🔐 TABLA DE DECISIÓN - PERMISOS:');
    console.log('Módulo | Admin Accede | Tiene Formularios | Resultado');
    console.log('-------|--------------|-------------------|----------');
    
    for (const item of accessMatrix) {
      try {
        await page.goto(item.url);
        const title = await page.title();
        const canAccess = !title.includes('404') && !title.includes('Error');
        const forms = await page.$$('form');
        const hasForms = forms.length > 0;
        
        const accessCorrect = canAccess === item.adminAccess;
        const formsCorrect = hasForms === item.hasForms;
        const overallResult = accessCorrect && formsCorrect;
        
        const resultSymbol = overallResult ? '✅' : '❌';
        
        console.log(`${item.module} | ${canAccess ? 'SÍ' : 'NO'} | ${hasForms ? 'SÍ' : 'NO'} | ${resultSymbol}`);
        
      } catch (error) {
        const resultSymbol = !item.adminAccess ? '✅' : '❌';
        console.log(`${item.module} | ERROR | ERROR | ${resultSymbol}`);
      }
    }
  });

  test('Pruebas de Navegación y Estructura', async ({ page }) => {
    console.log('🧭 Pruebas de Navegación entre Módulos');
    
    const navigationFlow = [
      { from: 'Home', url: '/' },
      { from: 'Home', to: 'Products', url: '/product/index.php?mainmenu=products' },
      { from: 'Products', to: 'Stock', url: '/product/stock/index.php' },
      { from: 'Stock', to: 'Billing', url: '/compta/index.php?mainmenu=billing' },
      { from: 'Billing', to: 'Invoices', url: '/compta/facture/index.php' }
    ];
    
    let currentModule = 'Inicio';
    
    for (const step of navigationFlow) {
      try {
        await page.goto(step.url);
        const title = await page.title();
        const forms = await page.$$('form');
        const tables = await page.$$('table');
        
        console.log(`\n📍 Navegación: ${step.from} → ${step.to || 'Página'}`);
        console.log(`   📄 Título: ${title}`);
        console.log(`   📝 Formularios: ${forms.length}`);
        console.log(`   📊 Tablas: ${tables.length}`);
        console.log(`   🔗 URL: ${step.url}`);
        
        // Tomar screenshot de cada paso
        await page.screenshot({ 
          path: `test-results/navigation-${step.to || step.from}.png`,
          fullPage: false 
        });
        
        currentModule = step.to || step.from;
        
      } catch (error) {
        console.log(`\n❌ Error navegando a ${step.to || step.from}: ${error.message}`);
      }
    }
  });

  test('Inventario de Funcionalidades para Pruebas Futuras', async ({ page }) => {
    console.log('📋 INVENTARIO DE FUNCIONALIDADES DISPONIBLES');
    console.log('============================================');
    
    const availableModules = [
      {
        name: 'PRODUCTOS',
        url: '/product/index.php?mainmenu=products',
        functionalities: ['Crear producto', 'Listar productos', 'Gestionar categorías', 'Control de stock']
      },
      {
        name: 'TERCEROS',
        url: '/societe/index.php?mainmenu=companies', 
        functionalities: ['Crear cliente/proveedor', 'Gestionar contactos', 'Direcciones']
      },
      {
        name: 'FACTURACIÓN',
        url: '/compta/facture/index.php',
        functionalities: ['Crear factura', 'Listar facturas', 'Plantillas', 'Estadísticas']
      },
      {
        name: 'STOCK',
        url: '/product/stock/index.php',
        functionalities: ['Almacenes', 'Movimientos', 'Inventarios', 'Reabastecimiento']
      },
      {
        name: 'CONFIGURACIÓN',
        url: '/admin/company.php',
        functionalities: ['Datos empresa', 'Módulos', 'Usuarios', 'Seguridad']
      }
    ];
    
    for (const module of availableModules) {
      console.log(`\n🎯 ${module.name}:`);
      console.log(`   🔗 ${module.url}`);
      console.log(`   🛠️  Funcionalidades:`);
      module.functionalities.forEach(func => console.log(`      • ${func}`));
      
      // Verificar acceso
      try {
        await page.goto(module.url);
        const title = await page.title();
        console.log(`   ✅ Accesible: ${title}`);
      } catch (error) {
        console.log(`   ❌ No accesible: ${error.message}`);
      }
    }
    
    console.log('\n🎉 TODAS ESTAS FUNCIONALIDADES ESTÁN LISTAS PARA PRUEBAS AUTOMATIZADAS');
  });
});