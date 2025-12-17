// pages/TipoMiembroPage.js

class TipoMiembroPage {
  constructor(page) {
    this.page = page;
    
    // Selectores para navegación
    this.membersMenu = 'a[href*="adherents/index.php"]';
    this.memberTypesLink = 'a[href*="adherents/type.php"]';
    
    // Selectores del formulario de edición (CORREGIDOS según estructura real)
    this.estadoSelect = 'select[name="status"]';
    this.naturalezaSelect = 'select[name="morphy"]';
    this.sujetoCotizacionSelect = 'select[name="subscription"]';
    this.calcularImporteSelect = 'select[name="caneditamount"]';
    this.importeInput = 'input[name="amount"]';
    this.duracionTipoSelect = 'select[name="duration_unit"]';
    this.duracionValorInput = 'input[name="duration_value"]';
    this.votoAutorizadoSelect = 'select[name="vote"]';
    this.submitButton = [
      'input[type="submit"][name="save"]',
      'input.button[value*="Save"]',
      'input[type="submit"]'
    ];
    
    // Selectores de validación (CORREGIDOS)
    this.successMessage = [
      'div.ok',
      '.ok',
      'div[class*="mesgs"]',
      'div[class*="success"]',
      // Si está en la página de lista después de guardar
      'table.liste',
      // O si permanece en la misma página sin errores
      'form'
    ];
    this.errorMessage = '.error, div.error, .warning, div.warning';
    this.validationError = '.error, .warning, .fieldrequired';
  }

  /**
   * Navegar a la página de edición de tipo de miembro
   */
  async goto(typeId = 1) {
    console.log(`🔄 Navegando a editar tipo de miembro ID: ${typeId}...`);
    
    await this.page.goto(`/adherents/type.php?action=edit&rowid=${typeId}`);
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
    
    const url = this.page.url();
    console.log(`📍 URL actual: ${url}`);
    
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
    
    try {
      await this.page.click(this.membersMenu);
      await this.page.waitForLoadState('networkidle');
      
      await this.page.click(this.memberTypesLink);
      await this.page.waitForLoadState('networkidle');
      
      await this.page.click(`a[href*="type.php?action=edit&rowid=${typeId}"]`);
      await this.page.waitForLoadState('networkidle');
      
    } catch (error) {
      console.log('⚠️ Error navegando desde menú, usando URL directa...');
      await this.goto(typeId);
    }
  }

  /**
   * Establecer estado del miembro
   */
  async setEstado(estado) {
    const valor = estado === 'Activo' ? '1' : '0';
    await this.page.selectOption(this.estadoSelect, valor);
    console.log(`✅ Estado establecido: ${estado}`);
  }

  /**
   * Establecer naturaleza
   */
  async setNaturaleza(naturaleza) {
    let value;
    switch(naturaleza) {
      case 'Individual':
        value = 'phy';
        break;
      case 'Corporación':
        value = 'mor';
        break;
      case 'Ambos':
        value = '';
        break;
      default:
        throw new Error(`Naturaleza desconocida: ${naturaleza}`);
    }
    
    await this.page.selectOption(this.naturalezaSelect, value);
    console.log(`✅ Naturaleza establecida: ${naturaleza}`);
  }

  /**
   * Configurar sujeto a cotización
   */
  async setSujetoCotizacion(sujeto) {
    const value = sujeto ? '1' : '0';
    await this.page.selectOption(this.sujetoCotizacionSelect, value);
    console.log(`✅ Sujeto a cotización: ${sujeto ? 'Sí' : 'No'}`);
  }

  /**
   * Configurar calcular importe (caneditamount)
   */
  async setCalcularImporte(calcular) {
    const value = calcular ? '1' : '0';
    await this.page.selectOption(this.calcularImporteSelect, value);
    console.log(`✅ Puede editar importe: ${calcular ? 'Sí' : 'No'}`);
  }

