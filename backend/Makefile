.PHONY: run build test cover tidy fmt vet

run:
	go run ./cmd/api

build:
	go build -o bin/api ./cmd/api

test:
	go test ./... -race -count=1

cover:
	go test ./... -coverprofile=coverage.out && go tool cover -func=coverage.out

tidy:
	go mod tidy

fmt:
	gofmt -s -w .

vet:
	go vet ./...
