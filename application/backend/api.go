package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
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

	dsn := fmt.Sprintf("%s:%s@tcp(team25-rds.cobd8enwsupz.us-east-1.rds.amazonaws.com:3306)/%s?parseTime=true", dbuser, dbpass, schemaName)
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
	db.AutoMigrate(&DriverApplication{})

	db.AutoMigrate(&Log{})

	s.DB = db
}

func (s *Server) MountHandlers() {
	r := s.Router
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

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

		r.Route("/applications", func(r chi.Router) {
			r.Get("/driver", s.GetDriverApplications)
			r.Post("/driver", s.DriverApplyToOrg)

			r.Get("/sponsor", s.GetSponsorApplications)
			r.Post("/sponsor", s.SetApplicationDecision)
		})

		r.Route("/admin", func(r chi.Router) {
			r.Get("/logs", s.GetLogs)
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
				r.Get("/catalog", s.GetUserCatalogCtx)
				r.Put("/profile", s.UpdateProfile)
				r.Put("/reset", s.UpdatePassword)
			})
		})

		r.Route("/catalog", func(r chi.Router) {
			r.Post("/", s.GetCatalog)
		})

		r.Route("/orgs", func(r chi.Router) {
			r.Get("/", s.ListOrgs)
			r.Post("/", s.CreateOrganization)

			r.Route("/{orgID}", func(r chi.Router) {
				r.Get("/", s.GetOrg)
				r.Put("/stats", s.UpdateOrg)
				r.Get("/rules", s.GetRules)
				r.Post("/rules", s.SetRules)
			})
		})

		r.Route("/drivers", func(r chi.Router) {
			r.Get("/", s.ListDrivers)
			r.Route("/u:{userID}", func(r chi.Router) {
				r.Get("/", s.GetDriverByUser)
			})
		})

		r.Route("/sponsors", func(r chi.Router) {
			r.Route("/u:{userID}", func(r chi.Router) {
				r.Get("/", s.GetSponsorByUser)
			})
		})

		r.Route("/points", func(r chi.Router) {
			r.Get("/", s.ListPoints)
			r.Post("/create", s.CreatePoint)
			r.Route("/category", func(r chi.Router) {
				r.Get("/", s.ListPointsCategory)
				r.Post("/create", s.CreatePointCategory)
				r.Put("/", s.UpdatePointsCategory)
			})

			r.Route("/{userID}", func(r chi.Router) {
				r.Get("/totals", s.GetPointsTotal)
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
	s.ConnectDatabase("devCreateRef")

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

		// default for now
		// TODO: Remove this? make 1 default? make org foreign key nullable (this will break things)?
		// TODO: we need a way to actually get accepted to an org from an app before removing this.
		// preload organizations for driver and append the newly accepted one
		driver.OrganizationID = -1
		//driver.Organizations = []*Organization{&organization}

		// creating the sponsor in the database
		createResult := s.DB.Create(&driver)
		// error checking sponsor creation
		if createResult.Error != nil {
			http.Error(w, createResult.Error.Error(), http.StatusBadRequest)
			return
		}
		user.ID = driver.UserID

		// Create application to organization
		driverApp := DriverApplication{
			DriverUserID:   driver.UserID,
			OrganizationID: organization.ID,
			Status:         "Pending",
		}

		// Add application to database
		appResult := s.DB.Create(&driverApp)
		// error checking creation
		if appResult.Error != nil {
			http.Error(w, appResult.Error.Error(), http.StatusBadRequest)
			return
		}

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

func (s *Server) UpdatePassword(w http.ResponseWriter, r *http.Request) {
	data := CreatePasswordPayload{}

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(*data.PlaintextPassword), bcrypt.MinCost)
	if err != nil {
		http.Error(w, "Internal server error: Failed to hash password, could not reset password.", http.StatusInternalServerError)
		return
	}

	updates := make(map[string]interface{})

	if hashedBytes != nil {
		updates["password_hash"] = hashedBytes
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

	w.WriteHeader(200)
}

/// Organization

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
	// writing the response
	returned, _ := json.Marshal(all_orgs)
	w.Header().Set("Content-Type", "application/json")
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
	w.Header().Set("Content-Type", "application/json")
	returned, _ := json.Marshal(org)
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
	org.Phone = *data.Phone
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

func (s *Server) UpdateOrg(w http.ResponseWriter, r *http.Request) {
	data := CreateOrgPointPayload{}

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	updates := make(map[string]interface{})

	if data.PointsRatio != nil {
		updates["points_ratio"] = *data.PointsRatio
	}

	if orgID := chi.URLParam(r, "orgID"); orgID != "" {
		result := s.DB.Model(&Organization{}).Where("id = ?", orgID).Updates(updates)
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Org Not Found", http.StatusNotFound)
			return
		}
	} else {
		http.Error(w, "Org Not Found", http.StatusNotFound)
		return
	}

	w.WriteHeader(200)
}

/// Sponsor

func (s *Server) GetSponsorByUser(w http.ResponseWriter, r *http.Request) {
	var sponsor Sponsor

	if userID := chi.URLParam(r, "userID"); userID != "" {
		result := s.DB.Preload("Organization").First(&sponsor, "user_id = ?", userID)
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Sponsor Not Found", http.StatusNotFound)
			return
		}
	} else {
		http.Error(w, "Sponsor Not Found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	returned, _ := json.Marshal(sponsor)
	w.Write(returned)
}

// Driver Applications
func (s *Server) GetDriverApplications(w http.ResponseWriter, r *http.Request) {
	var orgs []Organization
	var driver Driver

	// Find Driver
	driverID := r.URL.Query().Get("driverID")
	if driverID != "" {
		result := s.DB.Find(&driver, "user_id = ?", driverID)
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Driver Not Found", http.StatusNotFound)
			return
		}
	} else {
		http.Error(w, "Driver Not Found", http.StatusNotFound)
		return
	}

	s.DB.Find(&orgs)

	var appList []DriverApplicationPayload
	for i := 0; i < len(orgs); i++ {
		var app DriverApplication
		result := s.DB.Where("driver_user_id = ? AND organization_id = ?", driver.UserID, orgs[i].ID).First(&app)

		var status string
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			status = "Apply Now"
		} else {
			status = app.Status
		}

		appList = append(appList, DriverApplicationPayload{
			OrganizationID:   &orgs[i].ID,
			OrganizationName: &orgs[i].Name,
			Status:           &status,
			Reason:           &app.Reason,
		})
	}

	// ? writing the response
	returned, _ := json.Marshal(appList)
	w.Header().Set("Content-Type", "application/json")
	w.Write(returned)
}

func (s *Server) DriverApplyToOrg(w http.ResponseWriter, r *http.Request) {
	var driver Driver
	var org Organization

	// Find Driver
	driverID := r.URL.Query().Get("driverID")
	if driverID != "" {
		result := s.DB.Find(&driver, "user_id = ?", driverID)
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Driver Not Found", http.StatusNotFound)
			return
		}
	} else {
		http.Error(w, "Driver Not Found", http.StatusNotFound)
		return
	}

	// Find organzation
	orgID := r.URL.Query().Get("organizationID")
	if orgID != "" {
		result := s.DB.Find(&org, "id = ?", orgID)
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Organization Not Found", http.StatusNotFound)
			return
		}
	} else {
		http.Error(w, "Organization Not Found", http.StatusNotFound)
		return
	}

	// Check if the driver already belongs to the organzation
	var count int64
	s.DB.Preload("drivers").Where("organization_id = ?", orgID).Count(&count)
	if count < 0 {
		http.Error(w, "Driver already belongs to organization", http.StatusConflict)
		return
	}

	// Check if the driver has an existing application
	var driverApplications []DriverApplication
	s.DB.Find(&driverApplications, "driver_user_id = ? AND organization_id = ?", driverID, orgID).Count(&count)
	if count > 0 {
		http.Error(w, "Driver has existing application to organization", http.StatusConflict)
		return
	}

	driverApp := DriverApplication{
		DriverUserID:   driver.UserID,
		OrganizationID: org.ID,
		Status:         "Pending",
	}

	// Add application to database
	createResult := s.DB.Create(&driverApp)
	// error checking creation
	if createResult.Error != nil {
		http.Error(w, createResult.Error.Error(), http.StatusBadRequest)
		return
	}

	description := fmt.Sprintf("driver_user_id: %d; organization_id: %d", driver.UserID, org.ID)

	log := Log{
		Event:       "Driver Application Created",
		Email:       driver.User.Email,
		Time:        time.Now(),
		Description: description,
		Status:      "Success",
	}

	s.DB.Create(&log)

	w.WriteHeader(200)
	w.Write([]byte("Application Created"))
}

