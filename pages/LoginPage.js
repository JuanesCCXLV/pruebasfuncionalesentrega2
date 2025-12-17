
class LoginPage {
  constructor(page) {
    this.page = page;
    
    // Selectores específicos para Dolibarr 19.0.2
    this.usernameInput = '#username';
    this.passwordInput = '#password';
    this.loginButton = '#login_button'; // Cambia según tu versión
    
    // Alternativas si los anteriores no funcionan
    this.alternativeSelectors = {
      username: [
        '#username',
        'input[name="username"]',
        'input[id="username"]',
        'input.flat[name="username"]'
      ],
      password: [
        '#password',
        'input[name="password"]',
        'input[id="password"]',
        'input[type="password"]'
      ],
      loginButton: [
        '#login_button',
        'input[type="submit"][name="login"]',
        'button[type="submit"][name="login"]',
        'input.button[type="submit"]',
        '.button[type="submit"]',
        'input[value="Connect"]',
        'input[value="Conexión"]'
      ]
    };
    
    // Selectores de resultado
    this.errorMessage = '.error, div.error, .opacitymedium.error';
    this.successIndicator = [
      '.login_block_user',
      '#topmenu-bookmark-dropdown',
      'a.dropdown-toggle.login_block_user',
      '.atoplogin'
    ];
    this.logoutLink = 'a[href*="logout"]';
  }

  /**
   * Navegar a la página de login
   */
  async goto() {
    await this.page.goto('/');
    
    // Esperar a que se cargue completamente
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1500);
    
    // Verificar que estamos en la página de login
    const isLoginPage = await this.page.url().includes('index.php') || 
                        await this.page.locator('form#login').count() > 0;
    
