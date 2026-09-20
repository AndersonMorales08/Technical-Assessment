# Technical Assessment

Consta de una calculadora web full-stack compuesta por un frontend en React + TypeScript y
una API en Go + Gin. Las operaciones se ejecutan en el backend y el frontend
consume la API mediante HTTP.

## Requisitos

- Docker Engine y Docker Compose.
- Para ejecutar los proyectos sin Docker: Node.js, pnpm y Go 1.25 o superior.

## Ejecutar con Docker

Desde la raiz del proyecto:

```bash
docker compose up -d --build
```

Servicios disponibles:

| Servicio | URL | Descripcion |
|----------|-----|-------------|
| Frontend | http://localhost:3000 | Aplicacion React servida por Nginx |
| Backend | http://localhost:8080 | API HTTP de la calculadora |

Para ver los logs o detener los contenedores:

```bash
docker compose logs -f
docker compose down
```

### Como se conectan los contenedores

El frontend se compila con `VITE_CALCULATOR_API_URL=/api/v1`. El navegador
llama al mismo origen, por ejemplo `http://localhost:3000/api/v1/calculator/add`.
Nginx recibe esa peticion y la reenvia internamente a
`http://backend:8080/api/v1/calculator/add`, donde `backend` es el nombre del
servicio dentro de la red creada por Compose.

Esto evita que el navegador tenga que resolver el hostname interno `backend` y
evita CORS entre el frontend servido y la API. El puerto `8080` del backend se
publica tambien en el host para poder probar la API directamente.

## Frontend

El frontend esta en `frontend/` y usa React, TypeScript, Vite y pnpm.

### Ejecutar sin Docker

```bash
cd frontend
pnpm install
pnpm run dev
```

En desarrollo con Vite, `frontend/.env` debe apuntar al backend publicado en el
host:

```env
VITE_CALCULATOR_API_URL=http://localhost:8080/api/v1
```

Otros comandos utiles:

```bash
pnpm run build
pnpm run lint
pnpm exec vitest run
pnpm exec vitest run --coverage
```

En la imagen Docker no se usa `http://backend:8080` en el bundle: esa direccion
solo es resoluble dentro de la red Docker. La imagen usa la ruta relativa
`/api/v1` y el proxy de Nginx realiza la comunicacion interna.

## Backend

El backend esta en `backend/` y usa Go, Gin y una arquitectura hexagonal.

### Ejecutar sin Docker

```bash
cd backend
go mod tidy
make run
```

La API queda disponible en `http://localhost:8080`. Tambien se pueden usar los
comandos definidos en el Makefile:

```bash
make build
make test
make cover
make vet
```

La configuracion se lee desde variables de entorno. Las principales son
`PORT`, `GIN_MODE`, `SHUTDOWN_TIMEOUT` y `CORS_ALLOWED_ORIGINS`.

## API

Todos los endpoints son `POST` y usan JSON. La base de la API es:

```text
/api/v1/calculator
```

### Operaciones

| Endpoint | Cuerpo | Resultado |
|----------|--------|-----------|
| `/add` | `{"a": 5, "b": 3}` | 8 |
| `/subtract` | `{"a": 5, "b": 3}` | 2 |
| `/multiply` | `{"a": 5, "b": 3}` | 15 |
| `/divide` | `{"a": 10, "b": 4}` | 2.5 |
| `/power` | `{"a": 2, "b": 10}` | 1024 |
| `/percentage` | `{"a": 15, "b": 200}` | 30 |
| `/sqrt` | `{"a": 16}` | 4 |

Ejemplos con curl:

```bash
curl -X POST http://localhost:8080/api/v1/calculator/add \
	-H 'Content-Type: application/json' \
	-d '{"a":2,"b":3}'
```

Respuesta:

```json
{"operation":"add","result":5}
```

```bash
curl -X POST http://localhost:8080/api/v1/calculator/sqrt \
	-H 'Content-Type: application/json' \
	-d '{"a":81}'

curl -X POST http://localhost:3000/api/v1/calculator/divide \
	-H 'Content-Type: application/json' \
	-d '{"a":10,"b":4}'
```

La segunda llamada demuestra el flujo completo a traves del proxy Nginx del
frontend.

### Errores

Las respuestas de error tienen esta forma:

```json
{"code":"division_by_zero","message":"division by zero is not allowed"}
```

Codigos HTTP principales:

| Status | Uso |
|--------|-----|
| 400 | JSON invalido, campos faltantes o valores no numericos |
| 422 | Error matematico, como division por cero o raiz negativa |
| 500 | Error interno inesperado |

## Decisiones de diseño

- **Arquitectura hexagonal en el backend:** el dominio y los casos de uso no
	dependen de Gin. Los adaptadores HTTP traducen requests, respuestas y
	errores.
- **Servicio de calculo en el frontend:** la UI recibe un `CalculationService`
	por inyeccion de dependencias. La logica de estado se puede probar sin red y
	el adaptador HTTP queda aislado.
- **Backend como fuente de verdad matematica:** el frontend valida errores de
	entrada simples, pero las operaciones se ejecutan en Go para centralizar las
	reglas y el manejo de resultados indefinidos o demasiado grandes.
- **Proxy inverso con Nginx en Docker:** el navegador usa una URL relativa y
	Nginx resuelve `backend` dentro de Compose. Esto evita exponer nombres
	internos al navegador y simplifica CORS.
- **Build multi-stage:** el frontend se compila con Node y se sirve con una
	imagen ligera de Nginx; el backend se compila como binario estatico y se
	ejecuta en una imagen distroless.
- **Cancelacion de peticiones:** `AbortController` cancela solicitudes en
	curso cuando el usuario pulsa AC o desmonta la pantalla.
- **Configuracion por entorno:** las URLs y opciones del backend no estan
	codificadas en la logica de negocio. Las variables `VITE_*` se incrustan en
	el frontend durante el build.

## Estructura principal

```text
.
├── docker-compose.yaml
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── Makefile
│   ├── go.mod
│   ├── cmd/api/main.go
│   └── internal/
│       ├── adapters/inbound/rest/
│       │   ├── calculator_handler.go
│       │   ├── middleware.go
│       │   ├── router.go
│       │   └── dto.go
│       ├── config/config.go
│       └── core/
│           ├── domain/
│           ├── port/
│           └── service/
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── .env.example
│   └── src/
│       ├── App.tsx
│       ├── shared/api/
│       │   └── httpClient.ts
│       └── features/calculator/
│           ├── Calculator.tsx
│           ├── api/httpCalculationService.ts
│           ├── components/
│           ├── config/
│           ├── hooks/
│           └── logic/
│               ├── reducer.ts
│               ├── resolveCalculation.ts
│               ├── validation.ts
│               └── types.ts
└── .gitignore
```