package rest_test

import (
	"encoding/json"
	"io"
	"log/slog"
	"math"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"

	"Technical-Assessment/backend/internal/adapters/inbound/rest"
	"Technical-Assessment/backend/internal/core/service"
)

func newRouter() http.Handler {
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	handler := rest.NewCalculatorHandler(service.NewCalculatorService(), logger)
	cfg := rest.RouterConfig{Mode: gin.TestMode, AllowedOrigins: []string{"http://localhost:5173"}}
	return rest.NewRouter(cfg, logger, handler)
}

func post(router http.Handler, path, body string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodPost, "/api/v1/calculator"+path, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)
	return rec
}

func TestCalculatorEndpoints(t *testing.T) {
	tests := []struct {
		name       string
		path       string
		body       string
		wantStatus int
		wantResult float64
		wantCode   string
	}{
		// Casos exitosos
		{"add", "/add", `{"a":5,"b":3}`, http.StatusOK, 8, ""},
		{"subtract", "/subtract", `{"a":10,"b":4}`, http.StatusOK, 6, ""},
		{"multiply", "/multiply", `{"a":6,"b":7}`, http.StatusOK, 42, ""},
		{"divide", "/divide", `{"a":10,"b":4}`, http.StatusOK, 2.5, ""},
		{"power", "/power", `{"a":2,"b":10}`, http.StatusOK, 1024, ""},
		{"sqrt", "/sqrt", `{"a":16}`, http.StatusOK, 4, ""},
		{"percentage", "/percentage", `{"a":15,"b":200}`, http.StatusOK, 30, ""},
		{"zero is a valid value", "/add", `{"a":0,"b":0}`, http.StatusOK, 0, ""},

		// Errores de negocio (422)
		{"divide by zero", "/divide", `{"a":10,"b":0}`, http.StatusUnprocessableEntity, 0, "division_by_zero"},
		{"sqrt of negative", "/sqrt", `{"a":-4}`, http.StatusUnprocessableEntity, 0, "negative_square_root"},
		{"undefined power", "/power", `{"a":-8,"b":0.5}`, http.StatusUnprocessableEntity, 0, "undefined_result"},
		{"overflow", "/multiply", `{"a":1e308,"b":10}`, http.StatusUnprocessableEntity, 0, "result_overflow"},

		// Errores de formato (400)
		{"missing b", "/add", `{"a":1}`, http.StatusBadRequest, 0, "invalid_request"},
		{"missing a in sqrt", "/sqrt", `{}`, http.StatusBadRequest, 0, "invalid_request"},
		{"wrong type", "/add", `{"a":"x","b":1}`, http.StatusBadRequest, 0, "invalid_request"},
		{"invalid json", "/add", `not-json`, http.StatusBadRequest, 0, "invalid_request"},
	}

	router := newRouter()

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rec := post(router, tt.path, tt.body)

			if rec.Code != tt.wantStatus {
				t.Fatalf("status = %d, want %d (body: %s)", rec.Code, tt.wantStatus, rec.Body.String())
			}

			var got struct {
				Result float64 `json:"result"`
				Code   string  `json:"code"`
			}
			if err := json.Unmarshal(rec.Body.Bytes(), &got); err != nil {
				t.Fatalf("invalid JSON response: %v", err)
			}
			if got.Code != tt.wantCode {
				t.Fatalf("code = %q, want %q", got.Code, tt.wantCode)
			}
			if tt.wantStatus == http.StatusOK && math.Abs(got.Result-tt.wantResult) > 1e-9 {
				t.Fatalf("result = %v, want %v", got.Result, tt.wantResult)
			}
		})
	}
}
