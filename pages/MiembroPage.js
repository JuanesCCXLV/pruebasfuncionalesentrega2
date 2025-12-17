// pages/MiembroPage.js

class MiembroPage {
  constructor(page) {
    this.page = page;
    
    // Selectores para navegación (Dolibarr 19)
    this.membersMenu = [
      'a[href*="adherents/index.php"]',
      'a[href*="mainmenu=members"]',
      'div#mainmenutd_members a'
    ];
    this.newMemberButton = [
      'a[href*="card.php?action=create"]',
      'a.butAction:has-text("New member")',
      'a:has-text("New member")'
    ];
    
    // Selectores del formulario (Dolibarr 19)
    this.tipoSelect = 'select[name="typeid"]';
    this.naturalezaIndividual = 'input[name="morphy"][value="phy"]';
    this.naturalezaCorporacion = 'input[name="morphy"][value="mor"]';
    this.nombreInput = 'input[name="firstname"]';
    this.apellidosInput = 'input[name="lastname"]';
    this.empresaInput = 'input[name="company"]';
    this.submitButton = [
      'input[type="submit"][name="add"]',
      'input.button[value*="Create"]',
      'input.button[value*="Crear"]'
    ];
    
    // Selectores de validación
    this.successMessage = '.ok, div.ok, .mesgs';
    this.errorMessage = '.error, div.error, .warning';
    this.validationError = '.error, .warning, .fieldrequired';
  }

  /**
   * Navegar a la página de crear miembro
   */
  async goto() {
    console.log('🔄 Navegando al módulo de Members...');
    
    // Método 1: Click en el menú Members (Mem)
    try {
      // En Dolibarr 19, el menú superior tiene íconos
      const membersMenuSelectors = [
        'a[href*="adherents/index.php"]',
        'a.tmenuimage[title*="Member"]',
        'a.tmenuimage[title*="Mem"]',
        'div#mainmenutd_members a',
        'a[href*="mainmenu=members"]'
      ];
      
      let clicked = false;
      for (const selector of membersMenuSelectors) {
        try {
          const element = this.page.locator(selector).first();
          const isVisible = await element.isVisible({ timeout: 2000 });
          if (isVisible) {
            await element.click();
            console.log(`✅ Click en menú Members con: ${selector}`);
            clicked = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!clicked) {
        // Método alternativo: Navegar directamente por URL
        console.log('⚠️ No se encontró el menú, navegando por URL...');
        await this.page.goto('/adherents/index.php?mainmenu=members&leftmenu=');
      }
      
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(1000);
      
      console.log(`📍 URL actual: ${this.page.url()}`);
      
    } catch (error) {
      console.error('❌ Error navegando a Members:', error.message);
    }
    
    // Hacer clic en "New member"
    try {
      const newMemberSelectors = [
        'a[href*="card.php?action=create"]',
        'a.butAction:has-text("New member")',
        'a.butAction:has-text("Nuevo")',
        'a:has-text("New member")',
        'span.fa-plus-circle'
      ];
      
      for (const selector of newMemberSelectors) {
        try {
          const element = this.page.locator(selector).first();
          const isVisible = await element.isVisible({ timeout: 3000 });
          if (isVisible) {
            await element.click();
            console.log(`✅ Click en New Member con: ${selector}`);
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
      console.error('❌ Error al abrir formulario de nuevo miembro:', error.message);
      
      // Si falla, intentar navegación directa
      console.log('⚠️ Intentando navegación directa...');
      await this.page.goto('/adherents/card.php?action=create&mainmenu=members&leftmenu=');
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Seleccionar tipo de miembro
   * @param {string} tipo - Nombre del tipo de miembro
   */
  async seleccionarTipo(tipo) {
    await this.page.selectOption(this.tipoSelect, { label: tipo });
  }

  /**
   * Seleccionar naturaleza del miembro
   * @param {string} naturaleza - 'Individual' o 'Corporación'
   */
  async seleccionarNaturaleza(naturaleza) {
    if (naturaleza === 'Individual') {
      await this.page.check(this.naturalezaIndividual);
    } else if (naturaleza === 'Corporación') {
      await this.page.check(this.naturalezaCorporacion);
    }
    // Esperar a que se actualice el formulario
    await this.page.waitForTimeout(500);
  }

  /**
   * Crear miembro individual
   * @param {Object} data - Datos del miembro
   */
  async crearMiembroIndividual(data) {
    if (data.tipo) {
      await this.seleccionarTipo(data.tipo);
    }
    
    await this.seleccionarNaturaleza('Individual');
    
    if (data.nombre !== undefined) {
      await this.page.fill(this.nombreInput, data.nombre);
    }
    
    if (data.apellidos !== undefined) {
      await this.page.fill(this.apellidosInput, data.apellidos);
    }
    
    await this.page.click(this.submitButton);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Crear miembro corporativo
   * @param {Object} data - Datos del miembro
   */
  async crearMiembroCorporacion(data) {
    if (data.tipo) {
      await this.seleccionarTipo(data.tipo);
    }
    
    await this.seleccionarNaturaleza('Corporación');
    
    if (data.empresa !== undefined) {
      await this.page.fill(this.empresaInput, data.empresa);
    }
    
    await this.page.click(this.submitButton);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verificar si el miembro fue creado exitosamente
   */
  async miembroCreado() {
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
      return false;
    }
  }

  /**
   * Verificar visibilidad de campos según naturaleza
   */
  async isNombreVisible() {
    return await this.page.isVisible(this.nombreInput);
  }

  async isApellidosVisible() {
    return await this.page.isVisible(this.apellidosInput);
  }

  async isEmpresaVisible() {
    return await this.page.isVisible(this.empresaInput);
  }

  /**
   * Limpiar formulario
   */
  async clearForm() {
    await this.page.fill(this.nombreInput, '');
    await this.page.fill(this.apellidosInput, '');
    await this.page.fill(this.empresaInput, '');
  }
}

module.exports = MiembroPage;