// Sponor applications
func (s *Server) GetSponsorApplications(w http.ResponseWriter, r *http.Request) {
	var sponsor Sponsor

	// Find Driver
	sponsorID := r.URL.Query().Get("sponsorID")
	if sponsorID != "" {
		result := s.DB.Find(&sponsor, "user_id = ?", sponsorID)
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Sponsor Not Found", http.StatusNotFound)
			return
		}
	} else {
		http.Error(w, "Sponsor Not Found", http.StatusNotFound)
		return
	}

	var apps []DriverApplication
	s.DB.Find(&apps, "organization_id = ?", sponsor.OrganizationID)

	var appList []SponsorApplicationPayload
	for i, element := range apps {
		var user User

		s.DB.Find(&user, "id = ?", element.DriverUserID)

		appList = append(appList, SponsorApplicationPayload{
			OrganizationID: &apps[i].OrganizationID,
			DriverUserID:   &user.ID,
			DriverName:     &user.FirstName,
			Status:         &apps[i].Status,
		})
	}

	// ? writing the response
	returned, _ := json.Marshal(appList)
	w.Header().Set("Content-Type", "application/json")
	w.Write(returned)
}

func (s *Server) SetApplicationDecision(w http.ResponseWriter, r *http.Request) {
	var driver Driver
	var sponsor Sponsor
	var org Organization

	// Find Driver
	driverID := r.URL.Query().Get("driverID")
	if driverID != "" {
		result := s.DB.Preload("Organizations").Find(&driver, "user_id = ?", driverID)
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Driver Not Found", http.StatusNotFound)
			return
		}
	} else {
		http.Error(w, "Driver Not Found", http.StatusNotFound)
		return
	}

	// Find organzation
	sponsorID := r.URL.Query().Get("sponsorID")
	if sponsorID != "" {
		result := s.DB.Find(&sponsor, "user_id = ?", sponsorID)
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Sponsor Not Found", http.StatusNotFound)
			return
		}
	} else {
		http.Error(w, "Sponsor Not Found", http.StatusNotFound)
		return
	}

	// Find organzation
	result := s.DB.Find(&org, "id = ?", sponsor.OrganizationID)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		http.Error(w, "Organization Not Found", http.StatusNotFound)
		return
	}

	updates := make(map[string]interface{})

	if r.URL.Query().Get("accepted") == "true" {
		updates["status"] = "Accepted"
	} else {
		updates["status"] = "Denied"
	}

	updates["reason"] = r.URL.Query().Get("reason")

	s.DB.Model(&DriverApplication{}).Where("driver_user_id = ? AND organization_id = ?", driver.UserID, org.ID).Updates(updates)
	//added call to update organizations with newly accepted org
	driver.Organizations = append(driver.Organizations, &org)
	driver.OrganizationID = org.ID
	s.DB.Save(driver)
	description := fmt.Sprintf("driver_user_id: %d; organization_id: %d; sponsor_id: %d; reason: %s", driver.ID, org.ID, sponsor.ID, r.URL.Query().Get("reason"))

	log := Log{
		Event:       "Driver Application Response",
		Email:       sponsor.User.Email,
		Time:        time.Now(),
		Description: description,
		Status:      "Success",
	}

	s.DB.Create(&log)

	w.WriteHeader(200)
}

