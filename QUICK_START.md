# 🚀 INICIO RÁPIDO - Tracker Sites

## ⚡ Pasos para empezar en 3 minutos

### 1. Asegúrate de tener MongoDB ejecutándose

```bash
# Iniciar MongoDB (Linux/Mac)
sudo systemctl start mongod

# O simplemente
mongod

# En Windows
net start MongoDB
```

### 2. Instalar dependencias (si no lo has hecho)

```bash
npm install
```

### 3. Configurar credenciales

Edita el archivo `.env` y cambia el usuario y contraseña:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 4. Iniciar la aplicación

```bash
npm start
```

### 5. Abrir el navegador

Ve a: **http://localhost:3000**

- Usuario: `admin`
- Contraseña: `admin123`

---

## 📡 Probar el API

En otra terminal, ejecuta:

```bash
node test-api.js
```

Esto enviará visitas de prueba y podrás verlas en el dashboard.

---

## 🔧 Enviar visitas desde tu aplicación

### Ejemplo simple con fetch:

```javascript
fetch('http://localhost:3000/api/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    siteName: 'Mi Sitio',
    url: 'https://misitio.com/pagina'
  })
})
```

### Ejemplo con curl:

```bash
curl -X POST http://localhost:3000/api/track \
  -H "Content-Type: application/json" \
  -d '{"siteName":"Mi App","url":"https://miapp.com"}'
```

---

## ✅ ¿Qué puedes hacer?

- ✓ Ver todas las visitas en tiempo real
- ✓ Filtrar por página
- ✓ Eliminar visitas individuales
- ✓ Limpiar todo el historial
- ✓ Ver estadísticas

---

## 📚 Más información

Lee el archivo `README.md` para documentación completa.

---

## ⚠️ Problemas comunes

**Puerto 3000 ocupado:**
```bash
# Cambiar el puerto en .env
PORT=3001
```

**MongoDB no conecta:**
```bash
# Verificar que MongoDB esté corriendo
sudo systemctl status mongod
```

**Error al instalar dependencias:**
```bash
# Limpiar cache de npm
npm cache clean --force
npm install
```
