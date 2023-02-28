package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/jwtauth/v5"
	"github.com/lestrrat-go/jwx/v2/jwt"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var db *gorm.DB

var tokenAuth *jwtauth.JWTAuth

func init() {
	tokenAuth = jwtauth.New("HS256", []byte("SecretKey"), nil)
}

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

	fmt.Print("Running\n")

	// Create tables in db if they don't already exist based off the structs in domain.go
	db.AutoMigrate(&User{})
	db.AutoMigrate(&Driver{})
	db.AutoMigrate(&Sponsor{})
	db.AutoMigrate(&Admin{})
	db.AutoMigrate(&Organization{})
	db.AutoMigrate(&Points{})

	r := chi.NewRouter()
	r.Use(middleware.Logger)

	r.Use(cors.Handler(cors.Options{
		// AllowedOrigins:   []string{"https://foo.com"}, // Use this to allow specific origin hosts
		AllowedOrigins: []string{"https://*", "http://*"},
		// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	// Protected routes (Requires Login)
	r.Group(func(r chi.Router) {
		r.Use(jwtauth.Verifier(tokenAuth))
		r.Use(Authenticator)

		r.Route("/auth", func(r chi.Router) {
			r.Get("/is-auth", Authenticate)
		})
	})

	// Public routes
	r.Group(func(r chi.Router) {
		r.Get("/", func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte("Available routes: /users"))
		})

		r.Route("/login", func(r chi.Router) {
			r.Post("/", LoginHandler)
		})

		r.Route("/users", func(r chi.Router) {
			r.Get("/", ListUsers)
			r.Post("/", CreateUser)

			r.Route("/{userID}", func(r chi.Router) {
				r.Get("/", GetUser)
				r.Put("/profile", UpdateProfile)
			})
		})
	})

	// TODO: TLS autocert for let's encrypt https
	http.ListenAndServe(fmt.Sprintf(":%s", port), r)
}

func ListUsers(w http.ResponseWriter, r *http.Request) {
	var users []User

	result := db.Find(&users)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusBadRequest)
		return
	}

	returned, _ := json.Marshal(users)
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

	if data.PlaintextPassword == nil {
		http.Error(w, "CreateUserPayload missing required field: \"password\"", http.StatusBadRequest)
		return
	}

	if data.FirstName == nil {
		http.Error(w, "CreateUserPayload missing required field: \"firstName\"", http.StatusBadRequest)
		return
	}

	if data.LastName == nil {
		http.Error(w, "CreateUserPayload missing required field: \"lastName\"", http.StatusBadRequest)
		return
	}

	if data.Type == nil {
		http.Error(w, "CreateUserPayload missing required field: \"type\" (0-2)", http.StatusBadRequest)
		return
	}

	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(*data.PlaintextPassword), bcrypt.MinCost)
	if err != nil {
		http.Error(w, "Internal server error: Failed to hash password, could not create user.", http.StatusInternalServerError)
		return
	}

	var user User
	user.Email = *data.Email
	user.PasswordHash = string(hashedBytes)
	user.FirstName = *data.FirstName
	user.LastName = *data.LastName
	user.Type = *data.Type

	// TODO: Make additional driver/sponsor/admin struct based on type
	// and insert that into the db as well.

	result := db.Create(&user)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusBadRequest)
		return
	}

	returned, _ := json.Marshal(user)
	w.Header().Set("Content-Type", "application/json")
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

///  Authentication

func Authenticator(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token, _, err := jwtauth.FromContext(r.Context())

		if err != nil {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		if token == nil || jwt.Validate(token) != nil {
			http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
			return
		}

		// Token is authenticated, pass it through
		next.ServeHTTP(w, r)
	})
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	data := LoginUserPayload{}

	err := json.NewDecoder(r.Body).Decode(&data)

	if err != nil {
		fmt.Print("Http error\n")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if data.Email == nil {
		fmt.Print("Email error\n")
		http.Error(w, "LoginUserPayload missing required field: \"email\"", http.StatusNotFound)
		return
	}

	if data.PlaintextPassword == nil {
		fmt.Print("Password error\n")
		http.Error(w, "LoginUserPayload missing required field: \"password\"", http.StatusNotFound)
		return
	}

	var user User

	// Get hash from database for user, if exists.
	result := db.Where("email = ?", data.Email).First(&user)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) || result.Error != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(*data.PlaintextPassword))
	if err != nil {
		http.Error(w, "User authentication failed: wrong password.", http.StatusUnauthorized)
		return
	}

	// Generate the token string
	_, token, _ := tokenAuth.Encode(map[string]interface{}{
		"email":      data.Email,
		"authorized": true,
		"role":       0,
	})

	jwtCookie := http.Cookie{
		HttpOnly: false,
		Expires:  time.Now().Add(time.Hour * 2),
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
		// Uncomment for https
		// Secure: True
		Name:  "jwt",
		Value: token,
	}

	userCookie := http.Cookie{
		HttpOnly: false,
		Expires:  time.Now().Add(time.Hour * 2),
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
		// Uncomment for https
		// Secure: True
		Name:  "user",
		Value: user.FirstName,
	}

	ID := strconv.Itoa(user.ID)

	userIdCookie := http.Cookie{
		HttpOnly: false,
		Expires:  time.Now().Add(time.Hour * 2),
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
		// Uncomment for https
		// Secure: True
		Name:  "id",
		Value: ID,
	}

	http.SetCookie(w, &jwtCookie)
	http.SetCookie(w, &userCookie)
	http.SetCookie(w, &userIdCookie)

	w.WriteHeader(200)
	w.Write([]byte(""))
}

func Authenticate(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(200)
	w.Write([]byte("Authentication Successful"))
}

func UpdateProfile(w http.ResponseWriter, r *http.Request) {
	data := UserProfilePayload{}

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	updates := make(map[string]interface{})

	if data.FirstName != nil {
		updates["first_name"] = *data.FirstName
	}

	if data.LastName != nil {
		updates["last_name"] = *data.LastName
	}

	if data.Phone != nil {
		updates["phone"] = *data.Phone
	}

	if data.Bio != nil {
		updates["bio"] = *data.Bio
	}

	if data.ImageURL != nil {
		updates["image_url"] = *data.ImageURL
	}

	if userID := chi.URLParam(r, "userID"); userID != "" {
		result := db.Model(&User{}).Where("id = ?", userID).Updates(updates)
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "User Not Found", http.StatusNotFound)
			return
		}
	} else {
		http.Error(w, "User Not Found", http.StatusNotFound)
		return
	}
}

func (u User) MarshalJSON() ([]byte, error) {
	type user User
	x := user(u)
	x.PasswordHash = ""
	return json.Marshal(x)
}
