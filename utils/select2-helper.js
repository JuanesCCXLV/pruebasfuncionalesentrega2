class Select2Helper {
  constructor(page) {
    this.page = page;
  }

  async selectByText(selector, optionText) {
    try {
      console.log(`🔽 Seleccionando: "${optionText}"`);
      
      await this.page.evaluate(({ sel, text }) => {
        const select = document.querySelector(sel);
        if (!select) throw new Error(`Select no encontrado: ${sel}`);
        
        const options = Array.from(select.options);
        const option = options.find(opt => 
          opt.text.trim() === text.trim() || 
          opt.text.includes(text) ||
          opt.value === text
        );
        
        if (!option) {
          throw new Error(`Opción no encontrada: "${text}". Disponibles: ${options.map(o => o.text).join(', ')}`);
        }
        
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        
        if (window.jQuery && window.jQuery(select).data('select2')) {
          window.jQuery(select).trigger('change');
        }
        
        return option.text;
      }, { sel: selector, text: optionText });
      
      console.log(`✅ Seleccionado: ${optionText}`);
      await this.page.waitForTimeout(300);
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      throw error;
    }
  }

  async selectByValue(selector, value) {
    try {
      await this.page.evaluate(({ sel, val }) => {
        const select = document.querySelector(sel);
        if (!select) throw new Error(`Select no encontrado`);
        
        select.value = val;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        
        if (window.jQuery && window.jQuery(select).data('select2')) {
          window.jQuery(select).trigger('change');
        }
      }, { sel: selector, val: value });
      
      await this.page.waitForTimeout(300);
    } catch (error) {
      throw error;
    }
  }

  async getOptions(selector) {
    return await this.page.evaluate((sel) => {
      const select = document.querySelector(sel);
      if (!select) return [];
      
      return Array.from(select.options).map(opt => ({
        value: opt.value,
        text: opt.text.trim()
      }));
    }, selector);
  }
}

module.exports = Select2Helper;