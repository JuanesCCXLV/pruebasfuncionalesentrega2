const validData = {
  warehouse: {
    ref: 'ALM-TEST-001',
    label: 'Almacén de Pruebas',
    country: 'España',
    town: 'Madrid',
    zip: '28001',
    address: 'Calle Prueba 123'
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

module.exports = {
  validData,
  invalidData
};