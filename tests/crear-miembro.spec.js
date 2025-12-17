
const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const MiembroPage = require('../pages/MiembroPage');

test.describe('RF-M: Funcionalidad de Crear Miembro', () => {
  let loginPage;
  let miembroPage;

  test.beforeEach(async ({ page }) => {
    // Login previo
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.ADMIN_USER, process.env.ADMIN_PASSWORD);
    
    // Navegar a crear miembro
    miembroPage = new MiembroPage(page);
    await miembroPage.goto();
  });

  test.afterEach(async ({ page }) => {
    await loginPage.logout();
  });

  // =========================================
  // PARTICIÓN DE EQUIVALENCIA - MIEMBRO INDIVIDUAL
  // =========================================

  test('CP-MI-01: Crear miembro individual con datos válidos', async () => {
    // Clase: PE-NAT1 (Individual), PE-NOM1 (Nombre válido), PE-APE1 (Apellidos válidos)
    const data = {
      tipo: 'Activo', // Ajustar según tipos disponibles en tu sistema
      nombre: 'Juan',
      apellidos: 'Pérez García'
    };

    await miembroPage.crearMiembroIndividual(data);
    
    const miembroCreado = await miembroPage.miembroCreado();
    expect(miembroCreado).toBeTruthy();
  });

  test('CP-MI-02: Error al crear miembro individual con nombre vacío', async () => {
    // Clase: PE-NOM2 (Nombre vacío)
    const data = {
      tipo: 'Activo',
      nombre: '', // Campo vacío
      apellidos: 'Pérez García'
    };

    await miembroPage.crearMiembroIndividual(data);
    
    const hasError = await miembroPage.hasValidationError();
    expect(hasError).toBeTruthy();
    
    const errorMessage = await miembroPage.getErrorMessage();
    expect(errorMessage).toContain('nombre'); // Ajustar según mensaje real
  });

  test('CP-MI-03: Error al crear miembro individual con apellidos vacíos', async () => {
    // Clase: PE-APE2 (Apellidos vacíos)
    const data = {
      tipo: 'Activo',
      nombre: 'Juan',
      apellidos: '' // Campo vacío
    };

    await miembroPage.crearMiembroIndividual(data);
    
    const hasError = await miembroPage.hasValidationError();
    expect(hasError).toBeTruthy();
  });

  // =========================================
  // PARTICIÓN DE EQUIVALENCIA - MIEMBRO CORPORATIVO
  // =========================================

  test('CP-MC-01: Crear miembro corporativo con datos válidos', async () => {
    // Clase: PE-NAT2 (Corporación), PE-EMP1 (Empresa válida)
    const data = {
      tipo: 'Activo',
      empresa: 'Tech Solutions S.A.S.'
    };

    await miembroPage.crearMiembroCorporacion(data);
    
    const miembroCreado = await miembroPage.miembroCreado();
    expect(miembroCreado).toBeTruthy();
  });

  test('CP-MC-02: Error al crear miembro corporativo con empresa vacía', async () => {
    // Clase: PE-EMP2 (Empresa vacía)
    const data = {
      tipo: 'Activo',
      empresa: '' // Campo vacío
    };

    await miembroPage.crearMiembroCorporacion(data);
    
    const hasError = await miembroPage.hasValidationError();
    expect(hasError).toBeTruthy();
    
    const errorMessage = await miembroPage.getErrorMessage();
    expect(errorMessage).toBeTruthy();
  });

  // =========================================
  // PRUEBAS ADICIONALES - VALIDACIÓN DE CAMPOS
  // =========================================

  test('Validar visibilidad de campos según naturaleza - Individual', async ({ page }) => {
    await miembroPage.seleccionarNaturaleza('Individual');
    
    const nombreVisible = await miembroPage.isNombreVisible();
    const apellidosVisible = await miembroPage.isApellidosVisible();
    
    expect(nombreVisible).toBeTruthy();
    expect(apellidosVisible).toBeTruthy();
  });

  test('Validar visibilidad de campos según naturaleza - Corporación', async ({ page }) => {
    await miembroPage.seleccionarNaturaleza('Corporación');
    
    const empresaVisible = await miembroPage.isEmpresaVisible();
    expect(empresaVisible).toBeTruthy();
  });

  // =========================================
  // PRUEBAS DE FLUJO COMPLETO
  // =========================================

  test('Flujo completo: Crear múltiples tipos de miembros', async () => {
    // Crear miembro individual
    const dataIndividual = {
      tipo: 'Activo',
      nombre: 'María',
      apellidos: 'González López'
    };
    await miembroPage.crearMiembroIndividual(dataIndividual);
    expect(await miembroPage.miembroCreado()).toBeTruthy();

    // Volver a formulario de creación
    await miembroPage.goto();

    // Crear miembro corporativo
    const dataCorporacion = {
      tipo: 'Activo',
      empresa: 'Innovación Digital Ltda.'
    };
    await miembroPage.crearMiembroCorporacion(dataCorporacion);
    expect(await miembroPage.miembroCreado()).toBeTruthy();
  });
});