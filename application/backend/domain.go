package main

import "time"

type UserProfilePayload struct {
	FirstName *string `json:"firstName"`
	LastName  *string `json:"lastName"`
	Phone     *string `json:"phone"`
	Bio       *string `json:"bio"`
	ImageURL  *string `json:"image"`
}

type CreateUserPayload struct {
	// user fields
	Email             *string `json:"email"`
	PlaintextPassword *string `json:"password"`
	FirstName         *string `json:"firstName"`
	LastName          *string `json:"lastName"`
	Type              *int    `json:"type"`
	// driver fields
	LicenceNumber *string `json:"licenceNumber"`
	TruckType     *string `json:"truckType"`
	// driver/sponsor fields
	OrganizationId *int `json:"organizationId"`
}

// used to receive data from client-side
type CreateOrgPayload struct {
	Name    *string `json:"name"`
	Bio     *string `json:"bio"`
	Phone   *string `json:"phone"`
	Email   *string `json:"email"`
	LogoURL *string `json:"logoURL"`
}

type LoginUserPayload struct {
	Email             *string `json:"email"`
	PlaintextPassword *string `json:"password"`
}

// Type is a discriminator for different subtypes: driver, sponsor, admin
// 0 -> Driver, 1 -> Sponsor, 2 -> Admin
// User has a custom Marshaler which omits the password hash.
// This will be used as a "Protected User View" for GET /users but not POST /users
type User struct {
	ID           int    `json:"id"`
	Email        string `json:"email" gorm:"unique;not null"`
	PasswordHash string `json:"password,omitempty" gorm:"not null"`
	FirstName    string `json:"firstName" gorm:"not null"`
	LastName     string `json:"lastName" gorm:"not null"`
	Phone        string `json:"phone" gorm:"default:''"`
	Bio          string `json:"bio" gorm:"default:''"`
	ImageURL     string `json:"image" gorm:"default:''"`
	Type         int    `json:"type" gorm:"not null, default:0"`
}

type Driver struct {
	ID             int
	UserID         int `gorm:"uniqueIndex;not null"`
	User           User
	OrganizationID int `gorm:"not null"`
	Organization   Organization
	Status         int `gorm:"not null;default:0"`
	LicensePlate   string
	TruckType      string
}

type Sponsor struct {
	ID             int
	UserID         int `gorm:"uniqueIndex;not null"`
	User           User
	OrganizationID int `gorm:"not null"`
	Organization   Organization
}

type Admin struct {
	ID     int
	UserID int `gorm:"uniqueIndex;not null"`
	User   User
}

type Organization struct {
	ID        int
	Name      string `gorm:"not null"`
	Biography string `gorm:"default:''"`
	Phone     string `gorm:"default:''"`
	Email     string `gorm:"default:''"`
	LogoURL   string `gorm:"not null"`
}

type Points struct {
	ID        int
	DriverID  int `gorm:"uniqueIndex;not null"`
	Driver    Driver
	NumChange int
	Reason    string
	Total     int
	CreatedAt time.Time
}
