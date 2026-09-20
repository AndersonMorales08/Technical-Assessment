# Calculadora API · Go + Gin · Arquitectura Hexagonal

## Estructura

```
.
├── cmd/api/main.go                     # Composition root (wiring + graceful shutdown)
└── internal/
    ├── config/                         # Configuración desde variables de entorno
    ├── core/                           # NÚCLEO: no depende de Gin
    │   ├── domain/                     # Operaciones matemáticas + errores de dominio
    │   ├── port/                       # Interfaces (input.go)
    │   └── service/                    # Casos de uso
    └── adapters/
        └── inbound/rest/               # Gin: handlers, DTOs, router, middleware, mapeo de errores
```

Regla de dependencias: `adapters ──► core/port ◄── core/service ──► core/domain`

## Endpoints

Todos son `POST` con cuerpo JSON bajo `/api/v1/calculator`.

| Endpoint      | Body                  | Operación            |
|---------------|-----------------------|----------------------|
| `/add`        | `{"a": 5, "b": 3}`    | a + b                |
| `/subtract`   | `{"a": 5, "b": 3}`    | a - b                |
| `/multiply`   | `{"a": 5, "b": 3}`    | a × b                |
| `/divide`     | `{"a": 10, "b": 4}`   | a ÷ b                |
| `/power`      | `{"a": 2, "b": 10}`   | a elevado a b        |
| `/percentage` | `{"a": 15, "b": 200}` | a% de b              |
| `/sqrt`       | `{"a": 16}`           | √a                   |

Respuesta exitosa (200): `{"operation":"add","result":8}`

Respuesta de error: `{"code":"division_by_zero","message":"division by zero is not allowed"}`

| Status | code                   | Cuándo                                          |
|--------|------------------------|-------------------------------------------------|
| 400    | `invalid_request`      | JSON inválido, campo faltante o no numérico     |
| 422    | `division_by_zero`     | División entre 0                                |
| 422    | `negative_square_root` | Raíz cuadrada de un número negativo             |
| 422    | `undefined_result`     | Ej. 0^-1, o base negativa con exponente decimal |
| 422    | `result_overflow`      | Resultado demasiado grande para representarse   |
| 500    | `internal_error`       | Error inesperado                                |

## Ejecutar

```bash
cp .env.example .env
go mod tidy
make run
make test
```

```bash
curl -X POST localhost:8080/api/v1/calculator/divide \
  -H 'Content-Type: application/json' -d '{"a":10,"b":4}'
```

## Agregar una operación nueva

1. `core/domain/operations.go`: la función + sus errores (si los hay) en `errors.go`.
2. `core/port/input.go`: el método en `CalculatorService`.
3. `core/service/calculator_service.go`: el método que delega en el dominio.
4. `adapters/inbound/rest/calculator_handler.go`: una línea en `RegisterRoutes`.
5. `adapters/inbound/rest/errors.go`: solo si creaste un error de dominio nuevo.
