# Go Docker test fixture for Magic Helix plugin
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod init example.com/helloworld && \
    echo 'package main\nimport "fmt"\nfunc main() { fmt.Println("hello world") }' > main.go && \
    go build -o hello main.go

FROM alpine:3.18
WORKDIR /app
COPY --from=builder /app/hello ./hello
CMD ["./hello"]
