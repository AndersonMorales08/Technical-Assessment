import { afterEach, describe, expect, it, vi } from "vitest";
import { HttpError, createHttpClient } from "./httpClient";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

afterEach(() => fetchMock.mockReset());

describe("createHttpClient", () => {
  it("envía un POST JSON a baseUrl + path con las cabeceras configuradas", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ result: 5 }));
    const client = createHttpClient({ baseUrl: "https://localhost:8080/api/v1/", headers: { "X-Api-Key": "k" } });

    const payload = await client.post("/calculate", { a: 1 });

    expect(payload).toEqual({ result: 5 });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://localhost:8080/api/v1/calculate"); // sin doble barra
    expect(init.method).toBe("POST");
    expect(init.body).toBe('{"a":1}');
    expect(init.headers).toMatchObject({ "Content-Type": "application/json", "X-Api-Key": "k" });
  });

  it("lanza HttpError con el código y el cuerpo cuando la respuesta no es 2xx", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "mal" }, 422));
    const client = createHttpClient({ baseUrl: "https://localhost:8080/api/v1" });

    const error = await client.post("/calculate", {}).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({ status: 422, body: { error: "mal" } });
  });

  it("tolera un cuerpo que no es JSON", async () => {
    fetchMock.mockResolvedValue(new Response("<html>", { status: 502 }));
    const client = createHttpClient({ baseUrl: "https://localhost:8080/api/v1" });

    await expect(client.post("/calculate", {})).rejects.toMatchObject({ status: 502, body: null });
  });

  it("cancela la petición cuando se aborta la señal recibida", async () => {
    fetchMock.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => reject(new DOMException("x", "AbortError")));
        }),
    );
    const controller = new AbortController();
    const client = createHttpClient({ baseUrl: "https://localhost:8080/api/v1" });

    const request = client.post("/calculate", {}, controller.signal);
    controller.abort();

    await expect(request).rejects.toMatchObject({ name: "AbortError" });
  });

  it("aborta con TimeoutError cuando el servidor tarda más del límite", async () => {
    fetchMock.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => reject(init.signal?.reason));
        }),
    );
    const client = createHttpClient({ baseUrl: "https://localhost:8080/api/v1", timeoutMs: 20 });

    await expect(client.post("/calculate", {})).rejects.toMatchObject({ name: "TimeoutError" });
  });
});
