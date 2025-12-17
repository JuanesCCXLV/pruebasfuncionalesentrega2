// tests/quick-debug.spec.js

const { test } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');

test.describe('🔍 Diagnóstico Rápido de Selectores', () => {
  
  test('DEBUG Miembros: Ver estructura del formulario', async ({ page }) => {
    // Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin', 'admin');
    
    // Ir directamente al formulario
    await page.goto('/adherents/card.php?action=create');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\n📍 URL:', page.url());
    
    // Obtener todos los elementos del formulario
    const formInfo = await page.evaluate(() => {
      return {
        selects: Array.from(document.querySelectorAll('select')).map(s => ({
          name: s.name,
          id: s.id,
          options: Array.from(s.options).slice(0, 3).map(o => o.text)
        })),
        radioButtons: Array.from(document.querySelectorAll('input[type="radio"]')).map(r => ({
          name: r.name,
          value: r.value,
          id: r.id,
          checked: r.checked
        })),
        textInputs: Array.from(document.querySelectorAll('input[type="text"]')).map(i => ({
          name: i.name,
          id: i.id,
          placeholder: i.placeholder
        })),
        buttons: Array.from(document.querySelectorAll('input[type="submit"], button[type="submit"]')).map(b => ({
          name: b.name,
          id: b.id,
          value: b.value,
          text: b.textContent
        }))
      };
    });
    
    console.log('\n📋 FORMULARIO DE MIEMBROS');
    console.log('═══════════════════════════════════');
    console.log('\n🔽 Selects:');
    console.log(JSON.stringify(formInfo.selects, null, 2));
    console.log('\n🔘 Radio Buttons:');
    console.log(JSON.stringify(formInfo.radioButtons, null, 2));
    console.log('\n📝 Text Inputs:');
    console.log(JSON.stringify(formInfo.textInputs, null, 2));
    console.log('\n🔵 Botones:');
    console.log(JSON.stringify(formInfo.buttons, null, 2));
    
    await page.screenshot({ path: 'debug-miembros-form.png', fullPage: true });
    console.log('\n✅ Screenshot: debug-miembros-form.png');
  });

  test('DEBUG Terceros: Ver estructura del formulario', async ({ page }) => {
    // Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin', 'admin');
    
    // Ir directamente al formulario
    await page.goto('/societe/card.php?action=create');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\n📍 URL:', page.url());
    
    const formInfo = await page.evaluate(() => {
      return {
        textInputs: Array.from(document.querySelectorAll('input[type="text"]')).map(i => ({
          name: i.name,
          id: i.id,
          placeholder: i.placeholder
        })),
        radioButtons: Array.from(document.querySelectorAll('input[type="radio"]')).map(r => ({
          name: r.name,
          value: r.value,
          id: r.id,
          label: r.parentElement?.textContent?.trim()
        })),
        checkboxes: Array.from(document.querySelectorAll('input[type="checkbox"]')).map(c => ({
          name: c.name,
          value: c.value,
          id: c.id,
          checked: c.checked
        })),
        buttons: Array.from(document.querySelectorAll('input[type="submit"], button[type="submit"]')).map(b => ({
          name: b.name,
          id: b.id,
          value: b.value
        }))
      };
    });
    
    console.log('\n📋 FORMULARIO DE TERCEROS');
    console.log('═══════════════════════════════════');
    console.log('\n📝 Text Inputs:');
    console.log(JSON.stringify(formInfo.textInputs, null, 2));
    console.log('\n🔘 Radio Buttons:');
    console.log(JSON.stringify(formInfo.radioButtons, null, 2));
    console.log('\n☑️  Checkboxes:');
    console.log(JSON.stringify(formInfo.checkboxes, null, 2));
    console.log('\n🔵 Botones:');
    console.log(JSON.stringify(formInfo.buttons, null, 2));
    
    await page.screenshot({ path: 'debug-terceros-form.png', fullPage: true });
    console.log('\n✅ Screenshot: debug-terceros-form.png');
  });

  test('DEBUG Tipo Miembro: Ver estructura del formulario', async ({ page }) => {
    // Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin', 'admin');
    
    // Ir directamente al formulario
    await page.goto('/adherents/type.php?action=edit&rowid=1');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\n📍 URL:', page.url());
    
    const formInfo = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        hasForm: document.querySelectorAll('form').length > 0,
        selects: Array.from(document.querySelectorAll('select')).map(s => ({
          name: s.name,
          id: s.id,
          options: Array.from(s.options).map(o => ({ value: o.value, text: o.text }))
        })),
        radioButtons: Array.from(document.querySelectorAll('input[type="radio"]')).map(r => ({
          name: r.name,
          value: r.value,
          id: r.id
        })),
        textInputs: Array.from(document.querySelectorAll('input[type="text"], input[type="number"]')).map(i => ({
          name: i.name,
          id: i.id,
          type: i.type
        }))
      };
    });
    
    console.log('\n📋 FORMULARIO DE TIPO DE MIEMBRO');
    console.log('═══════════════════════════════════');
    console.log('\n📍 URL:', formInfo.url);
    console.log('📄 Título:', formInfo.title);
    console.log('📋 ¿Tiene formulario?:', formInfo.hasForm);
    console.log('\n🔽 Selects:');
    console.log(JSON.stringify(formInfo.selects, null, 2));
    console.log('\n🔘 Radio Buttons:');
    console.log(JSON.stringify(formInfo.radioButtons, null, 2));
    console.log('\n📝 Text Inputs:');
    console.log(JSON.stringify(formInfo.textInputs, null, 2));
    
    await page.screenshot({ path: 'debug-tipo-miembro-form.png', fullPage: true });
    console.log('\n✅ Screenshot: debug-tipo-miembro-form.png');
  });

  test('DEBUG: Probar creación simple de miembro', async ({ page }) => {
    // Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin', 'admin');
    
    await page.goto('/adherents/card.php?action=create');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\n🧪 Intentando llenar formulario...');
    
    try {
      // Intentar llenar nombre
      const nombreFields = await page.locator('input[name="firstname"], input[name="prenom"]').count();
      console.log(`📝 Campos de nombre encontrados: ${nombreFields}`);
      
      if (nombreFields > 0) {
        await page.locator('input[name="firstname"], input[name="prenom"]').first().fill('Juan');
        console.log('✅ Nombre llenado');
      }
      
      // Intentar llenar apellidos
      const apellidoFields = await page.locator('input[name="lastname"], input[name="nom"]').count();
      console.log(`📝 Campos de apellido encontrados: ${apellidoFields}`);
      
      if (apellidoFields > 0) {
        await page.locator('input[name="lastname"], input[name="nom"]').first().fill('Pérez');
        console.log('✅ Apellido llenado');
      }
      
      await page.screenshot({ path: 'debug-form-filled.png', fullPage: true });
      console.log('\n✅ Screenshot: debug-form-filled.png');
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      await page.screenshot({ path: 'debug-form-error.png', fullPage: true });
    }
  });
});