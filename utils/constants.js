// utils/constants.js

/**
 * Constantes utilizadas en todo el proyecto de pruebas
 */

// ============================================
// URLs Y RUTAS
// ============================================
const ROUTES = {
  LOGIN: '/',
  HOME: '/index.php',
  MEMBERS: '/adherents/list.php',
  MEMBER_CREATE: '/adherents/card.php?action=create',
  MEMBER_EDIT: '/adherents/card.php?id=',
  THIRD_PARTIES: '/societe/list.php',
  THIRD_PARTY_CREATE: '/societe/card.php?action=create',
  THIRD_PARTY_EDIT: '/societe/card.php?id=',
  LOGOUT: '/user/logout.php'
};

// ============================================
// TIMEOUTS
// ============================================
const TIMEOUTS = {
  SHORT: 3000,      // 3 segundos - Para elementos que deberían aparecer rápido
  MEDIUM: 5000,     // 5 segundos - Timeout estándar
  LONG: 10000,      // 10 segundos - Para operaciones que pueden tardar
  VERY_LONG: 30000, // 30 segundos - Para operaciones pesadas
  NAVIGATION: 15000 // 15 segundos - Para navegación entre páginas
};

// ============================================
// SELECTORES COMUNES (CSS)
// ============================================
const COMMON_SELECTORS = {
  // Mensajes
  SUCCESS_MESSAGE: '.ok, div.ok, .success, div[class*="success"]',
  ERROR_MESSAGE: '.error, div.error',
  WARNING_MESSAGE: '.warning, div.warning',
  INFO_MESSAGE: '.info, div.info',
  
  // Botones comunes
  SUBMIT_BUTTON: 'input[type="submit"], button[type="submit"]',
  CANCEL_BUTTON: 'input[value*="Cancel"], button[class*="cancel"]',
  SAVE_BUTTON: 'input[value*="Save"], button[class*="save"]',
  DELETE_BUTTON: 'input[value*="Delete"], button[class*="delete"]',
  
  // Navegación
  MENU_ITEM: '.tmenu',
  USER_MENU: '.login_block',
  LOGOUT_LINK: 'a[href*="logout"]',
  
  // Formularios
  REQUIRED_FIELD: 'input[required], select[required], textarea[required]',
  FORM: 'form',
  
  // Tablas
  TABLE: 'table.liste',
  TABLE_ROW: 'tr',
  TABLE_CELL: 'td'
};

// ============================================
// VALORES DE VALIDACIÓN
// ============================================
const VALIDATION = {
  // Login
  USERNAME_MIN_LENGTH: 5,
  USERNAME_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 20,
  
  // Tercero (Third Party)
  THIRD_PARTY_NAME_MIN_LENGTH: 3,
  THIRD_PARTY_NAME_MAX_LENGTH: 50,
  
  // Miembro (Member)
  MEMBER_NAME_MIN_LENGTH: 2,
  MEMBER_NAME_MAX_LENGTH: 50,
  
  // Email
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Teléfono
  PHONE_PATTERN: /^\+?[\d\s-()]+$/
};

// ============================================
// MENSAJES DE ERROR ESPERADOS (Español/Inglés)
// ============================================
const ERROR_MESSAGES = {
  LOGIN: {
    INVALID_CREDENTIALS_ES: 'Usuario o contraseña incorrectos',
    INVALID_CREDENTIALS_EN: 'Bad value for login or password',
    REQUIRED_FIELD_ES: 'Campo obligatorio',
    REQUIRED_FIELD_EN: 'Required field',
    USER_DISABLED_ES: 'Usuario deshabilitado',
    USER_DISABLED_EN: 'User disabled',
    INVALID_FORMAT_ES: 'Formato inválido',
    INVALID_FORMAT_EN: 'Invalid format'
  },
  
  MEMBER: {
    NAME_REQUIRED_ES: 'El nombre es obligatorio',
    NAME_REQUIRED_EN: 'Name is required',
    LASTNAME_REQUIRED_ES: 'Los apellidos son obligatorios',
    LASTNAME_REQUIRED_EN: 'Lastname is required',
    COMPANY_REQUIRED_ES: 'La empresa es obligatoria',
    COMPANY_REQUIRED_EN: 'Company is required',
    TYPE_REQUIRED_ES: 'El tipo es obligatorio',
    TYPE_REQUIRED_EN: 'Type is required'
  },
  
  THIRD_PARTY: {
    NAME_REQUIRED_ES: 'El nombre es obligatorio',
    NAME_REQUIRED_EN: 'Field Name is mandatory',
    NAME_TOO_SHORT_ES: 'Nombre demasiado corto',
    NAME_TOO_SHORT_EN: 'Name too short',
    NAME_TOO_LONG_ES: 'Nombre demasiado largo',
    NAME_TOO_LONG_EN: 'Name too long'
  }
};

