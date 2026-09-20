// Package service implementa los casos de uso (lógica de aplicación).
package service

import (
	"Technical-Assessment/backend/internal/core/domain"
	"Technical-Assessment/backend/internal/core/port"
)

// CalculatorService orquesta los casos de uso. Hoy solo delega en el dominio;
// es el lugar natural para añadir historial, métricas, auditoría, etc.
type CalculatorService struct{}

var _ port.CalculatorService = (*CalculatorService)(nil)

func NewCalculatorService() *CalculatorService {
	return &CalculatorService{}
}

func (s *CalculatorService) Add(a, b float64) (float64, error)      { return domain.Add(a, b) }
func (s *CalculatorService) Subtract(a, b float64) (float64, error) { return domain.Subtract(a, b) }
func (s *CalculatorService) Multiply(a, b float64) (float64, error) { return domain.Multiply(a, b) }
func (s *CalculatorService) Divide(a, b float64) (float64, error)   { return domain.Divide(a, b) }

func (s *CalculatorService) Power(base, exponent float64) (float64, error) {
	return domain.Power(base, exponent)
}

func (s *CalculatorService) Percentage(percent, base float64) (float64, error) {
	return domain.Percentage(percent, base)
}

func (s *CalculatorService) SquareRoot(a float64) (float64, error) {
	return domain.SquareRoot(a)
}