// / Points
func (s *Server) GetPointsTotal(w http.ResponseWriter, r *http.Request) {
	// initializing user
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
	// returning info based on user role
	switch user.Type {
	case 0: // if driver
		// getting the driver
		var driver Driver

		resultDriver := s.DB.Model(&Driver{}).
			Preload("Organizations").
			First(&driver, "user_id = ?", user.ID)

		if errors.Is(resultDriver.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Driver Not Found", http.StatusNotFound)
			return
		}
		// getting all the points based on the drivers orgs
		var pointsTotals []GetPointsTotalsPayload
		for _, organization := range driver.Organizations {
			// getting points totals
			var pointsTotal GetPointsTotalsPayload
			pointsTotal.Organization = *organization
			pointsTotal.Driver = driver

			result := s.DB.Model(&Points{}).
				Preload("PointsCategory").
				Joins("JOIN points_categories pc ON pc.id = points.points_category_id").
				Select("sum(pc.num_change)").
				Where("driver_id = ? and organization_id = ?", driver.ID, organization.ID).
				Scan(&pointsTotal.Total)

			if result.Error != nil {
				pointsTotal.Total = 0
			}

			pointsTotals = append(pointsTotals, pointsTotal)
		}

		// writing return
		w.Header().Set("Content-Type", "application/json")
		returned, _ := json.Marshal(pointsTotals)
		w.Write(returned)

		// TESTING: Untested areas:
		//		1. Drivers associated orgs > 1

	case 1: // sponsor
		// implement later
		fmt.Print("Getting Sponsor Point info!\n")
	case 2: // admin
		// implement later
		fmt.Print("Getting Admin Point info!\n")
	default:
		fmt.Print("Error! Attempting to get point info for a user with no role!\n")
	}
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

	log := Log{
		Event: "Login",
		Email: "",
		Time:  time.Now(),
	}

	if err != nil {
		fmt.Print("Http error\n")
		http.Error(w, err.Error(), http.StatusBadRequest)

		log.Description = "Http error"
		log.Status = "Error"
		s.DB.Create(&log)

		return
	}

	if data.Email == nil {
		fmt.Print("Email error\n")
		http.Error(w, "LoginUserPayload missing required field: \"email\"", http.StatusNotFound)

		log.Description = "LoginUserPayload missing required field: \"email\""
		log.Status = "Error"
		s.DB.Create(&log)

		return
	}

	if data.PlaintextPassword == nil {
		fmt.Print("Password error\n")
		http.Error(w, "LoginUserPayload missing required field: \"password\"", http.StatusNotFound)

		log.Description = "LoginUserPayload missing required field: \"password\""
		log.Status = "Error"
		s.DB.Create(&log)

		return
	}

	var user User

	// Get hash from database for user, if exists.
	result := s.DB.Where("email = ?", data.Email).First(&user)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) || result.Error != nil {
		http.Error(w, "User not found", http.StatusNotFound)

		log.Description = "User not found"
		log.Status = "Error"
		log.Email = *data.Email
		s.DB.Create(&log)

		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(*data.PlaintextPassword))
	if err != nil {
		http.Error(w, "User authentication failed: wrong password.", http.StatusUnauthorized)

		log.Description = "User authentication failed: wrong password."
		log.Status = "Error"
		log.Email = *data.Email
		s.DB.Create(&log)

		return
	}

	// Generate the token string
	_, token, _ := tokenAuth.Encode(map[string]interface{}{
		"email":      data.Email,
		"authorized": true,
		"role":       user.Type,
		"id":         user.ID,
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

	http.SetCookie(w, &jwtCookie)

	log.Status = "Success"
	log.Description = ""
	log.Email = *data.Email
	s.DB.Create(&log)

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

func (s *Server) ListPoints(w http.ResponseWriter, r *http.Request) {
	var points []Points

	result := s.DB.Find(&points)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusBadRequest)
		return
	}

	returned, _ := json.Marshal(points)
	w.Header().Set("Content-Type", "application/json")
	w.Write(returned)
}

