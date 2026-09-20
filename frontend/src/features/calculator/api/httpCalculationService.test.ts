import { describe, expect, it, vi } from "vitest";
import { HttpError, type HttpClient } from "../../../shared/api/httpClient";
import { CalculationError, ERROR_MESSAGES, type CalculationRequest } from "../logic";
import { createHttpCalculationService } from "./httpCalculationService";

const OPERATION_NAMES: Record<string, string> = {
  "suma": "add",
  "resta": "subtract",
  "multiplicación": "multiply",
  "división": "divide",
  "potencia": "power",
  "porcentaje sobre base": "percentage",
  "raíz": "sqrt",
};
/** Cliente HTTP falso que responde con un valor o falla con un error. */
function fakeClient(outcome: { returns: unknown } | { fails: unknown }) {
  const post = vi.fn<HttpClient["post"]>(() =>
    "fails" in outcome ? Promise.reject(outcome.fails) : Promise.resolve(outcome.returns),
  );
  const client: HttpClient = { post };
  return { client, post };
}

const sqrtOf4: CalculationRequest = { kind: "sqrt", value: 4 };

describe("createHttpCalculationService", () => {
  it.each<[string, CalculationRequest, unknown]>([
    ["suma", { kind: "binary", operator: "+", left: 2, right: 3 }, {"a": 2, "b": 3}],
    ["resta", { kind: "binary", operator: "-", left: 9, right: 4 }, {"a": 9, "b": 4}],
    ["multiplicación", { kind: "binary", operator: "*", left: 6, right: 7 }, {"a": 6, "b": 7}],
    ["división", { kind: "binary", operator: "/", left: 8, right: 2 }, {"a": 8, "b": 2}],
    ["potencia", { kind: "binary", operator: "^", left: 2, right: 10 }, {"a": 2, "b": 10}],
    ["raíz", { kind: "sqrt", value: 81 }, {"a": 81}],
    ["porcentaje sobre base", { kind: "percent", value: 10, base: 200 }, {"a": 200, "b": 10}],
  ])("traduce %s al cuerpo de la petición", async (_name, request, expectedBody) => {
    const { client, post } = fakeClient({ returns: { result: 1 } });
    await createHttpCalculationService(client).calculate(request);

    expect(post).toHaveBeenCalledWith(`/calculator/${OPERATION_NAMES[_name]}`, expectedBody, undefined);
  });

  it("devuelve el número de la respuesta", async () => {
    const { client } = fakeClient({ returns: { result: 42 } });
    expect(await createHttpCalculationService(client).calculate(sqrtOf4)).toBe(42);
  });

  it("propaga la señal de cancelación", async () => {
    const { client, post } = fakeClient({ returns: { result: 1 } });
    const { signal } = new AbortController();
    await createHttpCalculationService(client).calculate(sqrtOf4, signal);

    expect(post).toHaveBeenCalledWith("/calculator/sqrt", expect.anything(), signal);
  });

  it.each([
    ["sin campo result", {}],
    ["result como texto", { result: "5" }],
    ["result infinito", { result: Infinity }],
    ["cuerpo vacío", null],
  ])("rechaza respuestas no válidas (%s)", async (_name, payload) => {
    const { client } = fakeClient({ returns: payload });

    await expect(createHttpCalculationService(client).calculate(sqrtOf4)).rejects.toThrow(
      new CalculationError(ERROR_MESSAGES.invalidResponse),
    );
  });

  it.each([
    ["HTTP 500", new HttpError(500, null), ERROR_MESSAGES.serverUnavailable],
    ["HTTP 503", new HttpError(503, null), ERROR_MESSAGES.serverUnavailable],
    ["HTTP 400", new HttpError(400, { error: "x" }), ERROR_MESSAGES.serverRejected],
    ["HTTP 422", new HttpError(422, null), ERROR_MESSAGES.serverRejected],
    ["sin conexión / CORS", new TypeError("Failed to fetch"), ERROR_MESSAGES.unreachable],
    ["tiempo agotado", new DOMException("timeout", "TimeoutError"), ERROR_MESSAGES.timeout],
  ])("traduce el fallo '%s' a un mensaje para el usuario", async (_name, error, message) => {
    const { client } = fakeClient({ fails: error });

    await expect(createHttpCalculationService(client).calculate(sqrtOf4)).rejects.toThrow(
      new CalculationError(message),
    );
  });

  it("deja pasar la cancelación sin convertirla en error de usuario", async () => {
    const abort = new DOMException("cancelado", "AbortError");
    const { client } = fakeClient({ fails: abort });

    await expect(createHttpCalculationService(client).calculate(sqrtOf4)).rejects.toBe(abort);
  });
});
