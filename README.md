# Tazi's Market — Frontend

Tazi's Market es una tienda de videojuegos retro con la energía de un mercado clandestino y productos legales: cartuchos, consolas y hallazgos de colección. Este frontend forma parte de un proyecto full stack; el backend vive en un repositorio separado: [https://github.com/TaziING/tazis-market-backend].

## Stack Tecnológico

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- React Router
- Axios
- Context API

## Características

- Explora un catálogo de consolas y juegos retro con búsqueda y filtros por categoría, precio y rareza.
- Consulta detalles, disponibilidad y precio de cada producto.
- Crea una cuenta e inicia sesión para hacer pedidos.
- Guarda productos en el carrito y ajusta las cantidades según el stock disponible.
- Finaliza compras y consulta el historial de pedidos; los pedidos pendientes se pueden cancelar.
- Accede, con una cuenta administradora, a paneles para gestionar productos y categorías.
- Usa la tienda desde pantallas grandes o dispositivos móviles.

## Diseño

La dirección visual combina la energía gráfica de Persona 5 con una estética de catálogo retro de mercado negro: fondos oscuros, cortes diagonales y acentos de alto contraste. La paleta usa Void `#0A0A0A`, Alarm `#E11D2E`, Blood `#7A1220`, Bone `#EDEAE2`, Contraband `#C9A227` y Shadow `#161616`. Los títulos usan Anton y el texto de interfaz usa Space Grotesk.

## Instalación y uso local

1. Clona el repositorio y entra en la carpeta del frontend:

   ```bash
   git clone <URL_DEL_REPOSITORIO_FRONTEND>
   cd <CARPETA_DEL_REPOSITORIO>/frontend
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Crea un archivo `.env` en la raíz de `frontend/` y configura la URL base del backend:

   ```env
   VITE_API_URL=http://localhost:3001
   ```

   Si no defines esta variable, la aplicación usa `http://localhost:3001` como fallback.

4. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

El frontend requiere que el backend esté corriendo en paralelo para cargar el catálogo, autenticar usuarios y procesar pedidos.

## Estructura del proyecto

```text
src/
├── components/  Componentes de interfaz reutilizables, navegación y rutas protegidas.
├── pages/       Páginas del catálogo, cuenta, carrito, pedidos y administración.
├── context/     Estado compartido de autenticación y carrito.
├── lib/         Configuración de Axios y acceso a la API.
└── types/       Interfaces TypeScript compartidas.
```

## Decisiones técnicas

### Context API para estado global

El estado compartido se limita principalmente a la sesión y al carrito, por lo que Context API cubre las necesidades actuales sin añadir una librería externa. Esto mantiene el flujo de datos sencillo y evita incorporar más infraestructura de estado de la necesaria para el tamaño del proyecto.

### Carrito en el frontend y localStorage

Guardar el carrito en el navegador permite conservarlo al recargar la página y mantener la experiencia de compra mientras el usuario aún no inicia sesión. Al crear la orden, el backend vuelve a validar productos y stock y registra los precios de compra.

### Protección de rutas administrativas

`ProtectedRoute` concentra la comprobación de sesión y rol antes de renderizar las rutas administrativas. Así, las páginas comparten la misma regla de acceso en lugar de repetirla; las operaciones administrativas también están protegidas por el backend.
