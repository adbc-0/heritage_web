package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"
)

func healthCheck(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNoContent)
}

func getHeritage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	file, err := os.ReadFile("assets/heritage.json")
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			http.Error(w, "no heritage file could be found", http.StatusNotFound)
			return
		}
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write(file)
}

func authUser(w http.ResponseWriter, r *http.Request) {
	_, password, _ := r.BasicAuth()
	if password != os.Getenv("PASSWORD") {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	cookie := http.Cookie{
		Name:     "auth",
		Value:    os.Getenv("PASSWORD"),
		Path:     "/",
		MaxAge:   3600,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(w, &cookie)
	w.Write([]byte("cookie set!"))
}

func acceptPreflight(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNoContent)
}

func setCORSHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	w.Header().Set("Access-Control-Allow-Origin", os.Getenv("CORS"))
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
}

func cors(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setCORSHeaders(w)
		next(w, r)
	}
}

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
		if authCookie.Value != os.Getenv("PASSWORD") {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		next(w, r)
	}
}

func loadEnvVariables() {
	data, err := os.ReadFile(".env")
	if err != nil {
		return
	}
	lines := strings.Split(string(data), "\n")
	for _, line := range lines {
		parts := strings.Split(line, "=")
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			value := strings.TrimSpace(parts[1])
			os.Setenv(key, value)
		}
	}
}

func getPerson(w http.ResponseWriter, r *http.Request) {
	userId := r.PathValue("id")
	if userId == "" {
		http.Error(w, "Path parameter is required", http.StatusBadRequest)
		return
	}

	entries, err := os.ReadDir("assets/people/" + userId)
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

func main() {
	loadEnvVariables()

	fs := http.FileServer(http.Dir("assets/people"))
	http.Handle("/assets/people/", ensureBasicAuth(cors(handlerToHandlerFunc(http.StripPrefix("/assets/people/", fs)))))

	http.HandleFunc("GET /api/health", cors(healthCheck))
	http.HandleFunc("GET /api/heritage", cors(ensureBasicAuth((getHeritage))))
	http.HandleFunc("GET /api/people/{id}", cors(getPerson))

	http.HandleFunc("OPTIONS /api/auth", cors(acceptPreflight))
	http.HandleFunc("POST /api/auth", cors(authUser))

	err := http.ListenAndServe(":8080", nil)

	if err != nil {
		if errors.Is(err, http.ErrServerClosed) {
			return
		}
		os.Exit(1)
	}
}
