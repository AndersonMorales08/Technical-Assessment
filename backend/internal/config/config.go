// Package config carga la configuración de la aplicación desde variables de entorno.
package config

import (
	"os"
	"strings"
	"time"
)

type Config struct {
	Port               string
	GinMode            string
	ShutdownTimeout    time.Duration
	CORSAllowedOrigins []string
}

func Load() Config {
	return Config{
		Port:            getEnv("PORT", "8080"),
		GinMode:         getEnv("GIN_MODE", "release"),
		ShutdownTimeout: getDuration("SHUTDOWN_TIMEOUT", 10*time.Second),
		CORSAllowedOrigins: getList("CORS_ALLOWED_ORIGINS", []string{
			"*",
			"http://localhost:3000",
			"http://localhost:5173",
		}),
	}
}

func getEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return fallback
}

func getDuration(key string, fallback time.Duration) time.Duration {
	v, ok := os.LookupEnv(key)
	if !ok {
		return fallback
	}
	d, err := time.ParseDuration(v)
	if err != nil {
		return fallback
	}
	return d
}

func getList(key string, fallback []string) []string {
	raw, ok := os.LookupEnv(key)
	if !ok {
		return fallback
	}

	var items []string
	for _, part := range strings.Split(raw, ",") {
		if part = strings.TrimSpace(part); part != "" {
			items = append(items, part)
		}
	}
	if len(items) == 0 {
		return fallback
	}
	return items
}
