import styles from "./App.module.css";
import { Calculator, createHttpCalculationService } from "./features/calculator";
import { createHttpClient } from "./shared/api/httpClient";

// Se crea una sola vez, fuera del componente, para que la referencia sea estable.
const calculationService = createHttpCalculationService(
  createHttpClient({ baseUrl: import.meta.env.VITE_CALCULATOR_API_URL ?? "" }),
);

export default function App() {
  return (
    <main className={styles.app}>
      <Calculator service={calculationService} />
    </main>
  );
}
