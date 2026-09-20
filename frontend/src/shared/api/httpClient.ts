export interface HttpClient {
  /** Devuelve el cuerpo JSON sin validar (`unknown`): quien llama debe comprobarlo. */
  post(path: string, body: unknown, signal?: AbortSignal): Promise<unknown>;
}

export interface HttpClientOptions {
  baseUrl: string;
  timeoutMs?: number;
  /** Cabeceras fijas (p. ej. Authorization). Todo lo que pongas aquí es visible en el navegador. */
  headers?: Record<string, string>;
}

const DEFAULT_TIMEOUT_MS = 8_000;

/** Respuesta con un código HTTP distinto de 2xx. */
export class HttpError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(`HTTP ${status}`);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}

export function createHttpClient({
  baseUrl,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  headers = {},
}: HttpClientOptions): HttpClient {
  const root = baseUrl.replace(/\/$/, "");

  return {
    async post(path, body, signal) {
      const timeout = AbortSignal.timeout(timeoutMs);
      console.log(`Base url: ${baseUrl}`);
      console.log(`Url: ${root}${path}`);

      const response = await fetch(`${root}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", ...headers },
        body: JSON.stringify(body),
        signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      });

      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new HttpError(response.status, payload);

      return payload;
    },
  };
}
