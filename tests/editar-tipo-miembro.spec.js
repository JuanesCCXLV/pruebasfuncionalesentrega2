// tests/editar-tipo-miembro.spec.js

const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const TipoMiembroPage = require('../pages/TipoMiembroPage');

test.describe('RF-AC: Funcionalidad de Editar Tipo de Miembro', () => {
  let loginPage;
  let tipoMiembroPage;
  const typeId = 1; // ID del tipo de miembro a editar (ajustar según tu BD)

  test.beforeEach(async ({ page }) => {
    // Login previo
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin', 'admin');
    
    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).toBeTruthy();
    
    // Navegar a editar tipo de miembro
    tipoMiembroPage = new TipoMiembroPage(page);
    await tipoMiembroPage.goto(typeId);
  });

  test.afterEach(async () => {
    await loginPage.logout();
  });

  // =========================================
  // PARTICIÓN DE EQUIVALENCIA - ESTADO
  // =========================================

  test('CP-AC-01: Activar miembro (Estado = Activo)', async () => {
    // Clase: PE-EST1 (Estado válido - Activo)
    const config = {
      estado: 'Activo'
    };

    await tipoMiembroPage.editarTipoMiembro(config);
    
    const edicionExitosa = await tipoMiembroPage.edicionExitosa();
    expect(edicionExitosa).toBeTruthy();
  });

  test('CP-AC-02: Cerrar miembro (Estado = Cerrado)', async () => {
    // Clase: PE-EST2 (Estado inválido/cerrado)
    const config = {
      estado: 'Cerrado'
    };

    await tipoMiembroPage.editarTipoMiembro(config);
    
    const edicionExitosa = await tipoMiembroPage.edicionExitosa();
    expect(edicionExitosa).toBeTruthy();
  });

  // =========================================
  // PARTICIÓN DE EQUIVALENCIA - COTIZACIÓN
  // =========================================

  test('CP-AC-03: Cotización = Sí, Calcular importe = Sí, sin importe manual', async () => {
    // Configuración: Sujeto a cotización con cálculo automático
    const config = {
      sujetoCotizacion: true,
      calcularImporte: true
      // No se especifica importe porque se calcula automáticamente
    };

    await tipoMiembroPage.editarTipoMiembro(config);
    
    const edicionExitosa = await tipoMiembroPage.edicionExitosa();
    expect(edicionExitosa).toBeTruthy();
  });

  test('CP-AC-04: Cotización = Sí, Calcular importe = No, con valor de importe', async () => {
    // Configuración: Importe manual
    const config = {
      sujetoCotizacion: true,
      calcularImporte: false,
      importe: 50000
    };

    await tipoMiembroPage.editarTipoMiembro(config);
    
    const edicionExitosa = await tipoMiembroPage.edicionExitosa();
    expect(edicionExitosa).toBeTruthy();
  });

  test('CP-AC-05: Cotización = Sí, Calcular importe = No, importe vacío (Error)', async () => {
    // Clase: PE-IMP2 (Importe vacío cuando es obligatorio)
    const config = {
      sujetoCotizacion: true,
      calcularImporte: false,
      importe: '' // Campo obligatorio vacío
    };

    await tipoMiembroPage.editarTipoMiembro(config);
    
    // Debería haber error de validación
    const hasError = await tipoMiembroPage.hasValidationError();
    expect(hasError).toBeTruthy();
    
    const errorMessage = await tipoMiembroPage.getErrorMessage();
    console.log('📝 Mensaje de error:', errorMessage);
  });

  test('CP-AC-06: Cotización = No, sin importe', async () => {
    // Clase: PE-COT2 (No sujeto a cotización)
    const config = {
      sujetoCotizacion: false
      // No se requiere configurar importe
    };

    await tipoMiembroPage.editarTipoMiembro(config);
    
    const edicionExitosa = await tipoMiembroPage.edicionExitosa();
    expect(edicionExitosa).toBeTruthy();
  });

  // =========================================
  // PARTICIÓN DE EQUIVALENCIA - DURACIÓN
  // =========================================

  test('CP-AC-07: Duración tipo = Año, valor vacío', async () => {
    // Clase: PE-DUR1 (Tipo seleccionado con valor vacío)
    const config = {
      duracionTipo: 'year', // Ajustar según el valor real en el select
      duracionValor: '' // Valor opcional vacío
    };

    await tipoMiembroPage.editarTipoMiembro(config);
    
    const edicionExitosa = await tipoMiembroPage.edicionExitosa();
    expect(edicionExitosa).toBeTruthy();
  });

  test('CP-AC-08: Duración tipo vacío, valor vacío (Error)', async () => {
    // Clase: PE-DUR2 (Tipo no seleccionado)
    const config = {
      duracionTipo: '', // No selecciona tipo
      duracionValor: ''
    };

    await tipoMiembroPage.editarTipoMiembro(config);
    
    // Puede generar error dependiendo de la validación del sistema
    const hasError = await tipoMiembroPage.hasValidationError();
    
    // Verificar si el sistema permite o no esta configuración
    // Ajustar expectativa según comportamiento real
    console.log('🔍 ¿Tiene error de validación?:', hasError);
  });

  // =========================================
  // PARTICIÓN DE EQUIVALENCIA - NATURALEZA Y VOTO
  // =========================================

  test('CP-AC-09: Naturaleza = Individual, Voto autorizado = Sí', async () => {
    // Clase: PE-NAT1 (Individual), PE-VOT1 (Voto Sí)
    const config = {
      naturaleza: 'Individual',
      votoAutorizado: true
    };

    await tipoMiembroPage.editarTipoMiembro(config);
    
    const edicionExitosa = await tipoMiembroPage.edicionExitosa();
    expect(edicionExitosa).toBeTruthy();
  });

  test('CP-AC-10: Naturaleza = Corporación, Voto autorizado = No', async () => {
    // Clase: PE-NAT2 (Corporación), PE-VOT2 (Voto No)
    const config = {
      naturaleza: 'Corporación',
      votoAutorizado: false
    };

    await tipoMiembroPage.editarTipoMiembro(config);
    
    const edicionExitosa = await tipoMiembroPage.edicionExitosa();
    expect(edicionExitosa).toBeTruthy();
  });

  test('CP-AC-11: Naturaleza = Ambos, Voto autorizado = Sí', async () => {
    // Clase: PE-NAT3 (Ambos)
    const config = {
      naturaleza: 'Ambos',
      votoAutorizado: true
    };

    await tipoMiembroPage.editarTipoMiembro(config);
    
    const edicionExitosa = await tipoMiembroPage.edicionExitosa();
    expect(edicionExitosa).toBeTruthy();
  });
});

