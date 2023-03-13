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

type Server struct {
	Router *chi.Mux
	DB     *gorm.DB
}

func CreateNewServer() *Server {
	s := &Server{}
	s.Router = chi.NewRouter()

	return s
}

func (s *Server) ConnectDatabase(schemaName string) {
	dbuser := os.Getenv("RDS25_USER")
	dbpass := os.Getenv("RDS25_PASS")

	dsn := fmt.Sprintf("%s:%s@tcp(team25-rds.cobd8enwsupz.us-east-1.rds.amazonaws.com:3306)/%s", dbuser, dbpass, schemaName)
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(err.Error())
	}

	// Create tables in db if they don't already exist based off the structs in domain.go
	db.AutoMigrate(&User{})
	db.AutoMigrate(&Driver{})
	db.AutoMigrate(&Sponsor{})
	db.AutoMigrate(&Admin{})
	db.AutoMigrate(&Organization{})
	db.AutoMigrate(&Points{})

	s.DB = db
}

func (s *Server) MountHandlers() {
	r := s.Router
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
			r.Post("/", s.LoginHandler)
		})

		r.Route("/users", func(r chi.Router) {
			r.Get("/", s.ListUsers)
			r.Post("/", s.CreateUser)

			r.Route("/{userID}", func(r chi.Router) {
				r.Get("/", s.GetUser)
				r.Put("/profile", s.UpdateProfile)
			})
		})

		r.Route("/orgs", func(r chi.Router) {
			r.Get("/", s.ListOrgs)
			r.Post("/", s.CreateOrganization)

			r.Route("/{orgID}", func(r chi.Router) {
				r.Get("/", s.GetOrg)
				r.Delete("/", s.DeleteOrg)
			})
		})
	})
}

var tokenAuth *jwtauth.JWTAuth

func init() {
	tokenAuth = jwtauth.New("HS256", []byte("SecretKey"), nil)
}

func main() {
	s := CreateNewServer()
	s.MountHandlers()
	s.ConnectDatabase("devOrgDeletes")

	fmt.Print("Running\n")

	port := os.Getenv("API25_PORT")

	// TODO: TLS autocert for let's encrypt https
	http.ListenAndServe(fmt.Sprintf(":%s", port), s.Router)
}

func (s *Server) ListUsers(w http.ResponseWriter, r *http.Request) {
	var users []User

	result := s.DB.Find(&users)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusBadRequest)
		return
	}

	returned, _ := json.Marshal(users)
	w.Header().Set("Content-Type", "application/json")
	w.Write(returned)
}

