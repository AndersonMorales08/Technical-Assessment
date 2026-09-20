package rest

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"

	"Technical-Assessment/backend/internal/core/port"
)

type (
	binaryOperation func(a, b float64) (float64, error)
	unaryOperation  func(a float64) (float64, error)
)

type CalculatorHandler struct {
	service port.CalculatorService
	logger  *slog.Logger
}

func NewCalculatorHandler(service port.CalculatorService, logger *slog.Logger) *CalculatorHandler {
	return &CalculatorHandler{service: service, logger: logger}
}

// RegisterRoutes: una línea por endpoint. Para agregar una operación nueva,
// añade el método al puerto/servicio y una línea aquí.
func (h *CalculatorHandler) RegisterRoutes(rg *gin.RouterGroup) {
	calc := rg.Group("/calculator")

	// Dos números: {"a": ..., "b": ...}
	calc.POST("/add", h.binary("add", h.service.Add))
	calc.POST("/subtract", h.binary("subtract", h.service.Subtract))
	calc.POST("/multiply", h.binary("multiply", h.service.Multiply))
	calc.POST("/divide", h.binary("divide", h.service.Divide))
	calc.POST("/power", h.binary("power", h.service.Power))                // a ^ b
	calc.POST("/percentage", h.binary("percentage", h.service.Percentage)) // a% de b

	// Un número: {"a": ...}
	calc.POST("/sqrt", h.unary("sqrt", h.service.SquareRoot))
}

// binary construye un handler para operaciones de dos números.
func (h *CalculatorHandler) binary(name string, op binaryOperation) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req BinaryOperationRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			badRequest(c, bindErrorMessage(err))
			return
		}
		if err := req.Validate(); err != nil {
			badRequest(c, err.Error())
			return
		}

		result, err := op(*req.A, *req.B)
		if err != nil {
			handleError(c, h.logger, err)
			return
		}
		c.JSON(http.StatusOK, OperationResponse{Operation: name, Result: result})
	}
}

// unary construye un handler para operaciones de un número.
func (h *CalculatorHandler) unary(name string, op unaryOperation) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req UnaryOperationRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			badRequest(c, bindErrorMessage(err))
			return
		}
		if err := req.Validate(); err != nil {
			badRequest(c, err.Error())
			return
		}

		result, err := op(*req.A)
		if err != nil {
			handleError(c, h.logger, err)
			return
		}
		c.JSON(http.StatusOK, OperationResponse{Operation: name, Result: result})
	}
}
