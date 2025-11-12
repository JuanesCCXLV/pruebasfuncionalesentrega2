const { expect } = require('@playwright/test');

/**
 * Función de login mejorada con múltiples estrategias
 */
async function login(page, username = 'admin', password = 'admin') {
  console.log(`🔐 Intentando login como: ${username}`);
  
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Estrategia 1: Selectores específicos comunes en Dolibarr
  try {
    // Intentar con selectores específicos de Dolibarr
    await page.fill('input#username, input[name="username"], input[placeholder*="user"], input[placeholder*="login"]', username);
    await page.fill('input#password, input[name="password"], input[placeholder*="password"]', password);
    
    // Intentar diferentes botones de submit
    await page.click('input[type="submit"], button[type="submit"], .login__button, .button-login, input[value*="Login"], input[value*="Entrar"]');
    
    await page.waitForTimeout(3000);
    
    // Verificar si el login fue exitoso
    if (await isLoggedIn(page)) {
      console.log('✅ Login exitoso (Estrategia 1)');
      return true;
    }
  } catch (error) {
    console.log('⚠️  Estrategia 1 falló:', error.message);
  }
  
  // Estrategia 2: Buscar cualquier campo de texto y password
  try {
    await page.goto('/');
    
    // Buscar el primer campo de texto (probablemente username)
    const textInputs = await page.$$('input[type="text"], input:not([type])');
    if (textInputs.length > 0) {
      await textInputs[0].fill(username);
    }
    
    // Buscar el primer campo de password
    const passwordInputs = await page.$$('input[type="password"]');
    if (passwordInputs.length > 0) {
      await passwordInputs[0].fill(password);
    }
    
    // Buscar cualquier botón que pueda ser de submit
    const buttons = await page.$$('input[type="submit"], button[type="submit"], button');
    if (buttons.length > 0) {
      await buttons[0].click();
    }
    
    await page.waitForTimeout(3000);
    
    if (await isLoggedIn(page)) {
      console.log('✅ Login exitoso (Estrategia 2)');
      return true;
    }
  } catch (error) {
    console.log('⚠️  Estrategia 2 falló:', error.message);
  }
  
  console.log('❌ Todas las estrategias de login fallaron');
  return false;
}

/**
 * Verificar si el usuario está logueado
 */
async function isLoggedIn(page) {
  // Buscar indicadores de que estamos logueados
  const indicators = [
    '.tabs', '.mainmenu', '#mainmenu', '.menus', 
    '.user', '.logout', 'a[href*="logout"]',
    '.dashboard', '#dashboard'
  ];
  
  for (const indicator of indicators) {
    if (await page.$(indicator)) {
      return true;
    }
  }
  
  // Verificar que no estamos en la página de login
  const loginIndicators = await page.$$('input[type="password"], input[name="password"]');
  if (loginIndicators.length === 0) {
    return true; // Si no hay campos de password, probablemente estamos logueados
  }
  
  return false;
}

module.exports = {
  login,
  isLoggedIn
};