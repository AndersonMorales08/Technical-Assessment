package rest

import (
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"

	"Technical-Assessment/backend/internal/core/domain"
)

// handleError traduce errores de dominio a respuestas HTTP.
// Es el único lugar donde se decide el status code de un error de negocio.
func handleError(c *gin.Context, logger *slog.Logger, err error) {
	switch {
	case errors.Is(err, domain.ErrDivisionByZero):
		unprocessable(c, "division_by_zero", err)
	case errors.Is(err, domain.ErrNegativeSquareRoot):
		unprocessable(c, "negative_square_root", err)
	case errors.Is(err, domain.ErrUndefinedResult):
		unprocessable(c, "undefined_result", err)
	case errors.Is(err, domain.ErrResultOverflow):
		unprocessable(c, "result_overflow", err)
	default:
		logger.ErrorContext(c.Request.Context(), "unexpected error", "error", err)
		c.JSON(http.StatusInternalServerError, ErrorResponse{Code: "internal_error", Message: "internal server error"})
	}
}

func unprocessable(c *gin.Context, code string, err error) {
	c.JSON(http.StatusUnprocessableEntity, ErrorResponse{Code: code, Message: err.Error()})
}

func badRequest(c *gin.Context, message string) {
	c.JSON(http.StatusBadRequest, ErrorResponse{Code: "invalid_request", Message: message})
}

// bindErrorMessage convierte errores de decodificación de JSON en mensajes claros.
func bindErrorMessage(err error) string {
	var typeErr *json.UnmarshalTypeError
	if errors.As(err, &typeErr) {
		return fmt.Sprintf("field '%s' must be a valid number", typeErr.Field)
	}
	return "request body must be a valid JSON object"
}
