// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Calculator } from "./Calculator";
import { CalculationError, ERROR_MESSAGES, type CalculationService } from "./logic";

afterEach(cleanup);

const click = (name: string) => fireEvent.click(screen.getByRole("button", { name }));
const display = () => screen.getByRole("status");
const clickSequence = (...names: string[]) => names.forEach(click);

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("<Calculator />", () => {
  it("pide el resultado al servicio y lo muestra", async () => {
    const service: CalculationService = { calculate: vi.fn().mockResolvedValue(5) };
    render(<Calculator service={service} />);

    clickSequence("2", "Sumar", "3", "Calcular resultado");

    await waitFor(() => expect(display().textContent).toBe("2 + 3 =5"));
    expect(service.calculate).toHaveBeenCalledTimes(1);
    expect(service.calculate).toHaveBeenCalledWith(
      { kind: "binary", operator: "+", left: 2, right: 3 },
      expect.any(AbortSignal),
    );
  });

  it("marca la pantalla como ocupada y ignora teclas mientras espera", async () => {
    const request = deferred<number>();
    const service: CalculationService = { calculate: () => request.promise };
    render(<Calculator service={service} />);

    clickSequence("6", "Multiplicar", "7", "Calcular resultado");
    expect(display().getAttribute("aria-busy")).toBe("true");

    click("9"); // se ignora
    expect(display().textContent).toBe("6 ×7");

    await act(async () => request.resolve(42));

    expect(display().getAttribute("aria-busy")).toBe("false");
    expect(display().textContent).toBe("6 × 7 =42");
  });

  it("AC cancela la petición en curso y descarta su respuesta", async () => {
    const request = deferred<number>();
    let receivedSignal: AbortSignal | undefined;
    const service: CalculationService = {
      calculate: (_req, signal) => {
        receivedSignal = signal;
        return request.promise;
      },
    };
    render(<Calculator service={service} />);

    clickSequence("2", "Sumar", "3", "Calcular resultado");
    click("Borrar todo");

    expect(receivedSignal?.aborted).toBe(true);
    expect(display().getAttribute("aria-busy")).toBe("false");

    await act(async () => request.resolve(5)); // respuesta tardía
    expect(display().textContent).toBe("\u00A00");
  });

  it("muestra el error cuando el servicio falla", async () => {
    const service: CalculationService = {
      calculate: () => Promise.reject(new CalculationError(ERROR_MESSAGES.unreachable)),
    };
    render(<Calculator service={service} />);

    clickSequence("2", "Sumar", "3", "Calcular resultado");

    await waitFor(() => expect(display().textContent).toContain(ERROR_MESSAGES.unreachable));
  });

  it("no llama al servicio cuando la regla de entrada ya lo impide (÷ 0)", () => {
    const service: CalculationService = { calculate: vi.fn() };
    render(<Calculator service={service} />);

    clickSequence("5", "Dividir", "0", "Calcular resultado");

    expect(service.calculate).not.toHaveBeenCalled();
    expect(display().textContent).toContain(ERROR_MESSAGES.divisionByZero);
  });

  it("también funciona con el teclado", async () => {
    const service: CalculationService = { calculate: vi.fn().mockResolvedValue(20) };
    render(<Calculator service={service} />);

    for (const key of ["4", "*", "5", "Enter"]) fireEvent.keyDown(window, { key });

    await waitFor(() => expect(display().textContent).toBe("4 × 5 =20"));
  });
});