    if (!isLoginPage) {
      console.log('⚠️ No parece ser la página de login');
    }
  }

  /**
   * Encontrar el selector correcto de una lista
   */
  async findWorkingSelector(selectorList) {
    for (const selector of selectorList) {
      try {
        const element = this.page.locator(selector).first();
        const count = await element.count();
        if (count > 0) {
          const isVisible = await element.isVisible();
          if (isVisible) {
            return selector;
          }
        }
      } catch (e) {
        continue;
      }
    }
    return null;
  }

  /**
   * Login principal para Dolibarr 19.0.2
   */
  async login(username, password) {
    try {
      console.log('🔐 Iniciando login en Dolibarr 19.0.2...');
      
      // Buscar selectores que funcionen
      const usernameSelector = await this.findWorkingSelector(this.alternativeSelectors.username);
      const passwordSelector = await this.findWorkingSelector(this.alternativeSelectors.password);
      const buttonSelector = await this.findWorkingSelector(this.alternativeSelectors.loginButton);
      
      if (!usernameSelector || !passwordSelector || !buttonSelector) {
        throw new Error('No se pudieron encontrar los campos del formulario');
      }
      
      console.log(`✅ Selectores encontrados:`);
      console.log(`   Usuario: ${usernameSelector}`);
      console.log(`   Contraseña: ${passwordSelector}`);
      console.log(`   Botón: ${buttonSelector}`);
      
      // Limpiar y llenar usuario
      await this.page.locator(usernameSelector).first().clear();
      await this.page.locator(usernameSelector).first().fill(username);
      await this.page.waitForTimeout(300);
      
      // Limpiar y llenar contraseña
      await this.page.locator(passwordSelector).first().clear();
      await this.page.locator(passwordSelector).first().fill(password);
      await this.page.waitForTimeout(300);
      
      console.log('✅ Credenciales ingresadas');
      
      // Click en el botón de login y esperar navegación
      await Promise.all([
        this.page.waitForNavigation({ 
          waitUntil: 'networkidle',
          timeout: 15000 
        }).catch(() => console.log('⚠️ Timeout en navegación, continuando...')),
        this.page.locator(buttonSelector).first().click()
      ]);
      
      // Esperar estabilidad
      await this.page.waitForTimeout(2000);
      
      console.log(`✅ Login ejecutado. URL actual: ${this.page.url()}`);
      
    } catch (error) {
      console.error('❌ Error en login:', error.message);
      
      // Screenshot de debug
      await this.page.screenshot({ 
        path: `debug-login-error-${Date.now()}.png`,
        fullPage: true 
      });
      
      throw error;
    }
  }

  /**
   * Método alternativo con espera de URL
   */
  async loginWaitingURL(username, password) {
    console.log('🔐 Login con espera de URL...');
    
    // Llenar campos
    await this.page.fill('#username', username);
    await this.page.fill('#password', password);
    
    // Guardar URL inicial
    const initialURL = this.page.url();
    
    // Click
    await this.page.click('input[type="submit"]');
    
    // Esperar a que la URL cambie
    await this.page.waitForFunction(
      (oldURL) => window.location.href !== oldURL,
      initialURL,
      { timeout: 10000 }
    );
    
    await this.page.waitForLoadState('networkidle');
    
    console.log(`✅ URL cambió de ${initialURL} a ${this.page.url()}`);
  }

  /**
   * Verificar si el usuario está logueado
   */
  async isLoggedIn() {
    try {
      // En Dolibarr 19, después de login exitoso aparece el menú superior
      
      // Método 1: Buscar menú de usuario
      for (const selector of this.successIndicator) {
        try {
          const element = this.page.locator(selector).first();
          await element.waitFor({ state: 'visible', timeout: 3000 });
          console.log(`✅ Login exitoso (detectado: ${selector})`);
          return true;
        } catch (e) {
          continue;
        }
      }
      
      // Método 2: Verificar que NO estamos en la página de login
      const currentURL = this.page.url();
      const isNotLoginPage = !currentURL.includes('/index.php?mainmenu=') || 
                             currentURL.includes('/index.php?mainmenu=home');
      
      if (isNotLoginPage && !await this.page.locator('#username').isVisible().catch(() => false)) {
        console.log('✅ Login exitoso (no está en página de login)');
        return true;
      }
      
      // Método 3: Buscar elementos característicos del dashboard
      const hasDashboard = await this.page.locator('.fiche, #id-container').count() > 0;
      if (hasDashboard) {
        console.log('✅ Login exitoso (dashboard detectado)');
        return true;
      }
      
      console.log('❌ Login fallido - no se detectaron indicadores de éxito');
      return false;
      
    } catch (error) {
      console.log('❌ Error verificando login:', error.message);
      return false;
    }
  }

  /**
   * Obtener mensaje de error
   */
  async getErrorMessage() {
    try {
      const errorSelectors = [
        '.error',
        'div.error',
        '.opacitymedium.error',
        '[class*="error"]'
      ];
      
      for (const selector of errorSelectors) {
        const elements = await this.page.locator(selector).all();
        for (const element of elements) {
          const isVisible = await element.isVisible();
          if (isVisible) {
            const text = await element.textContent();
            if (text && text.trim()) {
              return text.trim();
            }
          }
        }
      }
      
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Verificar validación HTML5
   */
  async hasValidationError() {
    return await this.page.evaluate(() => {
      const usernameInput = document.querySelector('#username') || 
                           document.querySelector('input[name="username"]');
      const passwordInput = document.querySelector('#password') || 
                           document.querySelector('input[name="password"]');
      
      const usernameValid = usernameInput ? usernameInput.validity.valid : true;
      const passwordValid = passwordInput ? passwordInput.validity.valid : true;
      
      return !usernameValid || !passwordValid;
    });
  }

  /**
   * Limpiar formulario
   */
  async clearForm() {
    await this.page.fill('#username', '');
    await this.page.fill('#password', '');
  }

  /**
   * Logout
   */
  async logout() {
    if (await this.isLoggedIn()) {
      try {
        // En Dolibarr 19, el logout puede estar en un dropdown
        const logoutSelectors = [
          'a[href*="logout"]',
          'a[href*="logoff"]',
          '#logout',
          '.logout'
        ];
        
        for (const selector of logoutSelectors) {
          try {
            const element = this.page.locator(selector).first();
            const isVisible = await element.isVisible();
            if (isVisible) {
              await element.click();
              await this.page.waitForLoadState('networkidle');
              console.log('✅ Logout exitoso');
              return;
            }
          } catch (e) {
            continue;
          }
        }
        
        console.log('⚠️ No se encontró botón de logout visible');
      } catch (error) {
        console.log('⚠️ Error en logout:', error.message);
      }
    }
  }

  /**
   * Generar string con longitud específica
   */
  generateStringWithLength(length) {
    return 'a'.repeat(length);
  }

  /**
   * Debug: Mostrar info del formulario
   */
  async debugFormInfo() {
    console.log('\n🔍 DEBUG: Información del formulario (Dolibarr 19.0.2)');
    
    const info = await this.page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        forms: Array.from(document.querySelectorAll('form')).map(f => ({
          id: f.id,
          action: f.action,
          method: f.method
        })),
        inputs: Array.from(document.querySelectorAll('input')).map(i => ({
          type: i.type,
          name: i.name,
          id: i.id,
          visible: i.offsetParent !== null
        })),
        buttons: Array.from(document.querySelectorAll('button, input[type="submit"]')).map(b => ({
          type: b.type,
          name: b.name,
          id: b.id,
          value: b.value,
          text: b.textContent
        }))
      };
    });
    
    console.log('URL:', info.url);
    console.log('Título:', info.title);
    console.log('Formularios:', JSON.stringify(info.forms, null, 2));
    console.log('Inputs:', JSON.stringify(info.inputs, null, 2));
    console.log('Botones:', JSON.stringify(info.buttons, null, 2));
    console.log('═══════════════════════════════════\n');
  }
}

module.exports = LoginPage;