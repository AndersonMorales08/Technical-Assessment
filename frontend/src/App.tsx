import styles from "./App.module.css";
import { Calculator } from "./features/calculator";

export default function App() {
  return (
    <main className={styles.app}>
      <Calculator />
    </main>
  );
}
