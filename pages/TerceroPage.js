// pages/TerceroPage.js

class TerceroPage {
  constructor(page) {
    this.page = page;
    
    // Selectores para navegación (Dolibarr 19)
    this.thirdPartiesMenu = [
      'a[href*="societe/index.php"]',
      'a[href*="mainmenu=companies"]',
      'a[href*="societe/list.php"]',
      'div#mainmenutd_companies a'
    ];
    this.newThirdPartyButton = [
      'a[href*="card.php?action=create"]',
      'a.butAction:has-text("New third party")',
      'a.butAction:has-text("Nuevo")',
      'span.fa-plus-circle'
    ];
    
    // Selectores del formulario
    this.nombreInput = 'input[name="name"]';
    this.clientePotencialCheckbox = 'input[name="client"][value="2"]';
    this.clienteCheckbox = 'input[name="client"][value="1"]';
    this.clienteNoCheckbox = 'input[name="client"][value="0"]';
    this.proveedorSiCheckbox = 'input[name="fournisseur"][value="1"]';
    this.proveedorNoCheckbox = 'input[name="fournisseur"][value="0"]';
    this.submitButton = [
      'input[type="submit"][name="create"]',
      'input.button[value*="Create"]',
      'input.button[value*="Crear"]'
    ];
    
    // Selectores de validación
    this.successMessage = '.ok, div.ok, .mesgs';
    this.errorMessage = '.error, div.error';
    this.validationError = '.error, .warning, .fieldrequired';
  }

  /**
   * Navegar a la página de crear tercero
   */
  async goto() {
    console.log('🔄 Navegando al módulo de Third Parties...');
    
    // Método 1: Click en el menú Third Parties
    try {
      const thirdPartiesSelectors = [
        'a[href*="societe/index.php"]',
        'a.tmenuimage[title*="Third"]',
        'a.tmenuimage[title*="Companies"]',
        'div#mainmenutd_companies a',
        'a[href*="mainmenu=companies"]'
      ];
      
      let clicked = false;
      for (const selector of thirdPartiesSelectors) {
        try {
          const element = this.page.locator(selector).first();
          const isVisible = await element.isVisible({ timeout: 2000 });
          if (isVisible) {
            await element.click();
            console.log(`✅ Click en menú Third Parties con: ${selector}`);
            clicked = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!clicked) {
        console.log('⚠️ No se encontró el menú, navegando por URL...');
        await this.page.goto('/societe/index.php?mainmenu=companies&leftmenu=');
      }
      
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(1000);
      
      console.log(`📍 URL actual: ${this.page.url()}`);
      
    } catch (error) {
      console.error('❌ Error navegando a Third Parties:', error.message);
    }
    
    // Hacer clic en "New third party"
    try {
      const newButtonSelectors = [
        'a[href*="card.php?action=create"]',
        'a.butAction:has-text("New third party")',
        'a.butAction:has-text("Nuevo tercero")',
        'a:has-text("New third party")',
        'span.fa-plus-circle'
      ];
      
      for (const selector of newButtonSelectors) {
        try {
          const element = this.page.locator(selector).first();
          const isVisible = await element.isVisible({ timeout: 3000 });
          if (isVisible) {
            await element.click();
            console.log(`✅ Click en New Third Party con: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(1000);
      
      console.log(`📍 URL formulario: ${this.page.url()}`);
      
    } catch (error) {
      console.error('❌ Error al abrir formulario de tercero:', error.message);
      
      // Si falla, intentar navegación directa
      console.log('⚠️ Intentando navegación directa...');
      await this.page.goto('/societe/card.php?action=create&mainmenu=companies&leftmenu=');
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Crear tercero con configuración completa
   * @param {Object} data - Datos del tercero
   */
  async crearTercero(data) {
    // Llenar nombre
    if (data.nombre !== undefined) {
      await this.page.fill(this.nombreInput, data.nombre);
    }

    // Configurar tipo de cliente
    if (data.tipoCliente) {
      await this.seleccionarTipoCliente(data.tipoCliente);
    }

    // Configurar proveedor
    if (data.proveedor !== undefined) {
      await this.seleccionarProveedor(data.proveedor);
    }

    await this.page.click(this.submitButton);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Seleccionar tipo de cliente
   * @param {string} tipo - 'Cliente potencial', 'Cliente', 'Cliente potencial / Cliente', o 'Ni cliente ni cliente potencial'
   */
  async seleccionarTipoCliente(tipo) {
    switch(tipo) {
      case 'Cliente potencial':
        await this.page.check(this.clientePotencialCheckbox);
        break;
      case 'Cliente':
        await this.page.check(this.clienteCheckbox);
        break;
      case 'Cliente potencial / Cliente':
        // En algunos sistemas puede ser un checkbox combinado o múltiple
        // Ajustar según la implementación real de Dolibarr
        await this.page.check(this.clientePotencialCheckbox);
        // O usar un valor específico si existe
        break;
      case 'Ni cliente ni cliente potencial':
        await this.page.check(this.clienteNoCheckbox);
        break;
    }
  }

  /**
   * Seleccionar si es proveedor
   * @param {boolean} esProveedor - true o false
   */
  async seleccionarProveedor(esProveedor) {
    if (esProveedor) {
      await this.page.check(this.proveedorSiCheckbox);
    } else {
      await this.page.check(this.proveedorNoCheckbox);
    }
  }

  /**
   * Verificar si el tercero fue creado exitosamente
   */
  async terceroCreado() {
    try {
      await this.page.waitForSelector(this.successMessage, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtener mensaje de error
   */
  async getErrorMessage() {
    try {
      const errorElement = await this.page.locator(this.errorMessage).first();
      return await errorElement.textContent();
    } catch {
      return null;
    }
  }

  /**
   * Verificar si hay error de validación
   */
  async hasValidationError() {
    try {
      await this.page.waitForSelector(this.validationError, { timeout: 3000 });
      return true;
    } catch {
      // También verificar validación HTML5
      const isValid = await this.page.evaluate(() => {
        const input = document.querySelector('input[name="name"]');
        return input ? input.validity.valid : true;
      });
      return !isValid;
    }
  }

  /**
   * Obtener longitud máxima del campo nombre
   */
  async getNombreMaxLength() {
    return await this.page.getAttribute(this.nombreInput, 'maxlength');
  }

  /**
   * Generar string con longitud específica
   */
  generateStringWithLength(length) {
    return 'A'.repeat(length);
  }

  /**
   * Limpiar formulario
   */
  async clearForm() {
    await this.page.fill(this.nombreInput, '');
  }
}

module.exports = TerceroPage;