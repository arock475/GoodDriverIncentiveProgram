package main

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
	UserID         int `gorm:"uniqueIndex;not null"`
	User           User
	Status         int `gorm:"not null;default:0"`
	LicensePlate   string
	TruckType      string
	OrganizationID int
	Organization   Organization
	Organizations  []*Organization `gorm:"many2many:driver_organizations;"`
}

// Belongs to an organization
type Sponsor struct {
	ID             int
	UserID         int `gorm:"uniqueIndex; not null"`
	User           User
	OrganizationID int `gorm:"not null"`
	Organization   Organization
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
<<<<<<< HEAD
	ID        int
	Name      string    `gorm:"not null"`
	Biography string    `gorm:"default:''"`
	Phone     string    `gorm:"default:''"`
	Email     string    `gorm:"default:''"`
	LogoURL   string    `gorm:"not null"`
	Drivers   []*Driver `gorm:"many2many:driver_organizations;"`
=======
	ID          int
	Name        string  `gorm:"not null"`
	Biography   string  `gorm:"default:''"`
	Phone       string  `gorm:"default:''"`
	Email       string  `gorm:"default:''"`
	PointsRatio float64 `gorm:"default:1.0"`
	LogoURL     string  `gorm:"not null"`
>>>>>>> main
}

// Points has a foreign key for both a driver and sponsor.
// DriverID is the driver whose the points change belongs to
// Organization is the organization who assigned those points.
type Points struct {
	ID             int
	DriverID       int `gorm:"not null"`
	Driver         Driver
	OrganizationID int `gorm:"not null"`
	Organization   Organization
	NumChange      int
	Reason         string
<<<<<<< HEAD
	CreatedAt      time.Time
	Name           string
	Catalog        int
=======
	CreatedAt      string
	Name           string
	Catalog        int
}

// used to receive data from client-side
type CreatePointPayload struct {
	ID             *int    `json:"id"`
	DriverID       *int    `json:"driverID"`
	OrganizationID *int    `json:"organizationID"`
	NumChange      *int    `json:"numChange"`
	Reason         *string `json:"reason"`
	CreatedAt      *string `json:"createdAt"`
	Name           *string `json:"name"`
	Catalog        *int    `json:"catalog"`
}

type DriverApplication struct {
	DriverUserID   int `gorm:"primaryKey;not null" json:"-"`
	OrganizationID int `gorm:"primaryKey;not null"`
	Status         string
>>>>>>> main
}
