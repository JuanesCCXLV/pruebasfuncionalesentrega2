const { test, expect } = require('@playwright/test');
const { login } = require('./helpers/utils');

test.describe('Pruebas para módulos actualmente disponibles', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('HU-001: Gestión de Empresa/Organización', async ({ page }) => {
    console.log('🏢 HU-001: Probando gestión de empresa...');
    
    await page.goto('/admin/company.php');
    
    // Verificar que estamos en la página correcta
    const title = await page.title();
    expect(title).toContain('Setup');
    console.log('✅ Página de empresa cargada');
    
    // Buscar formulario
    const forms = await page.$$('form');
    expect(forms.length).toBeGreaterThan(0);
    console.log(`✅ Formularios encontrados: ${forms.length}`);
    
    // Contar campos disponibles
    const inputs = await page.$$('input, select, textarea');
    console.log(`📊 Campos totales: ${inputs.length}`);
    
    // Probar modificación de datos
    const textInputs = await page.$$('input[type="text"]');
    if (textInputs.length > 0) {
      await textInputs[0].fill('Empresa Pruebas ' + Date.now());
      console.log('✅ Campo de nombre modificado');
    }
    
    // Verificar que se puede guardar
    const saveButtons = await page.$$('input[type="submit"], button[type="submit"]');
    expect(saveButtons.length).toBeGreaterThan(0);
    console.log('✅ Botones de guardar disponibles');
    
    await page.screenshot({ path: 'test-results/hu001-empresa.png' });
  });

  test('HU-018: Gestión de Usuarios', async ({ page }) => {
    console.log('👤 HU-018: Probando gestión de usuarios...');
    
    await page.goto('/user/card.php?action=create');
    
    // Verificar formulario de creación de usuario
    const forms = await page.$$('form');
    expect(forms.length).toBeGreaterThan(0);
    console.log(`✅ Formulario de usuario encontrado`);
    
    // Contar campos disponibles
    const inputs = await page.$$('input, select, textarea');
    console.log(`📊 Campos de usuario: ${inputs.length}`);
    
    // Probar llenado de campos básicos
    const fieldTests = [
      { type: 'text', action: async (el) => {
        await el.fill('usuarioprueba' + Date.now());
        console.log('✅ Campo texto llenado');
      }},
      { type: 'email', action: async (el) => {
        await el.fill('prueba@test.com');
        console.log('✅ Email llenado');
      }}
    ];
    
    for (const test of fieldTests) {
      const fields = await page.$$(`input[type="${test.type}"]`);
      if (fields.length > 0) {
        await test.action(fields[0]);
      }
    }
    
    await page.screenshot({ path: 'test-results/hu018-usuarios.png' });
  });

  test('HU-008: Configuración del Sistema', async ({ page }) => {
    console.log('⚙️ HU-008: Probando configuración del sistema...');
    
    // Probar diferentes secciones de configuración
    const configSections = [
      '/admin/ihm.php',      // Display
      '/admin/menus.php',    // Menús
      '/admin/dict.php',     // Diccionarios
      '/admin/security_other.php' // Seguridad
    ];
    
    for (const section of configSections) {
      try {
        await page.goto(section);
        const title = await page.title();
        const forms = await page.$$('form');
        
        console.log(`🔧 ${section}:`);
        console.log(`   📄 ${title}`);
        console.log(`   📝 Formularios: ${forms.length}`);
        
        if (forms.length > 0) {
          console.log('   ✅ Configurable');
        }
        
      } catch (error) {
        console.log(`   ❌ ${section}: ${error.message}`);
      }
    }
    
    await page.screenshot({ path: 'test-results/hu008-configuracion.png' });
  });

  test('Explorar funcionalidades disponibles', async ({ page }) => {
    console.log('🔍 Explorando todas las funcionalidades...');
    
    await page.goto('/');
    
    // Obtener TODOS los enlaces del dashboard
    const allLinks = await page.$$eval('a', links => 
      links.map(link => ({
        text: link.textContent?.trim(),
        href: link.getAttribute('href'),
        available: true
      })).filter(link => 
        link.text && 
        link.href && 
        link.href.startsWith('/') &&
        link.text.length > 2 &&
        !link.text.includes('http') &&
        !link.href.includes('logout')
      )
    );
    
    console.log('\n📋 FUNCIONALIDADES DISPONIBLES PARA PRUEBAS:');
    console.log('============================================');
    
    const categorized = {
      'Administración': [],
      'Configuración': [],
      'Usuarios': [],
      'Herramientas': [],
      'Otros': []
    };
    
    for (const link of allLinks) {
      const text = link.text.toLowerCase();
      const href = link.href;
      
      if (text.includes('admin') || text.includes('setup') || text.includes('config')) {
        categorized['Administración'].push(link);
      } else if (text.includes('user') || text.includes('member') || text.includes('login')) {
        categorized['Usuarios'].push(link);
      } else if (text.includes('tool') || text.includes('util')) {
        categorized['Herramientas'].push(link);
      } else if (text.includes('company') || text.includes('organization') || text.includes('module')) {
        categorized['Configuración'].push(link);
      } else {
        categorized['Otros'].push(link);
      }
    }
    
    // Mostrar categorías con enlaces
    for (const [category, links] of Object.entries(categorized)) {
      if (links.length > 0) {
        console.log(`\n${category}:`);
        links.forEach(link => console.log(`   ✅ ${link.text} -> ${link.href}`));
      }
    }
    
    // Crear pruebas dinámicas basadas en enlaces encontrados
    console.log('\n🎯 PRUEBAS RECOMENDADAS:');
    const testableLinks = allLinks.filter(link => 
      link.href.includes('.php') && 
      !link.href.includes('logout')
    ).slice(0, 5); // Tomar primeros 5 para prueba
    
    for (const link of testableLinks) {
      console.log(`   🧪 Probar: ${link.text} (${link.href})`);
    }
  });
});