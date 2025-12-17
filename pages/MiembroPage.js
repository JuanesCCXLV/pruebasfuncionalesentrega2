// pages/MiembroPage.js - VERSIÓN CON SELECT2

const Select2Helper = require('../utils/select2-helper');

class MiembroPage {
  constructor(page) {
    this.page = page;
    this.select2 = new Select2Helper(page);
    
    // Selectores para navegación
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
    
    // Selectores del formulario
    this.tipoSelect = 'select[name="typeid"]';
    this.naturalezaSelect = 'select[name="morphy"]';
    this.nombreInput = 'input[name="firstname"]';
    this.apellidosInput = 'input[name="lastname"]';
    this.empresaInput = 'input[name="societe"]';
    
    // Campos adicionales
    this.civilidadSelect = 'select[name="civility_id"]';
    this.generoSelect = 'select[name="gender"]';
    this.emailInput = 'input[name="member_email"]';
    this.telefonoInput = 'input[name="phone"]';
    this.paisSelect = 'select[name="country_id"]';
    this.estadoSelect = 'select[name="state_id"]';
    this.publicoSelect = 'select[name="public"]';
    
    // Botón de submit
    this.submitButton = 'input[type="submit"][name="save"]';
    this.cancelButton = 'input[type="submit"][name="cancel"]';
    
    // Selectores de validación
    this.successMessage = '.ok, div.ok, .mesgs';
    this.errorMessage = '.error, div.error, .warning';
    this.validationError = '.error, .warning, .fieldrequired';
  }

  async goto() {
    console.log('🔄 Navegando al módulo de Members...');
    
    try {
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
      
      console.log('⚠️ Intentando navegación directa...');
      await this.page.goto('/adherents/card.php?action=create&mainmenu=members&leftmenu=');
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Seleccionar tipo de miembro - USANDO SELECT2
   */
  async seleccionarTipo(tipo) {
    // Primero ver qué opciones hay disponibles
    const options = await this.select2.getOptions(this.tipoSelect);
    console.log(`📋 Tipos disponibles: ${options.map(o => o.text).join(', ')}`);
    
    // Seleccionar usando Select2 helper
    await this.select2.selectByText(this.tipoSelect, tipo);
    await this.page.waitForTimeout(500);
  }

  /**
   * Seleccionar naturaleza - USANDO SELECT2
   */
  async seleccionarNaturaleza(naturaleza) {
    const valorSelect = naturaleza === 'Individual' ? 'Individual' : 
                       naturaleza === 'Corporation' ? 'Corporation' : ' ';
    
    await this.select2.selectByText(this.naturalezaSelect, valorSelect);
    console.log(`✅ Naturaleza seleccionada: ${naturaleza}`);
    
    await this.page.waitForTimeout(500);
  }

  /**
   * Crear miembro individual
   */
  async crearMiembroIndividual(data) {
    console.log('📝 Creando miembro individual...');
    
    // Seleccionar tipo si se proporciona
    if (data.tipo) {
      await this.seleccionarTipo(data.tipo);
    }
    
    // Seleccionar naturaleza "Individual"
    await this.seleccionarNaturaleza('Individual');
    
    // Llenar nombre
    if (data.nombre !== undefined) {
      await this.page.fill(this.nombreInput, data.nombre);
      console.log(`✅ Nombre: ${data.nombre}`);
    }
    
    // Llenar apellidos
    if (data.apellidos !== undefined) {
      await this.page.fill(this.apellidosInput, data.apellidos);
      console.log(`✅ Apellidos: ${data.apellidos}`);
    }
    
    // Campos opcionales
    if (data.email) {
      await this.page.fill(this.emailInput, data.email);
    }
    
    if (data.telefono) {
      await this.page.fill(this.telefonoInput, data.telefono);
    }
    
    await this.page.waitForTimeout(300);
    
    // Screenshot antes de submit
    await this.page.screenshot({ 
      path: `debug-antes-submit-${Date.now()}.png`,
      fullPage: true 
    });
    
    // Submit
    await this.page.click(this.submitButton);
    console.log('✅ Formulario enviado');
    
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
  }

  /**
   * Crear miembro corporativo
   */
  async crearMiembroCorporacion(data) {
    console.log('📝 Creando miembro corporativo...');
    
    if (data.tipo) {
      await this.seleccionarTipo(data.tipo);
    }
    
    await this.seleccionarNaturaleza('Corporation');
    
    if (data.empresa !== undefined) {
      await this.page.fill(this.empresaInput, data.empresa);
      console.log(`✅ Empresa: ${data.empresa}`);
    }
    
    if (data.email) {
      await this.page.fill(this.emailInput, data.email);
    }
    
    await this.page.waitForTimeout(300);
    
    await this.page.screenshot({ 
      path: `debug-antes-submit-corp-${Date.now()}.png`,
      fullPage: true 
    });
    
    await this.page.click(this.submitButton);
    console.log('✅ Formulario enviado');
    
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
  }

  async miembroCreado() {
    try {
      await this.page.waitForSelector(this.successMessage, { timeout: 5000 });
      console.log('✅ Miembro creado exitosamente');
      return true;
    } catch {
      const url = this.page.url();
      if (url.includes('card.php?id=') || url.includes('rowid=')) {
        console.log('✅ Miembro creado (detectado por URL)');
        return true;
      }
      
      console.log('❌ No se detectó creación exitosa');
      return false;
    }
  }

  async getErrorMessage() {
    try {
      const errorElement = await this.page.locator(this.errorMessage).first();
      const text = await errorElement.textContent();
      return text.trim();
    } catch {
      return null;
    }
  }

  async hasValidationError() {
    try {
      const errorVisible = await this.page.locator(this.validationError).first().isVisible({ timeout: 3000 });
      if (errorVisible) {
        return true;
      }
    } catch {}
    
    try {
      const isValid = await this.page.evaluate(() => {
        const inputs = document.querySelectorAll('input[required], input[name="firstname"], input[name="lastname"], input[name="societe"]');
        for (const input of inputs) {
          if (!input.validity.valid) {
            return false;
          }
        }
        return true;
      });
      return !isValid;
    } catch {
      return false;
    }
  }

  async isNombreVisible() {
    try {
      return await this.page.locator(this.nombreInput).isVisible({ timeout: 2000 });
    } catch {
      return false;
    }
  }

  async isApellidosVisible() {
    try {
      return await this.page.locator(this.apellidosInput).isVisible({ timeout: 2000 });
    } catch {
      return false;
    }
  }

  async isEmpresaVisible() {
    try {
      return await this.page.locator(this.empresaInput).isVisible({ timeout: 2000 });
    } catch {
      return false;
    }
  }

  async clearForm() {
    try {
      await this.page.fill(this.nombreInput, '');
      await this.page.fill(this.apellidosInput, '');
      await this.page.fill(this.empresaInput, '');
    } catch (error) {
      console.log('⚠️ Error limpiando formulario:', error.message);
    }
  }

  async debugCamposVisibles() {
    console.log('\n🔍 DEBUG: Campos visibles en el formulario');
    
    const campos = {
      nombre: await this.isNombreVisible(),
      apellidos: await this.isApellidosVisible(),
      empresa: await this.isEmpresaVisible()
    };
    
    console.log('Nombre visible:', campos.nombre);
    console.log('Apellidos visible:', campos.apellidos);
    console.log('Empresa visible:', campos.empresa);
    console.log('');
    
    return campos;
  }
}

module.exports = MiembroPage;