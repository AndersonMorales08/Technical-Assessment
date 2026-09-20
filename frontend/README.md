# Calculadora (React + TypeScript)

Las operaciones (+ − × ÷ ^ √ %) las resuelve un **endpoint externo**.

```
src/
├── App.tsx                          Raíz de composición: crea el cliente HTTP y el servicio
├── shared/
│   ├── api/httpClient.ts            Cliente HTTP genérico (URL base, JSON, timeout, errores)
│   └── utils/classNames.ts
├── types/                           css.d.ts y env.d.ts (bórralos si usas Vite)
└── features/calculator/
    ├── index.ts                     API pública
    ├── Calculator.tsx               Recibe `service` por props
    ├── api/
    │   └── httpCalculationService.ts   ★ Contrato con el endpoint (único archivo a adaptar)
    ├── logic/                       Lógica pura, sin React ni fetch
    │   ├── handlers/                Una función por acción; applyResult recibe la respuesta
    │   ├── reducer.ts               Anota QUÉ calcular en `state.pending`
    │   ├── resolveCalculation.ts    Ejecuta el cálculo pendiente con un servicio
    │   ├── validation.ts            Reglas de entrada (÷ 0, √ de negativo) sin llamar al servidor
    │   └── types.ts, constants.ts, format.ts, errors.ts …
    ├── hooks/                       useCalculator (hace la petición), useKeyboardShortcuts
    ├── config/                      Distribución de teclas y atajos
    ├── components/                  Display, Keypad, Key (cada uno con su CSS Module)
    └── styles/tokens.css            Colores y tipografía
```

## Flujo de una operación

```
"=" → reducer (puro) → state.pending = { qué calcular }
    → useCalculator lo detecta y llama a service.calculate(...)   ← única parte con red
    → respuesta → dispatch(calculationSucceeded | calculationFailed) → reducer → pantalla
```

- Mientras hay una petición en curso la pantalla se atenúa (`aria-busy`) y las teclas se ignoran.
- **AC** cancela la petición (`AbortController`) y descarta cualquier respuesta tardía.
- Los errores de red, timeout, HTTP 4xx/5xx o respuestas mal formadas se muestran como mensajes
  para el usuario (textos en `logic/constants.ts`).

## Contrato supuesto con el endpoint

```
POST {VITE_CALCULATOR_API_URL}/calculator/{operation}
Petición:  { "a": number, "b": number }
Respuesta: { "result": number }
```

`percent`: `[valor]` → valor / 100 · `[base, valor]` → valor % de base (para `200 + 10 %`).

Si tu endpoint es distinto, **solo cambia `api/httpCalculationService.ts`**: la ruta, los nombres
de operación, la forma del cuerpo y cómo se lee el resultado. El resto no se toca.

## Configuración

```bash
cp .env.example .env     # y pon la URL base de tu endpoint
```

- **Protocolo local:** el backend incluido escucha HTTP en `localhost:8080`; usa `http://`, no `https://`, salvo que configures TLS explícitamente.
- **CORS:** si el endpoint está en otro dominio, debe permitir tu origen
  (`Access-Control-Allow-Origin`). En desarrollo puedes evitarlo con el `server.proxy` de Vite.
  Un fallo de CORS aparece como "No se pudo conectar con el servidor".
- **Autenticación:** `createHttpClient({ headers: { Authorization: "Bearer …" } })`. No pongas
  claves secretas en el frontend: cualquier cabecera fija es visible en el navegador.
- **Modo desarrollo de React:** `<StrictMode>` ejecuta los efectos dos veces, así que verás la
  petición duplicada (la primera se cancela). En producción es una sola.

## Tests

```bash
npm i -D vitest jsdom @testing-library/react @testing-library/dom
npx vitest run
```

Cubren la lógica, el contrato HTTP (cuerpos y traducción de errores), el cliente `fetch` y el
componente completo con un servicio falso.
