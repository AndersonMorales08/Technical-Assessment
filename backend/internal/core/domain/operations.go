// Package domain contiene las reglas de negocio: las operaciones matemáticas.
// No importa nada de frameworks ni de infraestructura.
package domain

import (
	"fmt"
	"math"
)

// Add devuelve a + b.
func Add(a, b float64) (float64, error) {
	return finite(a + b)
}

// Subtract devuelve a - b.
func Subtract(a, b float64) (float64, error) {
	return finite(a - b)
}

// Multiply devuelve a * b.
func Multiply(a, b float64) (float64, error) {
	return finite(a * b)
}

// Divide devuelve a / b. Falla si b es cero.
func Divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, ErrDivisionByZero
	}
	return finite(a / b)
}

// Power devuelve base elevado a exponent.
func Power(base, exponent float64) (float64, error) {
	if base == 0 && exponent < 0 {
		return 0, fmt.Errorf("%w: zero cannot be raised to a negative power", ErrUndefinedResult)
	}
	return finite(math.Pow(base, exponent))
}

// SquareRoot devuelve la raíz cuadrada de a. Falla si a es negativo.
func SquareRoot(a float64) (float64, error) {
	if a < 0 {
		return 0, ErrNegativeSquareRoot
	}
	return finite(math.Sqrt(a))
}

// Percentage devuelve percent% de base. Ejemplo: Percentage(15, 200) = 30.
func Percentage(percent, base float64) (float64, error) {
	return finite(base * (percent / 100))
}

// finite garantiza que el resultado se pueda representar (y serializar a JSON):
// NaN e Infinito no son números válidos en JSON.
func finite(v float64) (float64, error) {
	switch {
	case math.IsNaN(v):
		return 0, ErrUndefinedResult
	case math.IsInf(v, 0):
		return 0, ErrResultOverflow
	case v == 0:
		return 0, nil // normaliza -0 a 0
	}
	return v, nil
}
