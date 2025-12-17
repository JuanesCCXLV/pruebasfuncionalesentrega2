
const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const MiembroPage = require('../pages/MiembroPage');
const TerceroPage = require('../pages/TerceroPage');

test.describe('Navegación en Dolibarr 19.0.2', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    // Login previo
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin', 'admin');
    
    // Verificar login exitoso
    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).toBeTruthy();
    
    console.log('✅ Login exitoso');
  });

  test.afterEach(async () => {
    await loginPage.logout();
  });

  // ==========================================
  // NAVEGACIÓN A MEMBERS
  // ==========================================

  test('NAV-01: Navegar al módulo de Members', async ({ page }) => {
    const miembroPage = new MiembroPage(page);
    
    console.log('\n🔄 Iniciando navegación a Members...');
    
    // Tomar screenshot del estado inicial
    await page.screenshot({ path: 'nav-members-01-inicio.png', fullPage: true });
    
    await miembroPage.goto();
    
    // Tomar screenshot después de navegar
    await page.screenshot({ path: 'nav-members-02-formulario.png', fullPage: true });
    
    // Verificar que estamos en la página correcta
    const url = page.url();
    console.log('📍 URL actual:', url);
    
    expect(url).toContain('adherents');
    expect(url).toContain('action=create');
  });

  test('NAV-02: Navegar por URL directa a Members', async ({ page }) => {
    console.log('\n🔄 Navegando por URL directa...');
    
    await page.goto('/adherents/card.php?action=create&mainmenu=members');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'nav-members-direct.png', fullPage: true });
    
    const url = page.url();
    console.log('📍 URL:', url);
    
    // Verificar que el formulario está presente
    const hasForm = await page.locator('form').count() > 0;
    console.log('🔍 ¿Tiene formulario?:', hasForm);
    
    expect(hasForm).toBeTruthy();
  });

  // ==========================================
  // NAVEGACIÓN A THIRD PARTIES
  // ==========================================

  test('NAV-03: Navegar al módulo de Third Parties', async ({ page }) => {
    const terceroPage = new TerceroPage(page);
    
    console.log('\n🔄 Iniciando navegación a Third Parties...');
    
    await page.screenshot({ path: 'nav-tercero-01-inicio.png', fullPage: true });
    
    await terceroPage.goto();
    
    await page.screenshot({ path: 'nav-tercero-02-formulario.png', fullPage: true });
    
    const url = page.url();
    console.log('📍 URL actual:', url);
    
    expect(url).toContain('societe');
    expect(url).toContain('action=create');
  });

  test('NAV-04: Navegar por URL directa a Third Parties', async ({ page }) => {
    console.log('\n🔄 Navegando por URL directa...');
    
    await page.goto('/societe/card.php?action=create&mainmenu=companies');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'nav-tercero-direct.png', fullPage: true });
    
    const url = page.url();
    console.log('📍 URL:', url);
    
    const hasForm = await page.locator('form').count() > 0;
    console.log('🔍 ¿Tiene formulario?:', hasForm);
    
    expect(hasForm).toBeTruthy();
  });

  // ==========================================
  // DIAGNÓSTICO DE MENÚS
  // ==========================================

  test('DEBUG: Mostrar todos los menús disponibles', async ({ page }) => {
    console.log('\n🔍 DEBUG: Analizando menús del sistema...');
    
    const menuInfo = await page.evaluate(() => {
      const menus = [];
      
      // Buscar todos los enlaces en el menú superior
      const topMenuLinks = document.querySelectorAll('a.tmenuimage, div[id*="mainmenu"] a');
      
      topMenuLinks.forEach(link => {
        menus.push({
          href: link.href,
          title: link.title,
          text: link.textContent.trim(),
          id: link.id,
          visible: link.offsetParent !== null
        });
      });
      
      return menus;
    });
    
    console.log('\n📋 Menús encontrados:');
    menuInfo.forEach((menu, index) => {
      if (menu.visible) {
        console.log(`${index + 1}. ${menu.title || menu.text}`);
        console.log(`   URL: ${menu.href}`);
        console.log(`   ID: ${menu.id}`);
        console.log('');
      }
    });
    
    await page.screenshot({ path: 'debug-menus.png', fullPage: true });
  });

  test('DEBUG: Buscar botones de "New" en Members', async ({ page }) => {
    // Navegar a Members manualmente
    await page.goto('/adherents/index.php?mainmenu=members');
    await page.waitForLoadState('networkidle');
    
    console.log('\n🔍 Buscando botones de creación...');
    
    const buttons = await page.evaluate(() => {
      const btns = [];
      
      // Buscar todos los botones y enlaces que puedan ser "New"
      const elements = document.querySelectorAll('a.butAction, a.button, a:has(span.fa-plus-circle)');
      
      elements.forEach(el => {
        btns.push({
          href: el.href,
          text: el.textContent.trim(),
          class: el.className,
          visible: el.offsetParent !== null
        });
      });
      
      return btns;
    });
    
    console.log('\n📋 Botones encontrados:');
    buttons.forEach((btn, index) => {
      console.log(`${index + 1}. Texto: "${btn.text}"`);
      console.log(`   URL: ${btn.href}`);
      console.log(`   Visible: ${btn.visible}`);
      console.log('');
    });
    
    await page.screenshot({ path: 'debug-members-buttons.png', fullPage: true });
  });
});