func (s *Server) CreateUser(w http.ResponseWriter, r *http.Request) {
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

	var userExists User
	// Check if email exists
	result := s.DB.Where("email = ?", data.Email).First(&userExists)
	if !(errors.Is(result.Error, gorm.ErrRecordNotFound) || result.Error != nil) {
		http.Error(w, "User already exists", http.StatusConflict)
		return
	}

	var user User
	user.Email = *data.Email
	user.PasswordHash = string(hashedBytes)
	user.FirstName = *data.FirstName
	user.LastName = *data.LastName
	user.Type = *data.Type

	switch user.Type {
	// driver
	case 0:
		// error checking driver specific fields
		if data.OrganizationId == nil {
			http.Error(w, "CreateUserPayload missing required field: \"OrganizationId\" (0-2)", http.StatusBadRequest)
			return
		}
		// check licence number
		if data.LicenceNumber == nil {
			http.Error(w, "CreateDriverPayload missing required field: \"LicenceNumber\" (0-2)", http.StatusBadRequest)
			return
		}
		//check truck type
		if data.TruckType == nil {
			http.Error(w, "CreateDriverPayload missing required field: \"TruckType\" (0-2)", http.StatusBadRequest)
			return
		}

		// assigning driver values
		var driver Driver
		driver.User = user
		driver.LicensePlate = *data.LicenceNumber
		driver.TruckType = *data.TruckType

		// finding organization based on organization id
		var organization Organization
		result := s.DB.First(&organization, *data.OrganizationId)
		// error checking organization
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Organization Not Found\n", http.StatusNotFound)
			return
		}

		// Appends this single organization to the list of organizations if there is one.
		driver.Organizations = []*Organization{&organization}

		// creating the sponsor in the database
		createResult := s.DB.Create(&driver)
		// error checking sponsor creation
		if createResult.Error != nil {
			http.Error(w, createResult.Error.Error(), http.StatusBadRequest)
			return
		}
		user.ID = driver.UserID
	// sponsor case
	case 1:
		// error checking sponsor specific fields
		if data.OrganizationId == nil {
			http.Error(w, "CreateUserPayload missing required field: \"OrganizationId\" (0-2)", http.StatusBadRequest)
			return
		}
		// assigning sponsor values
		var sponsor Sponsor
		sponsor.User = user

		// finding organization based on organization id
		var organization Organization
		result := s.DB.First(&organization, *data.OrganizationId)
		// error checking organization
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Organization Not Found\n", http.StatusNotFound)

			return
		}
		sponsor.Organization = organization // POTENTIAL ERROR: might need to use result instead of the referenced value

		// creating the sponsor in the database
		createResult := s.DB.Create(&sponsor)
		// error checking sponsor creation
		if createResult.Error != nil {
			http.Error(w, createResult.Error.Error(), http.StatusBadRequest)
			return
		}
		user.ID = sponsor.UserID
	// admin case
	case 2:
		// assigning sponsor values
		var admin Admin
		admin.User = user
		// creating the sponsor in the database
		createResult := s.DB.Create(&admin)
		// error checking sponsor creation
		if createResult.Error != nil {
			http.Error(w, createResult.Error.Error(), http.StatusBadRequest)
			return
		}
		user.ID = admin.UserID
	// case for none specific user
	default:
		result := s.DB.Create(&user)
		if result.Error != nil {
			http.Error(w, result.Error.Error(), http.StatusBadRequest)
			return
		}
	}

	// Return base user
	returned, _ := json.Marshal(user)
	w.Header().Set("Content-Type", "application/json")
	w.Write(returned)
}

func (s *Server) GetUser(w http.ResponseWriter, r *http.Request) {
	var user User

	if userID := chi.URLParam(r, "userID"); userID != "" {
		result := s.DB.First(&user, "id = ?", userID)
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

func (s *Server) GetOrg(w http.ResponseWriter, r *http.Request) {
	var org Organization

	if orgID := chi.URLParam(r, "orgID"); orgID != "" {
		result := s.DB.First(&org, "id = ?", orgID)
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Organization Not Found", http.StatusNotFound)
			return
		}
	} else {
		http.Error(w, "Organization Not Found", http.StatusNotFound)
		return
	}

	returned, _ := json.Marshal(org)
	w.Write(returned)
}

// desc: sends a request back containing all the orgs
func (s *Server) ListOrgs(w http.ResponseWriter, r *http.Request) {
	// assigning variable
	var all_orgs []Organization
	// grabbing all orgs from database
	result := s.DB.Find(&all_orgs)
	// error checking
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusBadRequest)
		return
	}
	// ? writing the response
	returned, _ := json.Marshal(all_orgs)
	w.Header().Set("Content-Type", "application/json")
	w.Write(returned)
}

func (s *Server) CreateOrganization(w http.ResponseWriter, r *http.Request) {
	// Recieing data fomr client-side json and errochecking it
	data := CreateOrgPayload{}
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if data.Name == nil {
		http.Error(w, "CreateUserPayload missing required field: \"name\"", http.StatusBadRequest)
		return
	}
	if data.Phone == nil {
		http.Error(w, "CreateUserPayload missing required field: \"phone\"", http.StatusBadRequest)
		return
	}
	if data.Email == nil {
		http.Error(w, "CreateUserPayload missing required field: \"email\"", http.StatusBadRequest)
		return
	}
	if data.LogoURL == nil {
		http.Error(w, "CreateUserPayload missing required field: \"email\"", http.StatusBadRequest)
		return
	}

	// creating org variable
	var org Organization
	org.Name = *data.Name
	org.Biography = *data.Bio
	org.Email = *data.Email
	org.LogoURL = *data.LogoURL

	// injecting org into database
	result := s.DB.Create(&org)
	// error checking injection
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusBadRequest)
		return
	}

	returned, _ := json.Marshal(org)
	w.Write(returned)
}

