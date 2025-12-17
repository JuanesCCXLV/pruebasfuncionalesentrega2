// pages/TipoMiembroPage.js

class TipoMiembroPage {
  constructor(page) {
    this.page = page;
    
    // Selectores para navegación
    this.membersMenu = 'a[href*="adherents/index.php"]';
    this.memberTypesLink = 'a[href*="adherents/type.php"]';
    
    // Selectores del formulario de edición
    this.estadoSelect = 'select[name="statut"]';
    this.naturalezaCheckboxes = {
      individual: 'input[name="morphy"][value="phy"]',
      corporacion: 'input[name="morphy"][value="mor"]',
      ambos: 'input[name="morphy"][value=""]'
    };
    this.sujetoCotizacionSi = 'input[name="subscription"][value="1"]';
    this.sujetoCotizacionNo = 'input[name="subscription"][value="0"]';
    this.calcularImporteSi = 'input[name="auto_renew"][value="1"]';
    this.calcularImporteNo = 'input[name="auto_renew"][value="0"]';
    this.importeInput = 'input[name="amount"]';
    this.duracionTipoSelect = 'select[name="duration_unit"]';
    this.duracionValorInput = 'input[name="duration_value"]';
    this.votoAutorizadoSi = 'input[name="vote"][value="1"]';
    this.votoAutorizadoNo = 'input[name="vote"][value="0"]';
    this.submitButton = [
      'input[type="submit"][name="update"]',
      'input.button[value*="Save"]',
      'input.button[value*="Modify"]'
    ];
    
    // Selectores de validación
    this.successMessage = '.ok, div.ok, .mesgs';
    this.errorMessage = '.error, div.error, .warning';
    this.validationError = '.error, .warning, .fieldrequired';
  }

  /**
   * Navegar a la página de edición de tipo de miembro
   * @param {number} typeId - ID del tipo de miembro (por defecto 1)
   */
  async goto(typeId = 1) {
    console.log(`🔄 Navegando a editar tipo de miembro ID: ${typeId}...`);
    
    // Método directo por URL
    await this.page.goto(`/adherents/type.php?action=edit&rowid=${typeId}`);
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
    
    const url = this.page.url();
    console.log(`📍 URL actual: ${url}`);
    
    // Verificar que estamos en la página correcta
    if (!url.includes('type.php') || !url.includes('action=edit')) {
      console.log('⚠️ No estamos en la página de edición de tipo');
      throw new Error('No se pudo navegar a la página de edición de tipo de miembro');
    }
  }

  /**
   * Método alternativo: Navegar desde el menú
   */
  async gotoFromMenu(typeId = 1) {
    console.log('🔄 Navegando desde el menú...');
    
    // Click en Members menu
    try {
      await this.page.click(this.membersMenu);
      await this.page.waitForLoadState('networkidle');
      
      // Click en Member Types
      await this.page.click(this.memberTypesLink);
      await this.page.waitForLoadState('networkidle');
      
      // Click en el tipo específico para editar
      await this.page.click(`a[href*="type.php?action=edit&rowid=${typeId}"]`);
      await this.page.waitForLoadState('networkidle');
      
    } catch (error) {
      console.log('⚠️ Error navegando desde menú, usando URL directa...');
      await this.goto(typeId);
    }
  }

  /**
   * Establecer estado del miembro
   * @param {string} estado - 'Activo' o 'Cerrado'
   */
  async setEstado(estado) {
    const valor = estado === 'Activo' ? '1' : '0';
    await this.page.selectOption(this.estadoSelect, valor);
    console.log(`✅ Estado establecido: ${estado}`);
  }

  /**
   * Establecer naturaleza
   * @param {string} naturaleza - 'Individual', 'Corporación' o 'Ambos'
   */
  async setNaturaleza(naturaleza) {
    const selector = naturaleza === 'Individual' 
      ? this.naturalezaCheckboxes.individual
      : naturaleza === 'Corporación'
      ? this.naturalezaCheckboxes.corporacion
      : this.naturalezaCheckboxes.ambos;
    
    await this.page.check(selector);
    console.log(`✅ Naturaleza establecida: ${naturaleza}`);
  }

  /**
   * Configurar sujeto a cotización
   * @param {boolean} sujeto - true o false
   */
  async setSujetoCotizacion(sujeto) {
    const selector = sujeto ? this.sujetoCotizacionSi : this.sujetoCotizacionNo;
    await this.page.check(selector);
    console.log(`✅ Sujeto a cotización: ${sujeto ? 'Sí' : 'No'}`);
  }

  /**
   * Configurar calcular importe
   * @param {boolean} calcular - true o false
   */
  async setCalcularImporte(calcular) {
    const selector = calcular ? this.calcularImporteSi : this.calcularImporteNo;
    await this.page.check(selector);
    console.log(`✅ Calcular importe: ${calcular ? 'Sí' : 'No'}`);
  }

