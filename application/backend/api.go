package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var db *gorm.DB

func main() {
	var err error

	dbuser := os.Getenv("RDS25_USER")
	dbpass := os.Getenv("RDS25_PASS")
	port := os.Getenv("API25_PORT")

	dsn := fmt.Sprintf("%s:%s@tcp(team25-rds.cobd8enwsupz.us-east-1.rds.amazonaws.com:3306)/dev", dbuser, dbpass)
	db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(err.Error())
	}

	// Create tables in db if they don't already exist based off the structs in domain.go
	db.AutoMigrate(&User{})
	db.AutoMigrate(&Driver{})
	db.AutoMigrate(&Sponsor{})
	db.AutoMigrate(&Admin{})

	r := chi.NewRouter()
	r.Use(middleware.Logger)

	r.Use(cors.Handler(cors.Options{
		// AllowedOrigins:   []string{"https://foo.com"}, // Use this to allow specific origin hosts
		AllowedOrigins: []string{"https://*", "http://*"},
		// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Available routes: /users"))
	})

	r.Route("/users", func(r chi.Router) {
		r.Get("/", ListUsers)
		r.Post("/", CreateUser)

		r.Route("/{userID}", func(r chi.Router) {
			r.Get("/", GetUser)
		})
	})

	// TODO: TLS autocert for let's encrypt https
	http.ListenAndServe(fmt.Sprintf(":%s", port), r)
}

func ListUsers(w http.ResponseWriter, r *http.Request) {
	var dbUsers []User

	result := db.Find(&dbUsers)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusBadRequest)
		return
	}

	returned, _ := json.Marshal(dbUsers)
	w.Header().Set("Content-Type", "application/json")
	w.Write(returned)
}

func CreateUser(w http.ResponseWriter, r *http.Request) {
	data := CreateUserPayload{}

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if data.Email == nil {
		http.Error(w, "CreateUserPayload missing required field: \"email\"", http.StatusBadRequest)
		return
	}

	if data.PasswordHash == nil {
		http.Error(w, "CreateUserPayload missing required field: \"password\"", http.StatusBadRequest)
		return
	}

	if data.Type == nil {
		http.Error(w, "CreateUserPayload missing required field: \"type\" (0-2)", http.StatusBadRequest)
		return
	}

	var user User
	user.Email = *data.Email
	user.PasswordHash = *data.PasswordHash
	user.Type = *data.Type

	// TODO: Make additional driver/sponsor/admin struct based on type
	// and insert that into the db as well.

	result := db.Create(&user)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusBadRequest)
		return
	}

	returned, _ := json.Marshal(user)
	w.Write(returned)
}

func GetUser(w http.ResponseWriter, r *http.Request) {
	var user User

	if userID := chi.URLParam(r, "userID"); userID != "" {
		result := db.First(&user, "id = ?", userID)
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "User Not Found", http.StatusNotFound)
			return
		}
	} else {
		http.Error(w, "User Not Found", http.StatusNotFound)
		return
	}

	returned, _ := json.Marshal(user)
	w.Write(returned)
}
