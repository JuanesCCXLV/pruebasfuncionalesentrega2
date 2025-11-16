// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Configuración de Playwright para Dolibarr
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  
  /* Tiempo máximo de ejecución por test */
  timeout: 60 * 1000,
  
  /* Configuración de expect */
  expect: {
    timeout: 10000
  },
  
  /* Ejecutar tests secuencialmente (importante para tests de DB) */
  fullyParallel: false,
  
  /* Fail the build on CI if you accidentally left test.only */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Un worker a la vez (evita conflictos en DB) */
  workers: 1,
  
  /* Reporter to use */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results.json' }]
  ],

  /* Configuración compartida para todos los proyectos */
  use: {
    /* ⭐ URL BASE DE DOLIBARR */
    baseURL: 'http://localhost:8080',
    
    /* Capturar trazas en fallos */
    trace: 'on-first-retry',
    
    /* Screenshots en fallos */
    screenshot: 'only-on-failure',
    
    /* Videos en fallos */
    video: 'retain-on-failure',
    
    /* Tiempo de espera para acciones */
    actionTimeout: 15000,
    
    /* Tiempo de espera para navegación */
    navigationTimeout: 30000,
    
    /* Ignorar errores HTTPS (útil para desarrollo local) */
    ignoreHTTPSErrors: true,
    
    /* Configuración de viewport */
    viewport: { width: 1280, height: 720 },
    
    /* User agent */
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },

  /* Configurar proyectos para navegadores */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Opciones específicas de Chrome
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process'
          ]
        }
      },
    },

    
  ],
});