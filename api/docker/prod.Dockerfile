# build stage
FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY . .

# install dependencies
RUN go mod download

# build executable
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o go-api /app/cmd

# run stage
FROM scratch
WORKDIR /app
COPY --from=builder app/go-api .

CMD ["./go-api"]
