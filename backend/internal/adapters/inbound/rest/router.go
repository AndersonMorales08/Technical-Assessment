package rest

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
)

type RouterConfig struct {
	Mode           string
	AllowedOrigins []string
}

// NewRouter arma el router. Para agregar un recurso nuevo, crea su handler
// con un método RegisterRoutes y regístralo aquí.
func NewRouter(cfg RouterConfig, logger *slog.Logger, calculator *CalculatorHandler) *gin.Engine {
	gin.SetMode(cfg.Mode)
	r := gin.New()
	r.Use(requestLogger(logger), corsMiddleware(cfg.AllowedOrigins), gin.Recovery())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	v1 := r.Group("/api/v1")
	calculator.RegisterRoutes(v1)

	return r
}
