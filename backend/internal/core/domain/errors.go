package domain

import "errors"

// Errores de dominio. Los adaptadores los traducen a su protocolo
// (HTTP status, gRPC codes, etc.) usando errors.Is.
var (
	ErrDivisionByZero     = errors.New("division by zero is not allowed")
	ErrNegativeSquareRoot = errors.New("square root of a negative number is not defined")
	ErrUndefinedResult    = errors.New("result is undefined")
	ErrResultOverflow     = errors.New("result is too large to be represented")
)