// ============================================
// TIPOS Y ESTADOS
// ============================================
const MEMBER_TYPES = {
  ACTIVO: 'Activo',
  SIMPATIZANTE: 'Simpatizante',
  FUNDADOR: 'Fundador'
};

const MEMBER_NATURE = {
  INDIVIDUAL: 'phy',
  CORPORATION: 'mor'
};

const MEMBER_STATUS = {
  ACTIVE: '1',
  CLOSED: '0'
};

const CLIENT_TYPES = {
  NONE: '0',
  CLIENT: '1',
  PROSPECT: '2',
  PROSPECT_CLIENT: '3'
};

const SUPPLIER_STATUS = {
  NO: '0',
  YES: '1'
};

// ============================================
// DATOS DE PRUEBA PREDETERMINADOS
// ============================================
const TEST_DATA = {
  // Usuarios
  DEFAULT_ADMIN: {
    username: 'admin',
    password: 'admin'
  },
  
  // Strings de prueba
  SPECIAL_CHARS: '!@#$%^&*()',
  SQL_INJECTION: "' OR '1'='1",
  XSS_ATTEMPT: '<script>alert("XSS")</script>',
  
  // Valores límite genéricos
  BOUNDARY_VALUES: {
    MIN_MINUS_1: (min) => min - 1,
    MIN: (min) => min,
    MIN_PLUS_1: (min) => min + 1,
    MAX_MINUS_1: (max) => max - 1,
    MAX: (max) => max,
    MAX_PLUS_1: (max) => max + 1
  }
};

// ============================================
// CONFIGURACIÓN DE REPORTES
// ============================================
const REPORTS = {
  SCREENSHOT_PATH: 'screenshots/',
  VIDEO_PATH: 'videos/',
  REPORT_PATH: 'reports/',
  TRACE_PATH: 'traces/'
};

// ============================================
// ESTADOS DE PRUEBA
// ============================================
const TEST_STATUS = {
  PASS: 'pass',
  FAIL: 'fail',
  SKIP: 'skip',
  PENDING: 'pending'
};

// ============================================
// TÉCNICAS DE PRUEBA
// ============================================
const TEST_TECHNIQUES = {
  EQUIVALENCE_PARTITIONING: 'PE',
  BOUNDARY_VALUE_ANALYSIS: 'VL',
  DECISION_TABLE: 'TD',
  ORTHOGONAL_ARRAY: 'AO'
};

// ============================================
// TIPOS DE FALLO
// ============================================
const FAILURE_TYPES = {
  AUTHENTICATION: 'Autenticación',
  VALIDATION: 'Validación',
  BUSINESS_RULE: 'Regla de negocio',
  NAVIGATION: 'Navegación',
  DATA: 'Datos',
  PERFORMANCE: 'Rendimiento',
  UI: 'Interfaz de usuario'
};

// ============================================
// CONFIGURACIÓN DE NAVEGADOR
// ============================================
const BROWSER_CONFIG = {
  VIEWPORT: {
    width: 1920,
    height: 1080
  },
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  LOCALE: 'es-CO',
  TIMEZONE: 'America/Bogota'
};

// ============================================
// EXPRESIONES REGULARES ÚTILES
// ============================================
const REGEX_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE_CO: /^(\+57)?[0-9]{10}$/,
  NIT_CO: /^[0-9]{9}-[0-9]$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  LETTERS_ONLY: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  NUMBERS_ONLY: /^[0-9]+$/
};

// ============================================
// EXPORTAR TODAS LAS CONSTANTES
// ============================================
module.exports = {
  ROUTES,
  TIMEOUTS,
  COMMON_SELECTORS,
  VALIDATION,
  ERROR_MESSAGES,
  MEMBER_TYPES,
  MEMBER_NATURE,
  MEMBER_STATUS,
  CLIENT_TYPES,
  SUPPLIER_STATUS,
  TEST_DATA,
  REPORTS,
  TEST_STATUS,
  TEST_TECHNIQUES,
  FAILURE_TYPES,
  BROWSER_CONFIG,
  REGEX_PATTERNS
};