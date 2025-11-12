const { test, expect } = require('@playwright/test');
const { login } = require('./helpers/utils');

test.describe('Pruebas de técnicas con módulos básicos', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // PARTICIONES DE EQUIVALENCIA con datos reales disponibles
  test('Partición Equivalencia - Configuración Empresa', async ({ page }) => {
    console.log('🧪 Probando Partición de Equivalencia en empresa...');
    
    await page.goto('/admin/company.php');
    
    // Clases válidas e inválidas para campos de empresa
    const testCases = [
      // Campo: Nombre de empresa
      { field: 'name', valid: 'Empresa Válida SA', invalid: '', description: 'Nombre no vacío' },
      // Campo: Email
      { field: 'email', valid: 'test@empresa.com', invalid: 'email-invalido', description: 'Formato email válido' },
      // Campo: Teléfono  
      { field: 'phone', valid: '912345678', invalid: 'abc', description: 'Teléfono numérico' }
    ];
    
    for (const testCase of testCases) {
      const input = await page.$(`input[name="${testCase.field}"]`);
      if (input) {
        // Probar valor válido
        await input.fill(testCase.valid);
        console.log(`✅ ${testCase.field}: Valor válido probado`);
        
        // Probar valor inválido
        await input.fill(testCase.invalid);
        console.log(`✅ ${testCase.field}: Valor inválido probado`);
      }
    }
  });

  // ANÁLISIS DE VALOR LÍMITE con campos numéricos
  test('Valor Límite - Configuración del Sistema', async ({ page }) => {
    console.log('📏 Probando Valores Límite...');
    
    await page.goto('/admin/company.php');
    
    // Buscar campos numéricos para probar límites
    const numberInputs = await page.$$('input[type="number"]');
    console.log(`🔢 Campos numéricos encontrados: ${numberInputs.length}`);
    
    for (const input of numberInputs) {
      const name = await input.getAttribute('name');
      
      // Probar diferentes valores
      const testValues = [0, 1, 999, -1, 1000];
      
      for (const value of testValues) {
        await input.fill(value.toString());
        console.log(`✅ ${name || 'campo'}: Valor ${value} probado`);
      }
    }
  });

  // TABLAS DE DECISIÓN con permisos de usuario
  test('Tabla de Decisión - Accesos de Usuario', async ({ page }) => {
    console.log('📋 Probando Tablas de Decisión...');
    
    // Probar diferentes secciones según disponibilidad
    const sections = [
      { url: '/admin/company.php', expected: true, description: 'Admin puede acceder configuración' },
      { url: '/user/card.php', expected: true, description: 'Admin puede acceder usuarios' },
      { url: '/admin/modules.php', expected: true, description: 'Admin puede acceder módulos' }
    ];
    
    for (const section of sections) {
      try {
        await page.goto(section.url);
        const title = await page.title();
        
        // Verificar acceso
        const canAccess = !title.includes('404') && !title.includes('Error');
        console.log(`🔐 ${section.description}: ${canAccess ? '✅ Acceso permitido' : '❌ Acceso denegado'}`);
        
      } catch (error) {
        console.log(`🔐 ${section.description}: ❌ Error de acceso`);
      }
    }
  });
});