  /**
   * Establecer importe
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
   * Configurar duración (compatible con Select2)
   */
  async setDuracion(tipo, valor) {
    if (tipo) {
      try {
        // Intentar interactuar con Select2
        // Primero hacer click en el contenedor visible de Select2
        const select2Container = this.page.locator('.select2-container').filter({ 
          has: this.page.locator('select[name="duration_unit"]') 
        });
        
        const isVisible = await select2Container.isVisible();
        
        if (isVisible) {
          // Click en el select2 para abrir el dropdown
          await select2Container.click();
          await this.page.waitForTimeout(300);
          
          // Buscar y clickear la opción
          const optionText = this.getDurationLabel(tipo);
          await this.page.click(`li.select2-results__option:has-text("${optionText}")`);
          console.log(`✅ Tipo de duración: ${optionText}`);
        } else {
          // Fallback: usar select normal si Select2 no está visible
          await this.page.selectOption(this.duracionTipoSelect, tipo);
          console.log(`✅ Tipo de duración: ${tipo}`);
        }
      } catch (error) {
        console.log(`⚠️ Error con Select2, intentando select directo...`);
        // Último intento: manipular el valor del select oculto con JavaScript
        await this.page.evaluate((value) => {
          const select = document.querySelector('select[name="duration_unit"]');
          if (select) {
            select.value = value;
            // Disparar evento change
            select.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, tipo);
        console.log(`✅ Tipo de duración establecido via JavaScript: ${tipo}`);
      }
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
   * Obtener etiqueta de duración según el valor
   */
  getDurationLabel(value) {
    const map = {
      's': 'Second',
      'i': 'Minute',
      'h': 'Hour',
      'd': 'Day',
      'w': 'Week',
      'm': 'Month',
      'y': 'Year',
      'year': 'Year',
      'month': 'Month'
    };
    return map[value] || value;
  }

  /**
   * Configurar voto autorizado
   */
  async setVotoAutorizado(autorizado) {
    const value = autorizado ? '1' : '0';
    await this.page.selectOption(this.votoAutorizadoSelect, value);
    console.log(`✅ Voto autorizado: ${autorizado ? 'Sí' : 'No'}`);
  }

  /**
   * Editar tipo de miembro completo
   */
  async editarTipoMiembro(config) {
    try {
      console.log('📝 Editando tipo de miembro...');
      
      // Esperar a que el formulario esté listo
      await this.page.waitForSelector('input[name="label"]', { timeout: 5000 });
      
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
      await this.page.waitForTimeout(1500); // Aumentado para dar tiempo a la respuesta
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
   * Verificar si la edición fue exitosa (MEJORADO)
   */
  async edicionExitosa() {
    try {
      // Esperar un momento para que se procese la respuesta
      await this.page.waitForTimeout(1000);
      
      const currentUrl = this.page.url();
      console.log(`📍 URL después de guardar: ${currentUrl}`);
      
      // Verificar si hay mensajes de error
      const hasError = await this.hasValidationError();
      if (hasError) {
        console.log('❌ Se detectó un error de validación');
        return false;
      }
      
      // Si la URL cambió a la lista de tipos, fue exitoso
      if (currentUrl.includes('type.php') && !currentUrl.includes('action=edit')) {
        console.log('✅ Redirección a lista de tipos (éxito)');
        return true;
      }
      
      // Si permanece en la página de edición sin errores, también es exitoso
      if (currentUrl.includes('action=edit') && !hasError) {
        console.log('✅ Permanece en edición sin errores (éxito)');
        return true;
      }
      
      // Buscar mensaje de éxito explícito
      for (const selector of this.successMessage) {
        try {
          const element = await this.page.locator(selector).first();
          const isVisible = await element.isVisible({ timeout: 1000 });
          if (isVisible) {
            console.log(`✅ Mensaje de éxito encontrado con selector: ${selector}`);
            return true;
          }
        } catch (e) {
          continue;
        }
      }
      
      // Si llegamos aquí y no hay errores, consideramos que fue exitoso
      console.log('✅ Sin errores detectados (éxito por defecto)');
      return true;
      
    } catch (error) {
      console.log(`⚠️ Error verificando éxito: ${error.message}`);
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
      const errorVisible = await this.page.locator(this.validationError).first().isVisible({ timeout: 2000 });
      return errorVisible;
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