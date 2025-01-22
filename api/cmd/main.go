package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5"
)

type env struct {
	// mode     string
	password           string
	dbConnectionString string
	// cors     string
}

type httpError struct {
	Message string `json:"message"`
}

type note struct {
	Id   string `json:"id"`
	Note string `json:"note"`
}

func setEnv(key string) string {
	value, ok := os.LookupEnv(key)
	if !ok {
		panic("Missing required env variable")
	}
	return value
}

func setEnvWithFallback(key string, defaultValue string) string {
	value, ok := os.LookupEnv(key)
	if !ok {
		return defaultValue
	}
	return value
}

var newEnv = env{
	// mode:     setEnv("MODE", "DEV"),
	password:           setEnvWithFallback("PASSWORD", "DEV"),
	dbConnectionString: setEnv("DATABASE_URL"),
	// cors:     setEnv("CORS", "http://localhost:5173"),
}

func healthCheck(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNoContent)
}

func getHeritage(w http.ResponseWriter, r *http.Request) {
	file, err := os.ReadFile("public/heritage.json")
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			http.Error(w, "no heritage file could be found", http.StatusNotFound)
			return
		}
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(file)
}

func authUser(w http.ResponseWriter, r *http.Request) {
	_, password, _ := r.BasicAuth()
	if password != newEnv.password {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(httpError{
			Message: "Incorrect password",
		})
		return
	}
	cookie := http.Cookie{
		Name:     "auth",
		Value:    newEnv.password,
		Path:     "/",
		MaxAge:   3600,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
	}
	http.SetCookie(w, &cookie)
	w.WriteHeader(http.StatusNoContent)
}

func acceptPreflight(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNoContent)
}

// func setCORSHeaders(w http.ResponseWriter) {
// 	w.Header().Set("Access-Control-Allow-Credentials", "true")
// 	w.Header().Set("Access-Control-Allow-Origin", newEnv.cors)
// 	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
// 	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
// }

// func cors(next http.HandlerFunc) http.HandlerFunc {
// 	return func(w http.ResponseWriter, r *http.Request) {
// 		setCORSHeaders(w)
// 		next(w, r)
// 	}
// }

func handlerToHandlerFunc(fs http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fs.ServeHTTP(w, r)
	}
}

func ensureBasicAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authCookie, err := r.Cookie("auth")
		if err != nil {
			// w.Header().Set("WWW-Authenticate", `Basic realm="restricted", charset="UTF-8"`)
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		if authCookie.Value != newEnv.password {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		next(w, r)
	}
}

func getPersonGallery(w http.ResponseWriter, r *http.Request) {
	userId := r.PathValue("id")
	if userId == "" {
		http.Error(w, "Path parameter is required", http.StatusBadRequest)
		return
	}

	entries, err := os.ReadDir("public/" + userId + "/photos")
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			http.Error(w, "No such file or directory", http.StatusNotFound)
			return
		}
		http.Error(w, "Error reading files from directory", http.StatusInternalServerError)
		return
	}

	fileNames := []string{}
	for _, v := range entries {
		fileNames = append(fileNames, v.Name())
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(map[string]interface{}{
		"files": fileNames,
	})
	if err != nil {
		http.Error(w, fmt.Sprintf("Error building the response, %v", err), http.StatusInternalServerError)
		return
	}
}

func getPersonDocuments(w http.ResponseWriter, r *http.Request) {
	userId := r.PathValue("id")
	if userId == "" {
		http.Error(w, "Path parameter is required", http.StatusBadRequest)
		return
	}

	entries, err := os.ReadDir("public/" + userId + "/documents")
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			http.Error(w, "No such file or directory", http.StatusNotFound)
			return
		}
		http.Error(w, "Error reading files from directory", http.StatusInternalServerError)
		return
	}

	fileNames := []string{}
	for _, v := range entries {
		fileNames = append(fileNames, v.Name())
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(map[string]interface{}{
		"files": fileNames,
	})
	if err != nil {
		http.Error(w, fmt.Sprintf("Error building the response, %v", err), http.StatusInternalServerError)
		return
	}
}

func getPersonNotes(conn *pgx.Conn) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId := r.PathValue("id")
		if userId == "" {
			http.Error(w, "Path parameter is required", http.StatusBadRequest)
			return
		}

		rows, err := conn.Query(context.Background(), "SELECT id, note FROM notes WHERE person_indi_id=$1", userId)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Query failed: %v\n", err)
			os.Exit(1)
		}
		defer rows.Close()

		notes, err := pgx.CollectRows(rows, pgx.RowToStructByName[note])
		if err != nil {
			fmt.Fprintf(os.Stderr, "Failed collecting rows: %v\n", err)
			os.Exit(1)
		}

		w.WriteHeader(http.StatusOK)
		w.Header().Set("Content-Type", "application/json")
		err = json.NewEncoder(w).Encode(map[string]interface{}{
			"notes": notes,
		})
		if err != nil {
			http.Error(w, fmt.Sprintf("Error building the response, %v", err), http.StatusInternalServerError)
			return
		}
	}
}

func main() {
	// consider using pools -> pgxpool.New -> https://ectobit.com/blog/pgx-v5-3/
	conn, err := pgx.Connect(context.Background(), newEnv.dbConnectionString)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
		os.Exit(1)
	}
	defer conn.Close(context.Background())

	fs := http.FileServer(http.Dir("public"))
	http.Handle("/api/public/", ensureBasicAuth(handlerToHandlerFunc(http.StripPrefix("/api/public/", fs))))

	http.HandleFunc("GET /api/health", healthCheck)
	http.HandleFunc("GET /api/heritage", ensureBasicAuth((getHeritage)))
	http.HandleFunc("GET /api/people/{id}/gallery", getPersonGallery)
	http.HandleFunc("GET /api/people/{id}/documents", getPersonDocuments)
	http.HandleFunc("GET /api/people/{id}/notes", getPersonNotes(conn))

	http.HandleFunc("OPTIONS /api/auth", acceptPreflight)
	http.HandleFunc("POST /api/auth", authUser)

	err = http.ListenAndServe(":8080", nil)

	if err != nil {
		if errors.Is(err, http.ErrServerClosed) {
			return
		}
		os.Exit(1)
	}
}
