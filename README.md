# 📊 Tracker Sites - Sistema de Seguimiento de Visitas

Sistema completo para recibir y visualizar visitas desde múltiples aplicaciones web.

## 🚀 Características

- ✅ **API REST** para recibir visitas desde cualquier aplicación
- ✅ **Dashboard web** con autenticación para ver el historial
- ✅ **MongoDB** para persistencia de datos
- ✅ **Paginación** de resultados
- ✅ **Estadísticas** en tiempo real
- ✅ **Deduplicación** de visitas por navegador, página y ventana de tiempo
- ✅ **Responsive design** - funciona en móvil y desktop

## 📋 Requisitos Previos

- Node.js 12+ instalado
- MongoDB instalado y ejecutándose
- NPM o Yarn

## 🛠️ Instalación

1. **Clonar o descargar el proyecto**

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar MongoDB:**

Asegúrate de que MongoDB esté ejecutándose:
```bash
# En Linux/Mac
sudo systemctl start mongod
# o
mongod

# En Windows
net start MongoDB
```

4. **Configurar variables de entorno:**

Edita el archivo `.env` con tus credenciales:
```env
MONGODB_URI=mongodb://localhost:27017/tracker_sites
SESSION_SECRET=cambiar_este_secreto_por_algo_seguro
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
PORT=3000
# Tiempo en minutos para no repetir la misma página del mismo navegador
TRACKER_DEDUP_MINUTES=30
```

⚠️ **IMPORTANTE:** Cambia el usuario y contraseña por defecto antes de usar en producción.

## ▶️ Ejecutar la Aplicación

```bash
npm start
```

La aplicación estará disponible en: `http://localhost:3000`

## 🔐 Acceso al Dashboard

1. Navega a `http://localhost:3000`
2. Inicia sesión con las credenciales configuradas en `.env`:
   - Usuario: `admin` (por defecto)
   - Contraseña: `admin123` (por defecto)

## 📡 API - Enviar Visitas

### Endpoint: `POST /api/track`

Envía visitas desde tus aplicaciones a este endpoint.

#### Request:
```bash
curl -X POST http://localhost:3000/api/track \
  -H "Content-Type: application/json" \
  -d '{
    "siteName": "Mi Sitio Web",
    "url": "https://misitio.com/pagina-principal",
    "additionalData": {
      "userId": "123",
      "source": "google"
    }
  }'
```

#### Campos requeridos:
- `siteName` (string): Nombre del sitio que envía la visita
- `url` (string): URL visitada

#### Campos opcionales:
- `additionalData` (object): Cualquier dato adicional que quieras guardar

#### Datos automáticos capturados:
- IP del visitante
- User Agent
- Referrer
- Timestamp
- `sessionId`: sesión anónima del navegador, renovada después de la ventana configurada
- `visitorKey`: huella HMAC anónima para agrupar el navegador sin guardar esa huella como texto legible

Por defecto, si el mismo navegador vuelve a enviar la misma `siteName` y `url` dentro de
30 minutos, la API responde correctamente pero no crea otro documento. Configura
`TRACKER_DEDUP_MINUTES=0` para desactivar esta deduplicación.

En el dashboard, la columna **Dispositivo** muestra los primeros caracteres de
`visitorKey`; visitas del mismo navegador normalmente compartirán ese identificador.

El identificador permite reconocer principalmente el mismo navegador (mediante una cookie
segura), no un equipo físico con certeza: puede cambiar al borrar cookies, usar incógnito,
otro navegador o una VPN. Si la integración es cross-origin, el navegador puede bloquear la
cookie; en ese caso el servidor usa una huella HMAC basada en IP y User-Agent como respaldo.
No uses `sessionId` o `visitorKey` como autenticación.

#### Response exitoso:
```json
{
  "success": true,
  "message": "Visita registrada correctamente",
  "visitId": "507f1f77bcf86cd799439011",
  "duplicate": false,
  "sessionId": "d9b2..."
}
```

Cuando la visita ya existe dentro de la ventana:

```json
{
  "success": true,
  "duplicate": true,
  "message": "Visita ya registrada dentro de la ventana configurada",
  "visitId": "507f1f77bcf86cd799439011"
}
```

#### Response de error:
```json
{
  "success": false,
  "message": "siteName y url son requeridos"
}
```

### Endpoint: `GET /api/stats`

Obtiene estadísticas generales.

#### Response:
```json
{
  "success": true,
  "totalVisits": 150,
  "visitsBySite": [
    { "_id": "Mi Sitio Web", "count": 75 },
    { "_id": "Otro Sitio", "count": 50 }
  ]
}
```

## 🌐 Ejemplos de Integración

