package main

import "time"

type CreateUserPayload struct {
	Email             *string `json:"email"`
	PlaintextPassword *string `json:"password"`
	FirstName         *string `json:"firstName"`
	LastName          *string `json:"lastName"`
	Type              *int    `json:"type"`
}

type LoginUserPayload struct {
	Email             *string `json:"email"`
	PlaintextPassword *string `json:"password"`
}

// Type is a discriminator for different subtypes: driver, sponsor, admin
// 0 -> Driver, 1 -> Sponsor, 2 -> Admin
type User struct {
	ID           int    `json:"id"`
	Email        string `json:"email" gorm:"unique;not null"`
	PasswordHash string `json:"password" gorm:"not null"`
	FirstName    string `json:"firstName" gorm:"not null"`
	LastName     string `json:"lastName" gorm:"not null"`
	Type         int    `json:"type" gorm:"not null, default:0"`
}

// TODO: UserProtectedView struct for seeing user information
// from database but exclude things like password hash ?

type Driver struct {
	ID           int
	UserID       int `gorm:"uniqueIndex;not null"`
	User         User
	SponsorID    int `gorm:"not null"`
	Sponsor      Sponsor
	Status       int `gorm:"not null;default:0"`
	LicensePlate int
	TruckType    string
}

type Sponsor struct {
	ID     int
	UserID int `gorm:"uniqueIndex;not null"`
	User   User
	//OrganizationID int `gorm:"uniqueIndex"`
	//Organization   Organization
}

type Admin struct {
	ID     int
	UserID int `gorm:"uniqueIndex;not null"`
	User   User
}

type Profile struct {
	ID     int // primary key
	UserID int `gorm:"uniqueIndex;not null"` // foreign key for user
	User   User
	Phone  string `gorm:"default:''"`
	Bio    string `gorm:"default:''"`
	Image  string `gorm:"default:''"`
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
