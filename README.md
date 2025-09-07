# Chat IA - Next.js 14 + TypeScript + Tailwind + next-intl

Una aplicación de chat con inteligencia artificial que utiliza Next.js 14, TypeScript, Tailwind CSS y next-intl para internacionalización. La aplicación se integra con n8n a través de Server-Sent Events (SSE) para proporcionar respuestas en tiempo real.

## 🚀 Características

- ✅ Next.js 14 con App Router
- ✅ TypeScript para tipado estático
- ✅ Tailwind CSS para estilos
- ✅ next-intl para internacionalización (Español)
- ✅ Integración con n8n via webhooks
- ✅ Server-Sent Events (SSE) para streaming en tiempo real
- ✅ Troceo automático de respuestas (600-800 caracteres)
- ✅ Tests E2E con Playwright
- ✅ Soporte para fuentes y métricas de uso

## 📋 Requisitos Previos

- Node.js 18+ instalado
- pnpm instalado (`npm install -g pnpm`)
- Una instancia de n8n configurada con un webhook de chat

## 🛠️ Instalación

1. **Clonar e instalar dependencias:**
   ```bash
   pnpm install
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env.local
   ```
   
   Editar `.env.local` con tus configuraciones:
   ```env
   # Configuración de N8N
   N8N_BASE_URL=http://localhost:5678
   N8N_WEBHOOK_PATH=/webhook/chat
   
   # Configuración de Next.js
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Ejecutar en modo desarrollo:**
   ```bash
   pnpm dev
   ```
   
   La aplicación estará disponible en: http://localhost:3000

## 🔧 Configuración de N8N

### Configuración del Webhook

1. **Crear un nuevo workflow en n8n**
2. **Añadir un nodo "Webhook"** con la configuración:
   - **HTTP Method:** POST
   - **Path:** `/webhook/chat` (o el que configures en `N8N_WEBHOOK_PATH`)
   - **Response Mode:** Immediately

3. **Mapeo de la solicitud:** El webhook recibirá:
   ```json
   {
     "chatInput": "string",
     "topK": 5,
     "temperature": 0.7
   }
   ```

4. **Mapeo de la respuesta:** El webhook debe devolver:
   ```json
   {
     "output": "string",
     "sources": ["string[]"] // opcional
     "usage": {              // opcional
       "tokens": "number",
       "cost": "number"
     }
   }
   ```

### Variables de Entorno para N8N

- **`N8N_BASE_URL`**: URL base de tu instancia de n8n
  - Desarrollo local: `http://localhost:5678`
  - Producción: `https://tu-dominio-n8n.com`

- **`N8N_WEBHOOK_PATH`**: Ruta del webhook en n8n
  - Formato: `/webhook/chat` o `/webhook-test/tu-webhook-id`
  - Debe coincidir con la ruta configurada en el nodo Webhook de n8n

## 🧪 Tests

### Ejecutar tests E2E con Playwright:

```bash
# Ejecutar todos los tests
pnpm test

# Ejecutar tests con interfaz gráfica
pnpm test:ui

# Ejecutar tests en modo headed (ver navegador)
npx playwright test --headed
```

### Tests incluidos:

- ✅ Renderizado correcto de la interfaz de chat
- ✅ Manejo de mensajes vacíos
- ✅ Envío y recepción de mensajes
- ✅ Respuestas en streaming (SSE)
- ✅ Limpieza del chat
- ✅ Manejo de errores de API
- ✅ Atajos de teclado (Enter para enviar)

## 📁 Estructura del Proyecto

```
chat/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx     # Layout con next-intl
│   │   │   └── page.tsx       # Página principal
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── send/
│   │   │           └── route.ts # Endpoint SSE
│   │   ├── globals.css        # Estilos globales
│   │   └── page.tsx           # Redirección a locale
│   ├── components/
│   │   └── ChatComponent.tsx  # Componente principal del chat
│   ├── i18n/
│   │   └── routing.ts         # Configuración de rutas
│   ├── types/
│   │   └── chat.ts            # Tipos TypeScript
│   └── i18n.ts                # Configuración de next-intl
├── messages/
│   └── es.json                # Traducciones en español
├── tests/
│   └── chat-flow.spec.ts      # Tests E2E de Playwright
├── .env.example               # Variables de entorno de ejemplo
├── package.json               # Dependencias y scripts
├── tailwind.config.js         # Configuración de Tailwind
├── playwright.config.ts       # Configuración de Playwright
└── README.md                  # Este archivo
```

## 🎯 Funcionalidades Clave

### API de Chat (`/api/chat/send`)

- **Método:** POST
- **Content-Type:** application/json
- **Response:** text/event-stream (SSE)

**Entrada:**
```json
{
  "chatInput": "Tu mensaje aquí",
  "topK": 5,
  "temperature": 0.7
}
```

**Salida (SSE):**
```
data: {"chunk": "Parte de la respuesta", "isLast": false}
data: {"chunk": "Final de respuesta", "isLast": true, "sources": [...], "usage": {...}}
```

### Componente de Chat

- **data-testid:** Todos los elementos tienen identificadores para testing
- **Streaming:** Respuestas en tiempo real con troceo automático
- **Internacionalización:** Textos en español usando next-intl
- **Responsive:** Diseño adaptativo con Tailwind CSS

## 🚀 Scripts Disponibles

```bash
# Desarrollo
pnpm dev          # Ejecutar en modo desarrollo

# Construcción
pnpm build        # Construir para producción
pnpm start        # Ejecutar build de producción

# Calidad de código
pnpm lint         # Ejecutar ESLint

# Testing
pnpm test         # Ejecutar tests de Playwright
pnpm test:ui      # Interfaz gráfica de tests
```

## 🔧 Tecnologías Utilizadas

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Internacionalización:** next-intl
- **Testing:** Playwright
- **Gestor de paquetes:** pnpm
- **Integración:** n8n (webhooks + SSE)

## 📝 Notas de Desarrollo

1. **Troceo de Respuestas:** Las respuestas largas de n8n se trocan automáticamente en segmentos de 600-800 caracteres para mejorar la experiencia de streaming.

2. **Manejo de Errores:** La aplicación maneja errores de red, errores de n8n y timeouts de manera robusta.

3. **Accesibilidad:** Todos los elementos interactivos tienen `data-testid` para facilitar el testing automatizado.

4. **Internacionalización:** Configurado para español (es-ES) con posibilidad de expandir a otros idiomas.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.