func (s *Server) CreatePoint(w http.ResponseWriter, r *http.Request) {
	// Recieing data fomr client-side json and errochecking it
	data := CreatePointPayload{}
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if data.DriverID == nil {
		http.Error(w, "CreatePointPayload missing required field: \"DriverID\"", http.StatusBadRequest)
		return
	}
	if data.OrganizationID == nil {
		http.Error(w, "CreatePointPayload missing required field: \"OrganizationID\"", http.StatusBadRequest)
		return
	}
	if data.PointsCategoryID == nil {
		http.Error(w, "CreatePointPayload missing required field: \"PointsCategoryID\"", http.StatusBadRequest)
		return
	}
	if data.Reason == nil {
		http.Error(w, "CreatePointPayload missing required field: \"Reason\"", http.StatusBadRequest)
		return
	}

	// creating org variable
	var point Points
	point.DriverID = *data.DriverID
	point.OrganizationID = *data.OrganizationID
	point.PointsCategoryID = *data.PointsCategoryID
	point.Reason = *data.Reason

	// injecting org into database
	result := s.DB.Create(&point)
	// error checking injection
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusBadRequest)
		return
	}

	returned, _ := json.Marshal(point)
	w.Write(returned)
}

func (s *Server) ListPointsCategory(w http.ResponseWriter, r *http.Request) {
	var pointsCat []PointsCategory

	result := s.DB.Find(&pointsCat)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusBadRequest)
		return
	}

	returned, _ := json.Marshal(pointsCat)
	w.Header().Set("Content-Type", "application/json")
	w.Write(returned)
}

