// Composition root: único lugar donde se conectan adaptadores con el núcleo.
package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"Technical-Assessment/backend/internal/adapters/inbound/rest"
	"Technical-Assessment/backend/internal/config"
	"Technical-Assessment/backend/internal/core/service"
)

func main() {
	cfg := config.Load()
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	// Núcleo (casos de uso)
	calculatorService := service.NewCalculatorService()

	// Adaptadores de entrada (HTTP)
	calculatorHandler := rest.NewCalculatorHandler(calculatorService, logger)
	router := rest.NewRouter(rest.RouterConfig{
		Mode:           cfg.GinMode,
		AllowedOrigins: cfg.CORSAllowedOrigins,
	}, logger, calculatorHandler)

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	serverErr := make(chan error, 1)
	go func() {
		logger.Info("server started", "addr", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			serverErr <- err
		}
	}()

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	select {
	case err := <-serverErr:
		logger.Error("server failed", "error", err)
		os.Exit(1)
	case <-ctx.Done():
		logger.Info("shutting down...")
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		logger.Error("graceful shutdown failed", "error", err)
	}
}