  /**
   * Establecer importe
   * @param {string|number} importe - Valor del importe o vacío
   */
  async setImporte(importe) {
    if (importe !== undefined && importe !== null) {
      await this.page.fill(this.importeInput, importe.toString());
      console.log(`✅ Importe establecido: ${importe}`);
    } else {
      await this.page.fill(this.importeInput, '');
      console.log('✅ Importe dejado vacío');
    }
  }

  /**
   * Configurar duración
   * @param {string} tipo - 'Año', 'Mes', etc. o vacío
   * @param {string|number} valor - Cantidad o vacío
   */
  async setDuracion(tipo, valor) {
    if (tipo) {
      await this.page.selectOption(this.duracionTipoSelect, { label: tipo });
      console.log(`✅ Tipo de duración: ${tipo}`);
    }
    
    if (valor !== undefined && valor !== null) {
      await this.page.fill(this.duracionValorInput, valor.toString());
      console.log(`✅ Valor de duración: ${valor}`);
    } else {
      await this.page.fill(this.duracionValorInput, '');
      console.log('✅ Valor de duración dejado vacío');
    }
  }

  /**
   * Configurar voto autorizado
   * @param {boolean} autorizado - true o false
   */
  async setVotoAutorizado(autorizado) {
    const selector = autorizado ? this.votoAutorizadoSi : this.votoAutorizadoNo;
    await this.page.check(selector);
    console.log(`✅ Voto autorizado: ${autorizado ? 'Sí' : 'No'}`);
  }

  /**
   * Editar tipo de miembro completo
   * @param {Object} config - Configuración del tipo
   */
  async editarTipoMiembro(config) {
    try {
      console.log('📝 Editando tipo de miembro...');
      
      // Estado
      if (config.estado) {
        await this.setEstado(config.estado);
      }
      
      // Naturaleza
      if (config.naturaleza) {
        await this.setNaturaleza(config.naturaleza);
      }
      
      // Sujeto a cotización
      if (config.sujetoCotizacion !== undefined) {
        await this.setSujetoCotizacion(config.sujetoCotizacion);
        
        // Si está sujeto a cotización, configurar importe
        if (config.sujetoCotizacion) {
          if (config.calcularImporte !== undefined) {
            await this.setCalcularImporte(config.calcularImporte);
          }
          
          if (config.importe !== undefined) {
            await this.setImporte(config.importe);
          }
        }
      }
      
      // Duración
      if (config.duracionTipo !== undefined || config.duracionValor !== undefined) {
        await this.setDuracion(config.duracionTipo, config.duracionValor);
      }
      
      // Voto autorizado
      if (config.votoAutorizado !== undefined) {
        await this.setVotoAutorizado(config.votoAutorizado);
      }
      
      await this.page.waitForTimeout(500);
      
      // Submit
      await this.guardar();
      
    } catch (error) {
      console.error('❌ Error editando tipo de miembro:', error.message);
      await this.page.screenshot({ 
        path: `debug-editar-tipo-error-${Date.now()}.png`,
        fullPage: true 
      });
      throw error;
    }
  }

  /**
   * Guardar cambios
   */
  async guardar() {
    const buttonSelector = await this.findWorkingSelector(this.submitButton);
    
    if (buttonSelector) {
      await this.page.click(buttonSelector);
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(1000);
      console.log('✅ Cambios guardados');
    } else {
      throw new Error('No se encontró el botón de guardar');
    }
  }

  /**
   * Buscar selector que funcione
   */
  async findWorkingSelector(selectors) {
    const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
    
    for (const selector of selectorArray) {
      try {
        const element = this.page.locator(selector).first();
        const isVisible = await element.isVisible({ timeout: 2000 });
        if (isVisible) {
          return selector;
        }
      } catch (e) {
        continue;
      }
    }
    return null;
  }

  /**
   * Verificar si la edición fue exitosa
   */
  async edicionExitosa() {
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
      await errorElement.waitFor({ state: 'visible', timeout: 3000 });
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
   * Debug: Mostrar información del formulario
   */
  async debugFormInfo() {
    console.log('\n🔍 DEBUG: Información del formulario de tipo de miembro');
    
    const info = await this.page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        selects: Array.from(document.querySelectorAll('select')).map(s => ({
          name: s.name,
          id: s.id,
          options: Array.from(s.options).map(o => o.text)
        })),
        inputs: Array.from(document.querySelectorAll('input')).map(i => ({
          type: i.type,
          name: i.name,
          id: i.id,
          value: i.value
        }))
      };
    });
    
    console.log('URL:', info.url);
    console.log('Selects:', JSON.stringify(info.selects, null, 2));
    console.log('Inputs:', JSON.stringify(info.inputs, null, 2));
    console.log('═══════════════════════════════════\n');
  }
}

module.exports = TipoMiembroPage;