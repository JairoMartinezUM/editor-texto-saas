# Editor de Texto SaaS

Editor de documentos de texto que se usa desde el navegador y vive en un servidor, para ilustrar el modelo **SaaS** (Software as a Service). Proyecto de la materia *Tecnologías de Desarrollo de Software*.

El repositorio tiene dos aplicaciones independientes:

| Carpeta | Qué es | Stack |
|---|---|---|
| `backend/` | API REST + interfaz web **CloudDoc** (servida como archivos estáticos) | Spring Boot 4.1, Java 21, Spring Data JPA, base de datos H2 en memoria |
| `frontend/` | Primera versión de la interfaz en React (aún no conectada al backend) | React 19 + Vite 8 |

## Qué hace hoy

- Crear un documento nuevo, **guardarlo**, **abrir** uno existente desde la lista y eliminarlo.
- Editor enriquecido (negrita, cursiva, subrayado, encabezados, listas, color, enlaces) con contador de palabras y caracteres.
- Interfaz responsiva con Bootstrap 5.3: panel lateral en escritorio y cajón deslizable en móvil.
- Búsqueda de documentos por título.

**Aún no incluye** autenticación (usuario y contraseña), y los datos se pierden al reiniciar el servidor porque H2 trabaja en memoria. El frontend React todavía no consume la API.

## API REST

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/status` | Comprueba que el servicio está arriba |
| GET | `/api/documentos` | Lista los documentos |
| GET | `/api/documentos/{id}` | Obtiene un documento |
| POST | `/api/documentos` | Crea un documento (`titulo` obligatorio) |
| PUT | `/api/documentos/{id}` | Actualiza título y contenido |
| DELETE | `/api/documentos/{id}` | Elimina un documento |

Un documento tiene: `id`, `titulo`, `contenido`, `autor`, `fechaCreacion` y `fechaModificacion`.

## Cómo ejecutarlo

### Backend (requiere JDK 21)

```bash
cd backend
./mvnw spring-boot:run        # en Windows: .\mvnw.cmd spring-boot:run
```

Abre http://localhost:8080 para la interfaz CloudDoc. La consola de H2 está en http://localhost:8080/h2-console (JDBC URL `jdbc:h2:mem:editordb`, usuario `sa`, sin contraseña).

### Frontend (requiere Node.js 20.19+ o 22.12+)

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

### Con Docker

```bash
docker compose up --build -d
```

- Backend: http://localhost:8080
- Frontend (Nginx): http://localhost:3000

Para detenerlo: `docker compose down`.

## Estructura

```
editor-texto-saas/
├── docker-compose.yml
├── backend/          Spring Boot (controller / service / repository / model)
│   ├── Dockerfile
│   └── src/main/resources/static/   ← interfaz CloudDoc (index.html, css/, js/)
└── frontend/         React + Vite
    ├── Dockerfile
    └── nginx.conf
```

## Informe

Informe del software en PDF (A1-U1): [docs/Informe_A1-U1_Editor_Texto_SaaS.pdf](docs/Informe_A1-U1_Editor_Texto_SaaS.pdf)