func (s *Server) CreatePointCategory(w http.ResponseWriter, r *http.Request) {
	// Recieing data fomr client-side json and errochecking it
	data := CreatePointCategoryPayload{}
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if data.NumChange == nil {
		http.Error(w, "CreatePointCategory missing required field: \"NumChange\"", http.StatusBadRequest)
		return
	}
	if data.Name == nil {
		http.Error(w, "CreatePointCategory missing required field: \"Name\"", http.StatusBadRequest)
		return
	}
	if data.Description == nil {
		http.Error(w, "CreatePointCategory missing required field: \"Description\"", http.StatusBadRequest)
		return
	}

	// creating points category variable
	var pointsCat PointsCategory
	pointsCat.NumChange = *data.NumChange
	pointsCat.Name = *data.Name
	pointsCat.Description = *data.Description

	// injecting org into database
	result := s.DB.Create(&pointsCat)
	// error checking injection
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusBadRequest)
		return
	}

	returned, _ := json.Marshal(pointsCat)
	w.Write(returned)
}

func (s *Server) UpdatePointsCategory(w http.ResponseWriter, r *http.Request) {
	data := CreatePointCategoryPayload{}

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	updates := make(map[string]interface{})

	if data.NumChange != nil {
		updates["num_change"] = *data.NumChange
	}
	if data.Description != nil {
		updates["description"] = *data.Description
	}
	if data.Name != nil {
		updates["name"] = *data.Name
	}

	result := s.DB.Model(&PointsCategory{}).Where("id = ?", data.ID).Updates(updates)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		http.Error(w, "Point Category Not Found", http.StatusNotFound)
		return
	}

}

func (s *Server) ListDrivers(w http.ResponseWriter, r *http.Request) {
	var drivers []Driver

	result := s.DB.Find(&drivers)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusBadRequest)
		return
	}

	returned, _ := json.Marshal(drivers)
	w.Header().Set("Content-Type", "application/json")
	w.Write(returned)
}

func (s *Server) GetDriverByUser(w http.ResponseWriter, r *http.Request) {
	var driver Driver

	if userID := chi.URLParam(r, "userID"); userID != "" {
		result := s.DB.Preload("Organization").First(&driver, "user_id = ?", userID)
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Driver Not Found", http.StatusNotFound)
			return
		}
	} else {
		http.Error(w, "Driver Not Found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	returned, _ := json.Marshal(driver)
	w.Write(returned)
}

func (s *Server) GetLogs(w http.ResponseWriter, r *http.Request) {
	var logs []Log

	result := s.DB.Find(&logs)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	returned, _ := json.Marshal(logs)
	w.Header().Set("Content-Type", "application/json")
	w.Write(returned)
}

func (s *Server) GetRules(w http.ResponseWriter, r *http.Request) {
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

	w.Header().Set("Content-Type", "application/json")
	returned, _ := json.Marshal(org.ShopRules)
	w.Write(returned)
}

func (s *Server) SetRules(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusBadRequest)
		return
	}

	// Convert the byte slice to a string
	data := string(body)

	updates := make(map[string]interface{})

	updates["shop_rules"] = data

	if orgID := chi.URLParam(r, "orgID"); orgID != "" {
		result := s.DB.Model(&Organization{}).Where("id = ?", orgID).Updates(updates)
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "Org Not Found", http.StatusNotFound)
			return
		}
	} else {
		http.Error(w, "Org Not Found", http.StatusNotFound)
		return
	}

	w.WriteHeader(200)
}
