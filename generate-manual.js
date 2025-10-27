const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } = require('docx');

async function generateManual() {
  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title page
          new Paragraph({
            text: "Manual de Usuario",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "Sistema de Chatbot Inteligente",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "Versión 1.0",
            alignment: AlignmentType.CENTER,
          }),
          new PageBreak(),
          
          // Table of contents
          new Paragraph({
            text: "Tabla de Contenidos",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph("1. Introducción .................................................................................................................... 3"),
          new Paragraph("2. Requisitos del Sistema ................................................................................................. 4"),
          new Paragraph("3. Instalación y Configuración ......................................................................................... 5"),
          new Paragraph("4. Inicio de Sesión y Registro .......................................................................................... 6"),
          new Paragraph("5. Interfaz de Usuario ........................................................................................................ 7"),
          new Paragraph("6. Funcionalidades Principales ....................................................................................... 9"),
          new Paragraph("7. Gestión de Archivos ................................................................................................... 11"),
          new Paragraph("8. Personalización del Tema .......................................................................................... 13"),
          new Paragraph("9. Preguntas Frecuentes ................................................................................................. 14"),
          new Paragraph("10. Soporte Técnico .......................................................................................................... 15"),
          new PageBreak(),
          
          // Chapter 1: Introduction
          new Paragraph({
            text: "1. Introducción",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph("El Sistema de Chatbot Inteligente es una aplicación web avanzada diseñada para proporcionar una experiencia de chat intuitiva y eficiente. Esta herramienta permite a los usuarios interactuar con inteligencia artificial basada en Google Gemini, cargar documentos para análisis y realizar preguntas sobre ellos."),
          new Paragraph("Este manual tiene como objetivo guiar al usuario a través de todas las funcionalidades del sistema, desde la instalación inicial hasta el uso avanzado de sus características principales."),
          new PageBreak(),
          
          // Chapter 2: System Requirements
          new Paragraph({
            text: "2. Requisitos del Sistema",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph("Para utilizar el Sistema de Chatbot Inteligente, se requiere:"),
          new Paragraph("• Navegador web moderno (Chrome, Firefox, Safari, Edge)"),
          new Paragraph("• Conexión a Internet estable"),
          new Paragraph("• Cuenta de Google (para autenticación)"),
          new Paragraph("• Acceso a la API de Google Gemini (proporcionada por el administrador)"),
          new PageBreak(),
          
          // Chapter 3: Installation and Configuration
          new Paragraph({
            text: "3. Instalación y Configuración",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph("Pasos para la instalación:"),
          new Paragraph("1. Clonar el repositorio del proyecto desde el sistema de control de versiones"),
          new Paragraph("2. Instalar las dependencias ejecutando el comando:"),
          new Paragraph("   npm install"),
          new Paragraph("3. Crear un archivo .env.local en la raíz del proyecto con las siguientes variables:"),
          new Paragraph("   GOOGLE_GEMINI_API_KEY=your_api_key_here"),
          new Paragraph("   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key"),
          new Paragraph("   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain"),
          new Paragraph("   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id"),
          new Paragraph("4. Iniciar el servidor de desarrollo:"),
          new Paragraph("   npm run dev"),
          new Paragraph("5. Acceder a la aplicación en http://localhost:3000"),
          new PageBreak(),
          
          // Chapter 4: Login and Registration
          new Paragraph({
            text: "4. Inicio de Sesión y Registro",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph("Registro de nuevos usuarios:"),
          new Paragraph("1. En la página de inicio, seleccionar la opción \"Registrarse\""),
          new Paragraph("2. Completar el formulario con nombre, correo electrónico y contraseña"),
          new Paragraph("3. Hacer clic en \"Registrarse\""),
          new Paragraph("Inicio de sesión:"),
          new Paragraph("1. Ingresar el correo electrónico y contraseña registrados"),
          new Paragraph("2. Hacer clic en \"Iniciar Sesión\""),
          new Paragraph("Inicio de sesión con Google:"),
          new Paragraph("1. Hacer clic en el botón \"Iniciar sesión con Google\""),
          new Paragraph("2. Seleccionar la cuenta de Google deseada"),
          new Paragraph("3. Autorizar el acceso a la aplicación"),
          new PageBreak(),
          
          // Chapter 5: User Interface
          new Paragraph({
            text: "5. Interfaz de Usuario",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph("La interfaz de usuario está dividida en las siguientes áreas principales:"),
          new Paragraph("Barra superior:"),
          new Paragraph("• Botón de menú para acceder a sesiones anteriores"),
          new Paragraph("• Título de la sesión actual"),
          new Paragraph("• Botones de acción: Nueva Conversación, Limpiar Chat, Cerrar Sesión"),
          new Paragraph("• Botón de cambio de tema (claro/oscuro)"),
          new Paragraph("Panel lateral (menú):"),
          new Paragraph("• Lista de sesiones de chat anteriores"),
          new Paragraph("• Opción para crear una nueva conversación"),
          new Paragraph("Área principal de chat:"),
          new Paragraph("• Visualización de mensajes enviados y recibidos"),
          new Paragraph("• Indicadores de estado (cargando, errores)"),
          new Paragraph("Barra inferior:"),
          new Paragraph("• Campo de texto para escribir mensajes"),
          new Paragraph("• Botón para enviar mensajes"),
          new Paragraph("• Botón para subir archivos"),
          new PageBreak(),
          
          // Chapter 6: Main Features
          new Paragraph({
            text: "6. Funcionalidades Principales",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph("Chat con inteligencia artificial:"),
          new Paragraph("El sistema utiliza Google Gemini para generar respuestas inteligentes a las preguntas del usuario. Para interactuar con el chatbot:"),
          new Paragraph("1. Escribir una pregunta en el campo de texto inferior"),
          new Paragraph("2. Presionar Enter o hacer clic en el botón \"Enviar\""),
          new Paragraph("3. Esperar la respuesta del chatbot que aparecerá en tiempo real"),
          new Paragraph("Gestión de sesiones:"),
          new Paragraph("• Crear nuevas sesiones de chat haciendo clic en \"Nueva Conversación\""),
          new Paragraph("• Cambiar entre sesiones usando el menú lateral"),
          new Paragraph("• Eliminar sesiones innecesarias"),
          new Paragraph("• Las sesiones se guardan automáticamente"),
          new PageBreak(),
          
          // Chapter 7: File Management
          new Paragraph({
            text: "7. Gestión de Archivos",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph("Carga de documentos:"),
          new Paragraph("El sistema permite cargar documentos PDF y de Word (.doc, .docx) para realizar preguntas sobre su contenido. Para cargar un archivo:"),
          new Paragraph("1. Hacer clic en el botón \"Subir archivo\" en la barra inferior"),
          new Paragraph("2. Seleccionar el archivo desde el explorador de archivos"),
          new Paragraph("3. Esperar a que se complete la carga"),
          new Paragraph("4. El sistema extraerá automáticamente el texto del documento"),
          new Paragraph("Formatos compatibles:"),
          new Paragraph("• PDF (.pdf)"),
          new Paragraph("• Documentos de Word (.doc, .docx)"),
          new Paragraph("Límites:"),
          new Paragraph("• Tamaño máximo: 10 MB por archivo"),
          new Paragraph("• Solo se pueden cargar archivos uno a la vez"),
          new Paragraph("Hacer preguntas sobre documentos:"),
          new Paragraph("Una vez cargado un documento, se puede hacer preguntas específicas sobre su contenido. El sistema utilizará el texto extraído del documento para generar respuestas relevantes."),
          new PageBreak(),
          
          // Chapter 8: Theme Customization
          new Paragraph({
            text: "8. Personalización del Tema",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph("Cambio entre tema claro y oscuro:"),
          new Paragraph("El sistema ofrece dos temas visuales para adaptarse a las preferencias del usuario:"),
          new Paragraph("1. Tema claro (por defecto)"),
          new Paragraph("2. Tema oscuro"),
          new Paragraph("Para cambiar entre temas:"),
          new Paragraph("1. Hacer clic en el botón de cambio de tema en la barra superior (ícono de sol/luna)"),
          new Paragraph("2. El sistema recordará la preferencia seleccionada"),
          new Paragraph("3. La elección se aplica automáticamente en futuras sesiones"),
          new PageBreak(),
          
          // Chapter 9: FAQ
          new Paragraph({
            text: "9. Preguntas Frecuentes",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph("¿Cómo puedo restablecer mi contraseña?"),
          new Paragraph("Actualmente, el sistema no incluye una función de recuperación de contraseña. Si olvida su contraseña, deberá ponerse en contacto con el administrador del sistema."),
          new Paragraph("¿Qué tipo de preguntas puede responder el chatbot?"),
          new Paragraph("El chatbot puede responder una amplia variedad de preguntas, especialmente aquellas relacionadas con documentos cargados. También puede mantener conversaciones generales y responder preguntas básicas."),
          new Paragraph("¿Dónde se almacenan mis conversaciones?"),
          new Paragraph("Las conversaciones se almacenan localmente en su navegador. No se envían a ningún servidor externo más allá de la API de Google Gemini para generar respuestas."),
          new Paragraph("¿Puedo usar el sistema sin conexión?"),
          new Paragraph("No, el sistema requiere una conexión a Internet activa para funcionar correctamente, ya que depende de servicios en la nube como Google Gemini y Firebase."),
          new PageBreak(),
          
          // Chapter 10: Technical Support
          new Paragraph({
            text: "10. Soporte Técnico",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph("Para problemas técnicos o consultas adicionales, póngase en contacto con el equipo de soporte técnico:"),
          new Paragraph("Email: soporte@chatbot.com"),
          new Paragraph("Teléfono: +1 (555) 123-4567"),
          new Paragraph("Horario de atención: Lunes a Viernes, 9:00 AM - 6:00 PM"),
          new Paragraph("Este manual fue creado el 26 de octubre de 2025 y corresponde a la versión 1.0 del Sistema de Chatbot Inteligente."),
        ],
      },
    ],
  });

  // Export the document
  const exportPath = "Manual_de_Usuario_Chatbot_Final.docx";
  
  // Pack and save the document
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(exportPath, buffer);
  console.log(`Documento generado exitosamente: ${exportPath}`);
}

// Run the function
generateManual().catch(console.error);