// DEBUG: Doesn't delete anything except the sponsor user (I think)
//
//	What it's not:
//		1. not returning out of the program without an print statement
func (s *Server) DeleteOrg(w http.ResponseWriter, r *http.Request) {
	var org Organization
	if orgID := chi.URLParam(r, "orgID"); orgID != "" {
		// finding org based on url param
		result := s.DB.First(&org, "id = ?", orgID)
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			fmt.Printf("Org Not Found\n")
			http.Error(w, "Organization Not Found", http.StatusNotFound)
			return
		}
	} else {
		fmt.Printf("Org Not Found\n")
		http.Error(w, "Org Not Found", http.StatusNotFound)
		return
	}

	// Getting the IDs of the users associated with the deleted sponsors
	var userIds []int64
	resultUserIds := s.DB.Model(&Sponsor{}).Where("organization_id = ?", org.ID).Pluck("user_id", &userIds)
	if resultUserIds.Error != nil {
		fmt.Printf("Failed To Delete Associated Users\n")
		http.Error(w, "Failed To Delete Associated Users", http.StatusNotFound)
		return
	}

	// Deleting all sponsors in the organization
	resultSponsors := s.DB.Where("organization_id = ?", org.ID).Delete(&Sponsor{})
	if resultSponsors != nil {
		fmt.Printf("Failed To Delete Associated Sponsors\n")
		http.Error(w, "Failed To Delete Associated Sponsors", http.StatusNotFound)
		if errors.Is(resultSponsors.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "No Associated Sponsors Found", http.StatusNotFound)
		} else {
			fmt.Printf("%s\n", resultSponsors.Error.Error())
			return
		}
	}

	// Deleting all the users associated with the deleted sponsors
	resultUsers := s.DB.Where("id IN ?", userIds).Delete(&User{})
	if resultUsers.Error != nil {
		fmt.Printf("Failed To Clear Driver Associations\n")
		http.Error(w, "Failed To Clear Driver Associations", http.StatusNotFound)
		if errors.Is(resultUsers.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "No Driver Associations", http.StatusNotFound)
		} else {
			return
		}
	}

	// Clearing all associations with drivers
	s.DB.Model(&org).Association("Drivers").Clear()

	// Finally, deleting the organization
	resultOrg := s.DB.Where("id = ?", org.ID).Delete(&Organization{})
	if resultOrg.Error != nil {
		fmt.Printf("Failed To Delete Organization\n")
		http.Error(w, "Failed To Delete Organization", http.StatusNotFound)
		return
	}

	// Return the org that was deleted
	returned, _ := json.Marshal(org)
	w.Header().Set("Content-Type", "application/json")
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

func (s *Server) LoginHandler(w http.ResponseWriter, r *http.Request) {
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
	result := s.DB.Where("email = ?", data.Email).First(&user)
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
		"role":       user.Type,
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

	roleCookie := http.Cookie{
		HttpOnly: false,
		Expires:  time.Now().Add(time.Hour * 2),
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
		// Uncomment for https
		// Secure: True
		Name:  "role",
		Value: strconv.Itoa(user.Type),
	}

	userIdCookie := http.Cookie{
		HttpOnly: false,
		Expires:  time.Now().Add(time.Hour * 2),
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
		// Uncomment for https
		// Secure: True
		Name:  "id",
		Value: strconv.Itoa(user.ID),
	}

	http.SetCookie(w, &jwtCookie)
	http.SetCookie(w, &userCookie)
	http.SetCookie(w, &userIdCookie)
	http.SetCookie(w, &roleCookie)

	w.WriteHeader(200)
	w.Write([]byte(""))
}

func Authenticate(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(200)
	w.Write([]byte("Authentication Successful"))
}

func (s *Server) UpdateProfile(w http.ResponseWriter, r *http.Request) {
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
		result := s.DB.Model(&User{}).Where("id = ?", userID).Updates(updates)
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
