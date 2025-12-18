/**
 * Script de prueba para el endpoint /api/track
 * Ejecutar: node test-api.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api/track';

// Función para enviar una visita de prueba
async function sendTestVisit(siteName, url, extraData = {}) {
  try {
    const response = await axios.post(API_URL, {
      siteName,
      url,
      additionalData: extraData
    });
    
    console.log('✓ Visita registrada exitosamente:');
    console.log('  - ID:', response.data.visitId);
    console.log('  - Mensaje:', response.data.message);
    console.log('');
  } catch (error) {
    console.error('✗ Error al registrar visita:');
    console.error('  -', error.response?.data?.message || error.message);
    console.log('');
  }
}

// Ejecutar pruebas
async function runTests() {
  console.log('=== Iniciando pruebas del API ===\n');
  
  // Prueba 1: Visita básica
  console.log('Prueba 1: Visita básica');
  await sendTestVisit('Mi Blog Personal', 'https://miblog.com/articulo-1');
  
  // Prueba 2: Visita con datos adicionales
  console.log('Prueba 2: Visita con datos adicionales');
  await sendTestVisit('Tienda Online', 'https://tienda.com/producto/123', {
    productId: '123',
    category: 'Electrónica',
    price: 299.99,
    userId: 'user_456'
  });
  
  // Prueba 3: Múltiples visitas del mismo sitio
  console.log('Prueba 3: Múltiples visitas del mismo sitio');
  for (let i = 1; i <= 5; i++) {
    await sendTestVisit('Portfolio', `https://portfolio.com/proyecto-${i}`, {
      projectNumber: i,
      timestamp: new Date().toISOString()
    });
  }
  
  // Prueba 4: Diferentes sitios
  console.log('Prueba 4: Visitas de diferentes sitios');
  const sites = [
    { name: 'Landing Page', url: 'https://landing.com/' },
    { name: 'Dashboard App', url: 'https://app.com/dashboard' },
    { name: 'API Documentation', url: 'https://docs.com/api' }
  ];
  
  for (const site of sites) {
    await sendTestVisit(site.name, site.url);
  }
  
  console.log('=== Pruebas completadas ===');
  console.log('Visita http://localhost:3000 para ver los resultados en el dashboard');
}

// Ejecutar
runTests().catch(console.error);
