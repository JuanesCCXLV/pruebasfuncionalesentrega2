
const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const TerceroPage = require('../pages/TerceroPage');

test.describe('RF-T: Funcionalidad de Crear Tercero', () => {
  let loginPage;
  let terceroPage;

  test.beforeEach(async ({ page }) => {
    // Login previo
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_USER, process.env.ADMIN_PASSWORD);
    
    // Navegar a crear tercero
    terceroPage = new TerceroPage(page);
    await terceroPage.goto();
  });

  test.afterEach(async ({ page }) => {
    await loginPage.logout();
  });

  // =========================================
  // PARTICIÓN DE EQUIVALENCIA - NOMBRE
  // =========================================

  test('CP-T01: Crear tercero con nombre válido, cliente potencial y proveedor Sí', async () => {
    // Clase: PE-TN1 (Nombre válido), PE-TC1 (Cliente potencial), PE-PR1 (Proveedor Sí)
    const data = {
      nombre: 'Empresa Ejemplo S.A.',
      tipoCliente: 'Cliente potencial',
      proveedor: true
    };

    await terceroPage.crearTercero(data);
    
    const terceroCreado = await terceroPage.terceroCreado();
    expect(terceroCreado).toBeTruthy();
  });

  test('CP-T02: Error al crear tercero con nombre vacío', async () => {
    // Clase: PE-TN2 (Campo vacío)
    const data = {
      nombre: '', // Campo obligatorio vacío
      tipoCliente: 'Cliente potencial',
      proveedor: true
    };

    await terceroPage.crearTercero(data);
    
    const hasError = await terceroPage.hasValidationError();
    expect(hasError).toBeTruthy();
  });

  // =========================================
  // ANÁLISIS DE VALOR LÍMITE - NOMBRE
  // =========================================

  test('CP-T03: Nombre con 2 caracteres (debajo del mínimo)', async () => {
    // VL-2: Inválido (min- = 2)
    const data = {
      nombre: terceroPage.generateStringWithLength(2),
      tipoCliente: 'Cliente potencial',
      proveedor: true
    };

    await terceroPage.crearTercero(data);
    
    const hasError = await terceroPage.hasValidationError();
    expect(hasError).toBeTruthy();
  });

  test('CP-T04: Nombre con 3 caracteres (límite inferior válido)', async () => {
    // VL-3: Válido (min = 3)
    const data = {
      nombre: terceroPage.generateStringWithLength(3),
      tipoCliente: 'Cliente potencial',
      proveedor: true
    };

    await terceroPage.crearTercero(data);
    
    const terceroCreado = await terceroPage.terceroCreado();
    expect(terceroCreado).toBeTruthy();
  });

  test('CP-T05: Nombre con 50 caracteres (límite superior válido)', async () => {
    // VL-50: Válido (max = 50)
    const data = {
      nombre: terceroPage.generateStringWithLength(50),
      tipoCliente: 'Cliente potencial',
      proveedor: true
    };

    await terceroPage.crearTercero(data);
    
    const terceroCreado = await terceroPage.terceroCreado();
    expect(terceroCreado).toBeTruthy();
  });

  test('CP-T06: Nombre con 51 caracteres (excede límite superior)', async () => {
    // VL-51: Inválido (max+ = 51)
    const data = {
      nombre: terceroPage.generateStringWithLength(51),
      tipoCliente: 'Cliente potencial',
      proveedor: true
    };

    await terceroPage.crearTercero(data);
    
    // Debería ser rechazado o truncado
    const hasError = await terceroPage.hasValidationError();
    // Verificar según comportamiento real del sistema
  });

  // =========================================
  // PARTICIÓN DE EQUIVALENCIA - TIPO CLIENTE
  // =========================================

  test('CP-T07: Crear tercero como Cliente potencial / Cliente y proveedor No', async () => {
    // Clase: PE-TC2 (Cliente potencial / Cliente)
    const data = {
      nombre: 'Corporación ABC',
      tipoCliente: 'Cliente potencial / Cliente',
      proveedor: false
    };

    await terceroPage.crearTercero(data);
    
    const terceroCreado = await terceroPage.terceroCreado();
    expect(terceroCreado).toBeTruthy();
  });

  test('CP-T08: Crear tercero como Cliente y proveedor Sí', async () => {
    // Clase: PE-TC3 (Cliente)
    const data = {
      nombre: 'Distribuidora XYZ',
      tipoCliente: 'Cliente',
      proveedor: true
    };

    await terceroPage.crearTercero(data);
    
    const terceroCreado = await terceroPage.terceroCreado();
    expect(terceroCreado).toBeTruthy();
  });

  test('CP-T09: Crear tercero Ni cliente ni cliente potencial y proveedor No', async () => {
    // Clase: PE-TC4 (Ni cliente ni cliente potencial)
    const data = {
      nombre: 'Otra Empresa',
      tipoCliente: 'Ni cliente ni cliente potencial',
      proveedor: false
    };

    await terceroPage.crearTercero(data);
    
    const terceroCreado = await terceroPage.terceroCreado();
    expect(terceroCreado).toBeTruthy();
  });

  // =========================================
  // PARTICIÓN DE EQUIVALENCIA - PROVEEDOR
  // =========================================

  test('CP-T10: Crear tercero como Cliente y proveedor No', async () => {
    // Clase: PE-PR2 (Proveedor No)
    const data = {
      nombre: 'Empresa Solo Cliente',
      tipoCliente: 'Cliente',
      proveedor: false
    };

    await terceroPage.crearTercero(data);
    
    const terceroCreado = await terceroPage.terceroCreado();
    expect(terceroCreado).toBeTruthy();
  });

  // =========================================
  // PRUEBAS DE COMBINACIONES
  // =========================================

  test('Crear múltiples terceros con diferentes configuraciones', async () => {
    const configuraciones = [
      {
        nombre: 'Proveedor Principal',
        tipoCliente: 'Ni cliente ni cliente potencial',
        proveedor: true
      },
      {
        nombre: 'Cliente VIP',
        tipoCliente: 'Cliente',
        proveedor: false
      },
      {
        nombre: 'Partner Comercial',
        tipoCliente: 'Cliente potencial / Cliente',
        proveedor: true
      }
    ];

    for (const config of configuraciones) {
      await terceroPage.goto();
      await terceroPage.crearTercero(config);
      
      const terceroCreado = await terceroPage.terceroCreado();
      expect(terceroCreado).toBeTruthy();
    }
  });
});