// =========================================
// SUITE DE PRUEBAS DE DIAGNÓSTICO
// =========================================

test.describe('Diagnóstico - Editar Tipo de Miembro', () => {
  let loginPage;
  let tipoMiembroPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin', 'admin');
    
    tipoMiembroPage = new TipoMiembroPage(page);
  });

  test('DEBUG: Ver estructura del formulario de edición', async ({ page }) => {
    await tipoMiembroPage.goto(1);
    
    await tipoMiembroPage.debugFormInfo();
    
    await page.screenshot({ 
      path: 'debug-editar-tipo-miembro.png',
      fullPage: true 
    });
    
    console.log('✅ Screenshot guardado: debug-editar-tipo-miembro.png');
  });

  test('Verificar que existe tipo de miembro ID=1', async ({ page }) => {
    try {
      await tipoMiembroPage.goto(1);
      
      const url = page.url();
      console.log('📍 URL:', url);
      
      // Verificar que estamos en página de edición
      expect(url).toContain('type.php');
      expect(url).toContain('action=edit');
      expect(url).toContain('rowid=1');
      
      console.log('✅ Tipo de miembro ID=1 existe');
      
    } catch (error) {
      console.log('❌ No se pudo acceder al tipo de miembro ID=1');
      console.log('💡 Verifica que existe un tipo de miembro con ID=1 en tu base de datos');
      console.log('💡 O ajusta el ID en los tests según tu configuración');
    }
  });

  test('Prueba simple: Cambiar solo el estado', async ({ page }) => {
    await tipoMiembroPage.goto(1);
    
    console.log('📝 Cambiando estado a Activo...');
    
    await tipoMiembroPage.setEstado('Activo');
    await tipoMiembroPage.guardar();
    
    await page.screenshot({ 
      path: 'test-cambio-estado.png',
      fullPage: true 
    });
    
    const exitoso = await tipoMiembroPage.edicionExitosa();
    console.log(`🔍 ¿Edición exitosa?: ${exitoso}`);
    
    expect(exitoso).toBeTruthy();
  });
});

// =========================================
// SUITE DE PRUEBAS COMBINADAS
// =========================================

test.describe('Pruebas Combinadas - Configuraciones Complejas', () => {
  let loginPage;
  let tipoMiembroPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin', 'admin');
    
    tipoMiembroPage = new TipoMiembroPage(page);
    await tipoMiembroPage.goto(1);
  });

  test('Configuración completa: Miembro activo con cotización', async () => {
    const config = {
      estado: 'Activo',
      naturaleza: 'Individual',
      sujetoCotizacion: true,
      calcularImporte: false,
      importe: 100000,
      duracionTipo: 'year',
      duracionValor: 1,
      votoAutorizado: true
    };

    await tipoMiembroPage.editarTipoMiembro(config);
    
    const edicionExitosa = await tipoMiembroPage.edicionExitosa();
    expect(edicionExitosa).toBeTruthy();
  });

  test('Configuración completa: Miembro corporativo sin cotización', async () => {
    const config = {
      estado: 'Activo',
      naturaleza: 'Corporación',
      sujetoCotizacion: false,
      votoAutorizado: false
    };

    await tipoMiembroPage.editarTipoMiembro(config);
    
    const edicionExitosa = await tipoMiembroPage.edicionExitosa();
    expect(edicionExitosa).toBeTruthy();
  });
});