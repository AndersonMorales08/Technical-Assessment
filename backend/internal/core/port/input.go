// Package port define los contratos del núcleo (puertos).
//
// Aquí solo hay puertos de ENTRADA porque la calculadora no depende de nada
// externo. Cuando necesites, por ejemplo, guardar un historial, crea
// output.go con la interfaz HistoryRepository y un adaptador en adapters/outbound/.
package port

// CalculatorService es lo que el núcleo ofrece al mundo exterior.
type CalculatorService interface {
	// Operaciones con dos números
	Add(a, b float64) (float64, error)
	Subtract(a, b float64) (float64, error)
	Multiply(a, b float64) (float64, error)
	Divide(a, b float64) (float64, error)
	Power(base, exponent float64) (float64, error)
	Percentage(percent, base float64) (float64, error)

	// Operaciones con un número
	SquareRoot(a float64) (float64, error)
}
