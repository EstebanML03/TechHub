/**
 * Script para probar la API de Vercel
 * Ejecutar con: node test-api.js
 */

const API_BASE_URL = 'https://tech-hub-proyecto-pedag-gico-integr.vercel.app/api';

async function testAPI() {
  console.log('🔍 Probando API de Vercel...\n');
  console.log(`📡 Base URL: ${API_BASE_URL}\n`);

  // Lista de endpoints a probar
  const endpoints = [
    { name: 'Health Check', url: '/', method: 'GET' },
    { name: 'Eventos', url: '/eventos', method: 'GET' },
    { name: 'Emprendimientos', url: '/emprendimientos', method: 'GET' },
    { name: 'Publicaciones', url: '/publicaciones', method: 'GET' },
    { name: 'Grupos', url: '/grupos', method: 'GET' },
    { name: 'Usuarios', url: '/usuarios', method: 'GET' },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`⏳ Probando: ${endpoint.name} (${endpoint.method} ${endpoint.url})`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint.url}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const statusEmoji = response.ok ? '✅' : '❌';
      console.log(`${statusEmoji} Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          console.log(`   📊 Registros encontrados: ${data.length}`);
        } else if (data.data && Array.isArray(data.data)) {
          console.log(`   📊 Registros encontrados: ${data.data.length}`);
        } else {
          console.log(`   📦 Respuesta:`, JSON.stringify(data).substring(0, 100) + '...');
        }
      } else {
        const errorText = await response.text();
        console.log(`   ⚠️  Error: ${errorText.substring(0, 100)}`);
      }

    } catch (error) {
      console.log(`❌ Error de conexión: ${error.message}`);
    }
    console.log('');
  }

  console.log('✨ Prueba completada!\n');
}

// Ejecutar pruebas
testAPI().catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});
