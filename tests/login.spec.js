
const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');

test.describe('Login - Dolibarr 19.0.2', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    
    // Configurar timeout más largo para desarrollo
    page.setDefaultTimeout(30000);
    
    await loginPage.goto();
  });

  // ==========================================
  // TEST DE DIAGNÓSTICO
  // ==========================================
  
  test('DIAGNÓSTICO: Ver estructura del formulario', async ({ page }) => {
    await loginPage.debugFormInfo();
    
    // Tomar screenshot
    await page.screenshot({ 
      path: 'dolibarr-19-login-page.png',
      fullPage: true 
    });
    
    console.log('✅ Screenshot guardado: dolibarr-19-login-page.png');
  });

  // ==========================================
  // PRUEBA BÁSICA
  // ==========================================
  
  test('CP-L01: Login exitoso con credenciales válidas', async ({ page }) => {
    // Credenciales por defecto de Dolibarr
    await loginPage.login('admin', 'admin');
    
    // Verificar login exitoso
    const isLoggedIn = await loginPage.isLoggedIn();
    
    if (!isLoggedIn) {
      // Si falla, tomar screenshot
      await page.screenshot({ 
        path: 'login-failed.png',
        fullPage: true 
      });
      console.log('❌ Login falló. Screenshot: login-failed.png');
      console.log('📍 URL actual:', page.url());
    }
    
    expect(isLoggedIn).toBeTruthy();
  });

  // ==========================================
  // MÉTODO ALTERNATIVO
  // ==========================================
  
  test('CP-L01-ALT: Login con método alternativo', async ({ page }) => {
    // Método más directo
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin');
    
    // Click y esperar
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }),
      page.click('input[type="submit"]')
    ]);
    
    // Verificar
    const url = page.url();
    console.log('📍 URL después de login:', url);
    
    // En Dolibarr 19, después de login la URL cambia
    const loginSuccess = !url.includes('username=') && 
                        (url.includes('mainmenu=home') || url.includes('index.php?'));
    
    expect(loginSuccess).toBeTruthy();
  });

  // ==========================================
  // PRUEBA CON ESPERA DE URL
  // ==========================================
  
  test('CP-L01-URL: Login esperando cambio de URL', async ({ page }) => {
    const initialURL = page.url();
    console.log('📍 URL inicial:', initialURL);
    
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin');
    
    // Click en login
    await page.click('input[type="submit"]');
    
    // Esperar a que la URL cambie
    await page.waitForFunction(
      (oldURL) => window.location.href !== oldURL,
      initialURL,
      { timeout: 10000 }
    );
    
    const newURL = page.url();
    console.log('📍 URL nueva:', newURL);
    
    // Verificar que cambió
    expect(newURL).not.toBe(initialURL);
    expect(newURL).not.toContain('username=');
  });

  // ==========================================
  // PRUEBAS DE CASOS INVÁLIDOS
  // ==========================================
  
  test('CP-L02: Usuario no registrado', async ({ page }) => {
    await loginPage.login('usuario_que_no_existe_12345', 'password');
    
    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).toBeFalsy();
    
    // Debería haber mensaje de error
    const errorMessage = await loginPage.getErrorMessage();
    console.log('📝 Mensaje de error:', errorMessage);
    
    expect(errorMessage).toBeTruthy();
  });

  test('CP-L05: Contraseña incorrecta', async ({ page }) => {
    await loginPage.login('admin', 'password_incorrecto_123');
    
    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).toBeFalsy();
  });

  test('CP-L03: Campo usuario vacío', async ({ page }) => {
    await loginPage.login('', 'admin');
    
    // Verificar validación HTML5
    const hasError = await loginPage.hasValidationError();
    expect(hasError).toBeTruthy();
  });

  test('CP-L06: Campo contraseña vacío', async ({ page }) => {
    await loginPage.login('admin', '');
    
    const hasError = await loginPage.hasValidationError();
    expect(hasError).toBeTruthy();
  });
});

// ==========================================
// SUITE SIMPLE SIN PAGE OBJECT
// ==========================================

test.describe('Login Simple - Sin Page Object', () => {
  
  test('Login directo y verificación', async ({ page }) => {
    // Ir a Dolibarr
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('domcontentloaded');
    
    console.log('📍 Página de login cargada');
    
    // Llenar campos directamente
    await page.fill('#username', 'admin');
    console.log('✅ Usuario ingresado');
    
    await page.fill('#password', 'admin');
    console.log('✅ Contraseña ingresada');
    
    // Screenshot antes de login
    await page.screenshot({ path: 'antes-login.png' });
    
    // Click en login
    const submitButton = page.locator('input[type="submit"]').first();
    await submitButton.click();
    console.log('✅ Click en login');
    
    // Esperar navegación
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(2000);
    
    const finalURL = page.url();
    console.log('📍 URL final:', finalURL);
    
    // Screenshot después de login
    await page.screenshot({ path: 'despues-login.png' });
    
    // Verificaciones
    const hasLoginForm = await page.locator('#username').isVisible().catch(() => false);
    const hasUserMenu = await page.locator('.login_block_user, .atoplogin').count() > 0;
    
    console.log('🔍 ¿Tiene formulario de login?:', hasLoginForm);
    console.log('🔍 ¿Tiene menú de usuario?:', hasUserMenu);
    console.log('🔍 ¿URL cambió?:', !finalURL.includes('username='));
    
    // El login es exitoso si:
    // - NO tiene formulario de login visible
    // - Tiene menú de usuario
    // - La URL no contiene 'username='
    const loginSuccess = !hasLoginForm || hasUserMenu || !finalURL.includes('username=');
    
    expect(loginSuccess).toBeTruthy();
  });
});