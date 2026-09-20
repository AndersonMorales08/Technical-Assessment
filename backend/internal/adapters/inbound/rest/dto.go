package rest

import (
	"fmt"
	"strings"
)

// Se usan punteros (*float64) para distinguir "campo ausente" (nil) de
// "campo con valor 0". Con un float64 normal, {"a":0} y {} serían iguales.

// BinaryOperationRequest: operaciones con dos números.
type BinaryOperationRequest struct {
	A *float64 `json:"a"`
	B *float64 `json:"b"`
}

func (r BinaryOperationRequest) Validate() error {
	var missing []string
	if r.A == nil {
		missing = append(missing, "a")
	}
	if r.B == nil {
		missing = append(missing, "b")
	}
	if len(missing) > 0 {
		return fmt.Errorf("missing required field(s): %s", strings.Join(missing, ", "))
	}
	return nil
}

// UnaryOperationRequest: operaciones con un solo número.
type UnaryOperationRequest struct {
	A *float64 `json:"a"`
}

func (r UnaryOperationRequest) Validate() error {
	if r.A == nil {
		return fmt.Errorf("missing required field(s): a")
	}
	return nil
}

type OperationResponse struct {
	Operation string  `json:"operation"`
	Result    float64 `json:"result"`
}

type ErrorResponse struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}
