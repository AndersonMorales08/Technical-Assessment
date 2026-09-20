package domain_test

import (
	"errors"
	"math"
	"testing"

	"Technical-Assessment/backend/internal/core/domain"
)

func TestOperations(t *testing.T) {
	tests := []struct {
		name    string
		fn      func() (float64, error)
		want    float64
		wantErr error
	}{
		{"add", func() (float64, error) { return domain.Add(5, 3) }, 8, nil},
		{"add negatives", func() (float64, error) { return domain.Add(-2, 2) }, 0, nil},
		{"add overflow", func() (float64, error) { return domain.Add(math.MaxFloat64, math.MaxFloat64) }, 0, domain.ErrResultOverflow},

		{"subtract", func() (float64, error) { return domain.Subtract(10, 4) }, 6, nil},

		{"multiply", func() (float64, error) { return domain.Multiply(6, 7) }, 42, nil},
		{"multiply by zero", func() (float64, error) { return domain.Multiply(0, -1) }, 0, nil},

		{"divide", func() (float64, error) { return domain.Divide(10, 4) }, 2.5, nil},
		{"divide by zero", func() (float64, error) { return domain.Divide(1, 0) }, 0, domain.ErrDivisionByZero},

		{"power", func() (float64, error) { return domain.Power(2, 10) }, 1024, nil},
		{"power negative exponent", func() (float64, error) { return domain.Power(2, -1) }, 0.5, nil},
		{"power zero to negative", func() (float64, error) { return domain.Power(0, -1) }, 0, domain.ErrUndefinedResult},
		{"power negative base fractional exp", func() (float64, error) { return domain.Power(-8, 0.5) }, 0, domain.ErrUndefinedResult},
		{"power overflow", func() (float64, error) { return domain.Power(10, 1000) }, 0, domain.ErrResultOverflow},

		{"sqrt", func() (float64, error) { return domain.SquareRoot(16) }, 4, nil},
		{"sqrt negative", func() (float64, error) { return domain.SquareRoot(-1) }, 0, domain.ErrNegativeSquareRoot},

		{"percentage", func() (float64, error) { return domain.Percentage(15, 200) }, 30, nil},
		{"percentage half", func() (float64, error) { return domain.Percentage(50, 80) }, 40, nil},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := tt.fn()

			if !errors.Is(err, tt.wantErr) {
				t.Fatalf("error = %v, want %v", err, tt.wantErr)
			}
			if tt.wantErr == nil && math.Abs(got-tt.want) > 1e-9 {
				t.Fatalf("result = %v, want %v", got, tt.want)
			}
		})
	}
}
