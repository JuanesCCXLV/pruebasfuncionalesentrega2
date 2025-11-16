const { expect } = require('@playwright/test');

/**
 * Función de login mejorada con múltiples estrategias
 */
async function login(page, username = 'admin', password = 'admin') {
  console.log(`🔐 Intentando login como: ${username}`);
  
  try {
    // CRÍTICO: Usar timeout y manejo de errores
    await page.goto('/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Esperar con timeout limitado
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      console.log('⚠️  NetworkIdle timeout, continuando...');
    });
    
    // Verificar si ya está logueado
    if (await isLoggedIn(page)) {
      console.log('✅ Ya estaba logueado');
      return true;
    }
    
    console.log('📄 Página cargada, buscando formulario de login...');
    
    // Estrategia 1: Selectores específicos comunes en Dolibarr
    try {
      console.log('🔄 Estrategia 1: Selectores específicos');
      
      // Esperar a que aparezca el campo de username
      await page.waitForSelector(
        'input#username, input[name="username"], input[placeholder*="user"], input[placeholder*="login"]',
        { timeout: 5000 }
      );
      
      // Llenar username
      await page.fill(
        'input#username, input[name="username"], input[placeholder*="user"], input[placeholder*="login"]', 
        username
      );
      console.log('  ✓ Username ingresado');
      
      // Llenar password
      await page.fill(
        'input#password, input[name="password"], input[placeholder*="password"]', 
        password
      );
      console.log('  ✓ Password ingresado');
      
      // Click en botón de submit
      await page.click(
        'input[type="submit"], button[type="submit"], .login__button, .button-login, input[value*="Login"], input[value*="Entrar"]'
      );
      console.log('  ✓ Click en botón login');
      
      // Esperar navegación
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      await page.waitForTimeout(3000);
      
      // Verificar si el login fue exitoso
      if (await isLoggedIn(page)) {
        console.log('✅ Login exitoso (Estrategia 1)');
        return true;
      }
      
      console.log('⚠️  Estrategia 1 no confirmó login');
    } catch (error) {
      console.log('⚠️  Estrategia 1 falló:', error.message);
    }
    
    // Estrategia 2: Buscar cualquier campo de texto y password
    try {
      console.log('🔄 Estrategia 2: Búsqueda genérica');
      
      await page.goto('/', { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      await page.waitForTimeout(1500);
      
      // Buscar el primer campo de texto (probablemente username)
      const textInputs = await page.$$('input[type="text"], input:not([type])');
      if (textInputs.length > 0) {
        await textInputs[0].fill(username);
        console.log('  ✓ Username ingresado (campo texto genérico)');
      } else {
        console.log('  ⚠️  No se encontró campo de texto');
      }
      
      // Buscar el primer campo de password
      const passwordInputs = await page.$$('input[type="password"]');
      if (passwordInputs.length > 0) {
        await passwordInputs[0].fill(password);
        console.log('  ✓ Password ingresado (campo genérico)');
      } else {
        console.log('  ⚠️  No se encontró campo de password');
      }
      
      // Buscar cualquier botón que pueda ser de submit
      const buttons = await page.$$('input[type="submit"], button[type="submit"], button');
      if (buttons.length > 0) {
        await buttons[0].click();
        console.log('  ✓ Click en botón (genérico)');
      } else {
        console.log('  ⚠️  No se encontró botón de submit');
      }
      
      await page.waitForTimeout(3000);
      
      if (await isLoggedIn(page)) {
        console.log('✅ Login exitoso (Estrategia 2)');
        return true;
      }
      
      console.log('⚠️  Estrategia 2 no confirmó login');
    } catch (error) {
      console.log('⚠️  Estrategia 2 falló:', error.message);
    }
    
    // Estrategia 3: Presionar Enter
    try {
      console.log('🔄 Estrategia 3: Enter después de password');
      
      await page.goto('/', { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      await page.waitForTimeout(1500);
      
      const usernameField = page.locator('input[type="text"], input[name="username"]').first();
      const passwordField = page.locator('input[type="password"]').first();
      
      if (await usernameField.count() > 0 && await passwordField.count() > 0) {
        await usernameField.fill(username);
        await passwordField.fill(password);
        await passwordField.press('Enter');
        console.log('  ✓ Enter presionado');
        
        await page.waitForTimeout(3000);
        
        if (await isLoggedIn(page)) {
          console.log('✅ Login exitoso (Estrategia 3)');
          return true;
        }
      }
    } catch (error) {
      console.log('⚠️  Estrategia 3 falló:', error.message);
    }
    
    // Si llegamos aquí, el login falló
    console.log('❌ Todas las estrategias de login fallaron');
    
    // Tomar screenshot para debugging
    try {
      await page.screenshot({ 
        path: `screenshots/login-failed-${Date.now()}.png`,
        fullPage: true 
      });
      console.log('📸 Screenshot guardado en screenshots/');
    } catch (screenshotError) {
      console.log('⚠️  No se pudo guardar screenshot');
    }
    
    // Mostrar información de la página para debugging
    const currentUrl = page.url();
    console.log('🔗 URL actual:', currentUrl);
    
    const title = await page.title().catch(() => 'No title');
    console.log('📄 Título página:', title);
    
    // Verificar si hay mensajes de error en la página
    const errorMessages = await page.locator('.error, .warning, div[class*="error"]').allTextContents().catch(() => []);
    if (errorMessages.length > 0) {
      console.log('⚠️  Mensajes de error en página:', errorMessages);
    }
    
    return false;
    
  } catch (error) {
    console.error('❌ Error crítico durante login:', error.message);
    
    // Intentar screenshot del error
    try {
      await page.screenshot({ 
        path: `screenshots/login-critical-error-${Date.now()}.png`,
        fullPage: true 
      });
    } catch (e) {
      console.log('⚠️  No se pudo guardar screenshot del error crítico');
    }
    
    throw error;
  }
}

/**
 * Verificar si el usuario está logueado
 */
async function isLoggedIn(page) {
  try {
    // Buscar indicadores de que estamos logueados
    const indicators = [
      '.tabs', '.mainmenu', '#mainmenu', '.menus', 
      '.user', '.logout', 'a[href*="logout"]',
      '.dashboard', '#dashboard',
      // Específicos de Dolibarr
      '.tmenu', '#tmenu',
      'div.login_block',
      'img[alt*="Dolibarr"]',
      'a.login',
      '#topmenu',
      'div#id-container'
    ];
    
    for (const indicator of indicators) {
      const element = await page.$(indicator);
      if (element) {
        console.log(`  ✓ Indicador encontrado: ${indicator}`);
        return true;
      }
    }
    
    // Verificar que no estamos en la página de login
    const loginIndicators = await page.$$('input[type="password"], input[name="password"]');
    if (loginIndicators.length === 0) {
      console.log('  ✓ No hay campos de password visible');
      return true;
    }
    
    // Verificar URL
    const currentUrl = page.url();
    if (currentUrl && !currentUrl.includes('index.php') && currentUrl.includes('8080')) {
      // Si no estamos en index.php y estamos en el servidor correcto, probablemente logueados
      const hasPasswordField = await page.locator('input[type="password"]').count() > 0;
      if (!hasPasswordField) {
        console.log('  ✓ URL indica login exitoso');
        return true;
      }
    }
    
    console.log('  ✗ No se encontraron indicadores de login');
    return false;
    
  } catch (error) {
    console.log('  ⚠️  Error verificando login:', error.message);
    return false;
  }
}

/**
 * Función de logout
 */
async function logout(page) {
  try {
    const logoutSelectors = [
      'a[href*="logout"]',
      'a.logout',
      'a[title*="Logout"]',
      'a[title*="Déconnexion"]'
    ];
    
    for (const selector of logoutSelectors) {
      const element = await page.$(selector);
      if (element) {
        await element.click();
        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
        console.log('🚪 Logout exitoso');
        return true;
      }
    }
    
    console.log('⚠️  No se encontró botón de logout');
    return false;
  } catch (error) {
    console.warn('⚠️  Error durante logout:', error.message);
    return false;
  }
}

/**
 * Esperar elemento visible
 */
async function waitForElement(page, selector, timeout = 10000) {
  try {
    await page.locator(selector).first().waitFor({ 
      state: 'visible', 
      timeout 
    });
    return true;
  } catch (error) {
    console.log(`⚠️  Timeout esperando: ${selector}`);
    return false;
  }
}

/**
 * Verificar mensajes
 */
async function hasSuccessMessage(page) {
  const count = await page.locator('.ok, div.ok, .success, .mesgs, div[class*="success"]').count();
  return count > 0;
}

async function hasErrorMessage(page) {
  const count = await page.locator('.error, div.error, .warning, div[class*="error"]').count();
  return count > 0;
}

module.exports = {
  login,
  isLoggedIn,
  logout,
  waitForElement,
  hasSuccessMessage,
  hasErrorMessage
};