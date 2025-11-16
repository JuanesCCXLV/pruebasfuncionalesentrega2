const validData = {
  warehouse: {
    ref: 'ALM-TEST-001',
    label: 'Almacén de Pruebas',
    country: 'España',
    town: 'Madrid',
    zip: '28001',
    address: 'Calle Prueba 123',
    location: 'Ubicación A'
  },
  product: {
    ref: 'PROD-TEST-001',
    label: 'Producto de Prueba',
    price: '100.00',
    qty: '10'
  },
  customer: {
    name: 'Cliente de Pruebas SA',
    email: 'cliente@pruebas.com',
    phone: '912345678',
    address: 'Calle Cliente 456'
  },
  invoice: {
    ref: 'FAC-TEST-001',
    date: new Date().toISOString().split('T')[0]
  }
};

const invalidData = {
  warehouse: {
    ref: '', // vacío
    label: '', // vacío
    zip: 'ABC', // no numérico
    country: '' // no seleccionado
  },
  product: {
    ref: '', // vacío
    price: '-10.50', // negativo
    qty: '-5' // negativo
  }
};


async function login(page, username = 'admin', password = 'admin') {
  await page.goto('/');
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('input[type="submit"]');
  await page.waitForLoadState('networkidle');
}

async function loginAsUser(page, username, password) {
  // Primero hacer logout si hay sesión activa
  await page.goto('/user/logout.php');
  await page.waitForLoadState('networkidle');
  
  // Hacer login con el nuevo usuario
  await login(page, username, password);
}

module.exports = { login, loginAsUser, validData, invalidData };