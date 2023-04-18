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

type CreateOrgPointPayload struct {
	PointsRatio *float64 `json:"PointsRatio"`
}

type CreatePasswordPayload struct {
	PlaintextPassword *string `json:"password"`
}

// used to send data about points totals
type GetPointsTotalsPayload struct {
	Driver       Driver
	Organization Organization
	Total        int
}

type LoginUserPayload struct {
	Email             *string `json:"email"`
	PlaintextPassword *string `json:"password"`
}

type DriverApplicationPayload struct {
	OrganizationID   *int    `json:"OrganizationID"`
	OrganizationName *string `json:"OrganizationName"`
	Status           *string `json:"Status"`
	Reason           *string `json:"Reason"`
}

type SponsorApplicationPayload struct {
	OrganizationID *int    `json:"OrganizationID"`
	DriverUserID   *int    `json:"DriverUserID"`
	DriverName     *string `json:"DriverName"`
	Status         *string `json:"Status"`
}

type IndividualPointsPayload struct {
	PointsCategory *PointsCategory `json:"PointsCategory"`
	Reason         *string         `json:"Reason"`
	CreatedAt      *time.Time      `json:"CreatedAt"`
}

type IndividualReportPayload struct {
	DriverID         *int                      `json:"DriverID"`
	DriverFName      *string                   `json:"DriverFName"`
	DriverLName      *string                   `json:"DriverLName"`
	DriverEmail      *string                   `json:"DriverEmail"`
	OrganizationID   *int                      `json:"OrganizationID"`
	OrganizationName *string                   `json:"OrganizationName"`
	PointHistory     []IndividualPointsPayload `json:"PointsHistory"`
}

type AddToOrgPayload struct {
	DriverID int `json:"DriverID"`
	OrgId    int `json:"OrgId"`
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

// A driver can belong to multiple organizations.
// They can have one primary organization at a time; in OrganizationID
type Driver struct {
	ID             int
	UserID         int  `gorm:"uniqueIndex;not null"`
	User           User `gorm:"constraint:OnDelete:CASCADE;"`
	Status         int  `gorm:"not null;default:0"`
	LicensePlate   string
	TruckType      string
	OrganizationID int
	Organization   Organization    `gorm:"constraint:OnDelete:CASCADE;"`
	Organizations  []*Organization `gorm:"many2many:driver_organizations;constraint:OnDelete:CASCADE;"`
}

// Belongs to an organization
type Sponsor struct {
	ID             int
	UserID         int          `gorm:"uniqueIndex; not null"`
	User           User         `gorm:"constraint:OnDelete:CASCADE;"`
	OrganizationID int          `gorm:"not null"`
	Organization   Organization `gorm:"constraint:OnDelete:CASCADE;"`
}

type Admin struct {
	ID     int
	UserID int `gorm:"uniqueIndex;not null"`
	User   User
}

// An organization is the actual company, i.e Amazon Prime
// An organization will always have atleast one sponsor account belonging to it
// but it can have more than that.
type Organization struct {
	ID          int
	Name        string  `gorm:"not null"`
	Biography   string  `gorm:"default:''"`
	Phone       string  `gorm:"default:''"`
	Email       string  `gorm:"default:''"`
	PointsRatio float64 `gorm:"default:1.0"`
	LogoURL     string  `gorm:"not null"`
	ShopRules   string  `gorm:"default:''"`
}

type PointsCategory struct {
	ID          int
	NumChange   int
	Name        string
	Description string
}

type CreatePointCategoryPayload struct {
	ID          *int    `json:"id"`
	NumChange   *int    `json:"numChange"`
	Name        *string `json:"name"`
	Description *string `json:"description"`
}

// Points has a foreign key for both a driver and sponsor.
// DriverID is the driver whose the points change belongs to
// Organization is the organization who assigned those points.
type Points struct {
	ID               int
	DriverID         int            `gorm:"not null"`
	Driver           Driver         `gorm:"constraint:OnDelete:CASCADE;"`
	OrganizationID   int            `gorm:"not null"`
	Organization     Organization   `gorm:"constraint:OnDelete:CASCADE;"`
	PointsCategoryID int            `gorm:"not null"`
	PointsCategory   PointsCategory `gorm:"constraint:OnDelete:CASCADE;"`
	Reason           string
	CreatedAt        time.Time
}

// used to receive data from client-side
type CreatePointPayload struct {
	ID               *int    `json:"id"`
	DriverID         *int    `json:"driverID"`
	OrganizationID   *int    `json:"organizationID"`
	PointsCategoryID *int    `json:"pointscategoryID"`
	Reason           *string `json:"reason"`
}

type DriverApplication struct {
	DriverUserID   int `gorm:"primaryKey;not null" json:"-"`
	OrganizationID int `gorm:"primaryKey;not null"`
	Status         string
	Reason         string
}

// Logs
type Log struct {
	LogID       int       `gorm:"primaryKey;not null" json:"id"`
	Event       string    `gorm:"not null" json:"event"`
	Status      string    `gorm:"not null" json:"status"`
	Description string    `json:"description"`
	Email       string    `json:"email"`
	Time        time.Time `gorm:"not null" json:"timestamp"`
}

// This stores all catalog purchases/transactions.
// Items added to a user's cart will be included in this table but have the InCart field be true.
// Once purchased/checkedout, InCart will be false and CheckedOut will be true.
// If both are false, that means user added an item to their cart but then decided not to get it.
type Purchase struct {
	ID             int
	DriverID       int          `gorm:"not null"`
	Driver         Driver       `gorm:"constraint:OnDelete:CASCADE;"`
	OrganizationID int          `gorm:"not null"`
	Organization   Organization `gorm:"constraint:OnDelete:CASCADE;"`
	ItemID         string       `gorm:"not null"`
	ItemTitle      string
	ImageURL       string
	Points         int
	InCart         bool `gorm:"not null;default:0"`
	CheckedOut     bool `gorm:"not null;default:0"`
	UpdatedAt      time.Time
}