### Desde JavaScript (Frontend)
```javascript
// Enviar visita al cargar la página
fetch('http://localhost:3000/api/track', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    siteName: 'Mi Blog',
    url: window.location.href,
    additionalData: {
      pageTitle: document.title,
      timestamp: new Date().toISOString()
    }
  })
})
.then(res => res.json())
.then(data => console.log('Visita registrada:', data))
.catch(err => console.error('Error:', err));
```

### Desde Node.js (Backend)
```javascript
const axios = require('axios');

async function trackVisit(siteName, url, extraData = {}) {
  try {
    const response = await axios.post('http://localhost:3000/api/track', {
      siteName,
      url,
      additionalData: extraData
    });
    console.log('Visita registrada:', response.data);
  } catch (error) {
    console.error('Error al registrar visita:', error);
  }
}

// Usar
trackVisit('Mi App', 'https://miapp.com/dashboard', {
  userId: '12345',
  action: 'login'
});
```

### Desde PHP
```php
<?php
$data = [
    'siteName' => 'Mi Sitio PHP',
    'url' => 'https://misitio.com/page.php',
    'additionalData' => [
        'userId' => $_SESSION['user_id'] ?? null,
        'browser' => $_SERVER['HTTP_USER_AGENT']
    ]
];

$ch = curl_init('http://localhost:3000/api/track');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
```

### Desde Python
```python
import requests

def track_visit(site_name, url, extra_data=None):
    payload = {
        'siteName': site_name,
        'url': url,
        'additionalData': extra_data or {}
    }
    
    try:
        response = requests.post(
            'http://localhost:3000/api/track',
            json=payload
        )
        print('Visita registrada:', response.json())
    except Exception as e:
        print('Error:', e)

# Usar
track_visit('Mi App Python', 'https://miapp.com/dashboard', {
    'user_id': '12345',
    'action': 'page_view'
})
```

## 🔒 Seguridad

### Para Producción:

1. **Cambiar credenciales:**
   - Modifica `ADMIN_USERNAME` y `ADMIN_PASSWORD` en `.env`

2. **Usar HTTPS:**
   - Cambia `secure: false` a `secure: true` en la configuración de sesiones (app.js)

3. **Proteger MongoDB:**
   - Usa autenticación en MongoDB
   - Cambia la URI de conexión

4. **Rate Limiting:**
   - Considera agregar rate limiting al endpoint `/api/track`

5. **Variables de entorno:**
   - No subas el archivo `.env` a GitHub
   - Usa servicios como dotenv en producción

## 📁 Estructura del Proyecto

```
trakecr_sites/
├── app.js                  # Configuración principal
├── package.json
├── .env                    # Variables de entorno
├── bin/
│   └── www                 # Script de inicio
├── models/
│   └── Visit.js           # Modelo de visita (MongoDB)
├── routes/
│   ├── api.js             # Endpoints API
│   ├── auth.js            # Login/Logout
│   ├── dashboard.js       # Dashboard principal
│   ├── index.js           # Ruta raíz
│   └── users.js
├── middleware/
│   └── auth.js            # Middleware de autenticación
├── views/
│   ├── login.jade         # Página de login
│   ├── dashboard.jade     # Dashboard de visitas
│   └── error.jade
└── public/
    └── stylesheets/
        └── style.css      # Estilos
```

## 🎨 Funcionalidades del Dashboard

- **Ver historial completo** de todas las visitas
- **Paginación** (20 visitas por página)
- **Información detallada:**
  - Nombre del sitio
  - URL visitada
  - IP del visitante
  - User Agent
  - Fecha y hora exacta
- **Eliminar visitas** individuales
- **Limpiar todo** el historial
- **Estadísticas** en tiempo real

## 🐛 Solución de Problemas

### MongoDB no se conecta:
```bash
# Verificar que MongoDB esté corriendo
sudo systemctl status mongod

# Iniciar MongoDB
sudo systemctl start mongod
```

### Puerto 3000 ocupado:
```bash
# Cambiar el puerto en .env
PORT=3001
```

### Error de permisos:
```bash
# En Linux/Mac, dar permisos al directorio de MongoDB
sudo chmod -R 755 /var/lib/mongodb
```

## 📝 Agregar Más Usuarios

Para agregar más usuarios, puedes modificar el archivo `routes/auth.js` para soportar múltiples usuarios:

```javascript
// En .env:
USERS=admin:admin123,usuario2:pass456,usuario3:pass789

// En auth.js, parsear y validar contra múltiples usuarios
```

## 🚀 Despliegue en Producción

### Opciones recomendadas:
- **Heroku** (fácil, con MongoDB Atlas)
- **DigitalOcean** (VPS con control total)
- **AWS/Azure** (escalable)
- **Vercel/Netlify** (requiere serverless functions)

## 📞 Soporte

Para problemas o preguntas, revisa:
1. Los logs de la aplicación
2. Los logs de MongoDB
3. La configuración del archivo `.env`

## 📄 Licencia

MIT
