// pages/TerceroPage.js - VERSIÓN FINAL CORREGIDA

class TerceroPage {
  constructor(page) {
    this.page = page;

    // Campo principal
    this.nombreInput = 'input[name="name"]';
    
    // Botones
    this.submitButton = 'input[type="submit"][name="save"]';
    this.cancelButton = 'input[type="submit"][name="cancel"]';
    
    // Checkboxes opcionales (pueden no existir)
    this.proveedorCheckbox = 'input[type="checkbox"][name="fournisseur"]';
    this.clienteCheckbox = 'input[type="checkbox"][name="client"]';
    
    // Otros campos opcionales
    this.emailInput = 'input[name="email"]';
    this.phoneInput = 'input[name="phone"]';
    this.zipcodeInput = 'input[name="zipcode"]';
    this.townInput = 'input[name="town"]';
    
    // Selectores de validación
    this.successMessage = '.ok, div.ok, .mesgs';
    this.errorMessage = '.error, div.error';
    this.validationError = '.error, .warning, .fieldrequired';
  }

  /**
   * Navegar a la página de crear tercero
   */
  async goto() {
    console.log('🔄 Navegando a crear tercero...');
    
    // Navegación directa (más confiable)
    await this.page.goto('/societe/card.php?action=create');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
    
    console.log(`📍 URL: ${this.page.url()}`);
  }

  /**
   * Crear tercero - VERSIÓN SIMPLIFICADA
   */
  async crearTercero(data) {
    console.log('📝 Creando tercero...');
    
    // Llenar nombre (campo obligatorio)
    if (data.nombre !== undefined) {
      await this.page.fill(this.nombreInput, data.nombre);
      console.log(`✅ Nombre: ${data.nombre}`);
    }
    
    // Campos opcionales
    if (data.email) {
      await this.page.fill(this.emailInput, data.email);
    }
    
    if (data.telefono) {
      await this.page.fill(this.phoneInput, data.telefono);
    }
    
    if (data.zipcode) {
      await this.page.fill(this.zipcodeInput, data.zipcode);
    }
    
    if (data.town) {
      await this.page.fill(this.townInput, data.town);
    }
    
    await this.page.waitForTimeout(300);
    
    // Submit
    await this.page.click(this.submitButton);
    console.log('✅ Formulario enviado');
    
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1500); // Dar tiempo para que se procese
  }

  /**
   * Verificar si el tercero fue creado - MEJORADO
   */
  async terceroCreado(nombre) {
    await this.page.waitForTimeout(1000);
    
    const url = this.page.url();
    console.log(`🔍 Verificando creación. URL: ${url}`);
    
    // Método 1: URL cambió a modo visualización (tiene ID o socid)
    if (url.includes('card.php?id=') || url.includes('card.php?socid=')) {
      console.log('✅ Tercero creado (URL con ID detectado)');
      return true;
    }
    
    // Método 2: Ya NO está en action=create
    if (!url.includes('action=create')) {
      console.log('✅ Tercero creado (ya no está en modo crear)');
      return true;
    }
    
    // Método 3: Buscar botón "Modify" o "Edit" (aparece después de crear)
    try {
      const modifyBtn = this.page.locator('a:has-text("Modify"), a:has-text("Edit"), a:has-text("Modificar")').first();
      const hasModify = await modifyBtn.isVisible({ timeout: 2000 });
      if (hasModify) {
        console.log('✅ Tercero creado (botón Modify detectado)');
        return true;
      }
    } catch {}
    
    // Método 4: Buscar el nombre del tercero en un h1 o título
    if (nombre) {
      try {
        const h1 = this.page.locator('h1, .titre').first();
        const titleText = await h1.textContent({ timeout: 2000 });
        if (titleText && titleText.includes(nombre)) {
          console.log('✅ Tercero creado (nombre en título)');
          return true;
        }
      } catch {}
    }
    
    // Método 5: Buscar mensaje de éxito
    try {
      const successMsg = this.page.locator(this.successMessage).first();
      const hasSuccess = await successMsg.isVisible({ timeout: 2000 });
      if (hasSuccess) {
        console.log('✅ Tercero creado (mensaje de éxito)');
        return true;
      }
    } catch {}
    
    // Método 6: Verificar que NO hay errores y la URL cambió
    const hasError = await this.hasValidationError();
    if (!hasError && url !== `${this.page.url().split('?')[0]}?action=create`) {
      console.log('✅ Tercero creado (sin errores y URL diferente)');
      return true;
    }
    
    console.log('❌ No se detectó creación exitosa');
    console.log(`   URL actual: ${url}`);
    
    return false;
  }

  /**
   * Verificar si hay error de validación
   */
  async hasValidationError() {
    try {
      // Buscar errores visibles
      const errorVisible = await this.page.locator(this.validationError).first().isVisible({ timeout: 2000 });
      if (errorVisible) {
        console.log('⚠️ Error de validación detectado');
        return true;
      }
    } catch {}
    
    try {
      // Verificar validación HTML5
      const isValid = await this.page.evaluate(() => {
        const input = document.querySelector('input[name="name"]');
        return input ? input.validity.valid : true;
      });
      
      if (!isValid) {
        console.log('⚠️ Error de validación HTML5');
        return true;
      }
    } catch {}
    
    return false;
  }

  /**
   * Obtener mensaje de error
   */
  async getErrorMessage() {
    try {
      const errorElement = await this.page.locator(this.errorMessage).first();
      const text = await errorElement.textContent({ timeout: 2000 });
      return text.trim();
    } catch {
      return null;
    }
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
    try {
      await this.page.fill(this.nombreInput, '');
    } catch (error) {
      console.log('⚠️ Error limpiando formulario:', error.message);
    }
  }

  /**
   * Debug: Ver qué hay en la página actual
   */
  async debugPageInfo() {
    console.log('\n🔍 DEBUG: Información de la página');
    
    const info = await this.page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        h1: document.querySelector('h1')?.textContent?.trim() || 'No h1',
        hasModifyBtn: !!document.querySelector('a:has-text("Modify"), a:has-text("Modificar")'),
        hasError: !!document.querySelector('.error, .warning'),
        formAction: document.querySelector('form')?.action || 'No form'
      };
    });
    
    console.log('URL:', info.url);
    console.log('Title:', info.title);
    console.log('H1:', info.h1);
    console.log('Tiene botón Modify:', info.hasModifyBtn);
    console.log('Tiene error:', info.hasError);
    console.log('Form action:', info.formAction);
    console.log('');
    
    return info;
  }
}

module.exports = TerceroPage;