
/**
 * Utilidades comunes para las pruebas
 */

class TestHelpers {
  /**
   * Generar string aleatorio
   * @param {number} length - Longitud del string
   * @returns {string}
   */
  static generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generar email aleatorio
   * @returns {string}
   */
  static generateRandomEmail() {
    const random = this.generateRandomString(8);
    return `test_${random}@example.com`;
  }

  /**
   * Generar nombre de empresa aleatorio
   * @returns {string}
   */
  static generateCompanyName() {
    const prefixes = ['Tech', 'Digital', 'Global', 'Smart', 'Innova'];
    const suffixes = ['Solutions', 'Systems', 'Corp', 'Industries', 'Group'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix} ${suffix} ${Math.floor(Math.random() * 1000)}`;
  }

  /**
   * Generar nombre de persona aleatorio
   * @returns {object} - {nombre, apellidos}
   */
  static generatePersonName() {
    const nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Laura', 'Pedro', 'Sofia'];
    const apellidos = ['García', 'Rodríguez', 'Martínez', 'López', 'González', 'Pérez', 'Sánchez', 'Ramírez'];
    
    return {
      nombre: nombres[Math.floor(Math.random() * nombres.length)],
      apellidos: `${apellidos[Math.floor(Math.random() * apellidos.length)]} ${apellidos[Math.floor(Math.random() * apellidos.length)]}`
    };
  }

  /**
   * Esperar un tiempo específico
   * @param {number} ms - Milisegundos
   */
  static async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Formatear fecha a formato YYYY-MM-DD
   * @param {Date} date - Fecha
   * @returns {string}
   */
  static formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Obtener fecha actual
   * @returns {string}
   */
  static getCurrentDate() {
    return this.formatDate(new Date());
  }

  /**
   * Limpiar texto (remover espacios extra, saltos de línea, etc.)
   * @param {string} text - Texto a limpiar
   * @returns {string}
   */
  static cleanText(text) {
    return text.trim().replace(/\s+/g, ' ');
  }

  /**
   * Generar número aleatorio en rango
   * @param {number} min - Mínimo
   * @param {number} max - Máximo
   * @returns {number}
   */
  static randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Crear timestamp único
   * @returns {string}
   */
  static getTimestamp() {
    return Date.now().toString();
  }

  /**
   * Validar email
   * @param {string} email - Email a validar
   * @returns {boolean}
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Tomar screenshot con nombre personalizado
   * @param {Page} page - Página de Playwright
   * @param {string} name - Nombre del screenshot
   */
  static async takeScreenshot(page, name) {
    const timestamp = this.getTimestamp();
    await page.screenshot({ 
      path: `screenshots/${name}_${timestamp}.png`,
      fullPage: true 
    });
  }
}

module.exports = TestHelpers;