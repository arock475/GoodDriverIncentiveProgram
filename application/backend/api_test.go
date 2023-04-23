package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strconv"
	"testing"

	"github.com/stretchr/testify/require"
)

func executeRequest(req *http.Request, s *Server) *httptest.ResponseRecorder {
	rr := httptest.NewRecorder()
	s.Router.ServeHTTP(rr, req)

	return rr
}

func checkResponseCode(t *testing.T, expected, actual int) {
	if expected != actual {
		t.Errorf("Expected response code %d. Got %d\n", expected, actual)
	}
}

var ts *Server

// Make server/router/db connection once for all tests
func TestMain(m *testing.M) {
	ts = CreateNewServer()
	ts.MountHandlers()
	ts.ConnectDatabase("TestingStable")

	// Delete data from previous tests
	ts.DB.Where("1=1").Delete(&Points{})
	ts.DB.Where("1=1").Delete(&PointsCategory{})
	ts.DB.Where("1=1").Delete(&Driver{})
	ts.DB.Where("1=1").Delete(&Sponsor{})
	ts.DB.Where("1=1").Delete(&Admin{})
	ts.DB.Where("1=1").Delete(&Organization{})
	ts.DB.Where("1=1").Delete(&DriverApplication{})
	ts.DB.Where("1=1").Delete(&Purchase{})
	ts.DB.Where("1=1").Delete(&Log{})
	ts.DB.Where("1=1").Delete(&User{})

	//// Insert values to start tests with

	// Default org
	default_org := Organization{
		ID:          -1,
		Name:        "Unassigned",
		Biography:   "",
		Phone:       "",
		Email:       "",
		PointsRatio: 1,
		LogoURL:     "",
		ShopRules:   "",
	}
	ts.DB.Create(&default_org)

	// Test org
	test_org := Organization{
		ID:          1,
		Name:        "Testing Organization",
		Biography:   "For TestingStable",
		Phone:       "",
		Email:       "testing@organization.com",
		PointsRatio: 1,
		LogoURL:     "",
		ShopRules:   "",
	}
	ts.DB.Create(&test_org)

	// Points Categories
	pt_cat := PointsCategory{
		NumChange:   25,
		Name:        "Good Driving",
		Description: "Good driver points",
	}
	ts.DB.Create(&pt_cat)

	// Driver
	driver_user := User{
		ID:           1,
		Email:        "test@testman.com",
		PasswordHash: "$2a$04$TbpALctI05DUUh2aTbjXfeAJQOTLt0u7qt2C4KP5jnDEsMEonHKrG",
		FirstName:    "Test",
		LastName:     "Man",
		Phone:        "",
		Bio:          "",
		ImageURL:     "",
		Type:         0,
	}
	ts.DB.Create(&driver_user)

	driver := Driver{
		ID:             1,
		UserID:         driver_user.ID,
		User:           driver_user,
		Status:         0,
		LicensePlate:   "123UPS",
		TruckType:      "Semi-Truck",
		OrganizationID: test_org.ID,
		Organization:   test_org,
	}
	ts.DB.Create(&driver)

	// Add points to driver
	points := Points{
		DriverID:         driver.ID,
		Driver:           driver,
		OrganizationID:   test_org.ID,
		Organization:     test_org,
		PointsCategoryID: pt_cat.ID,
		PointsCategory:   pt_cat,
		Reason:           "Reason",
	}
	points.ID = 1
	ts.DB.Create(&points)
	points.ID = 2
	ts.DB.Create(&points)

	fmt.Print("Starting Tests\n\n\n")

	exitVal := m.Run()

	os.Exit(exitVal)
}

func TestListUsers(t *testing.T) {
	fmt.Println("Testing: TestListUsers")

	req, _ := http.NewRequest("GET", "/users", nil)

	response := executeRequest(req, ts)

	checkResponseCode(t, http.StatusOK, response.Code)

	t.Log(response.Body.String())

	var users []User
	err := json.Unmarshal(response.Body.Bytes(), &users)
	if err != nil {
		t.Error("Failed to unmarshal response body from GET /users")
	}

	require.NotEmpty(t, users, "Failed to get back any users from database")
}

func TestGetUser(t *testing.T) {
	fmt.Println("Testing: TestGetUser")

	req, _ := http.NewRequest("GET", "/users/1", nil)

	response := executeRequest(req, ts)

	checkResponseCode(t, http.StatusOK, response.Code)

	t.Log(response.Body.String())

	var user User
	err := json.Unmarshal(response.Body.Bytes(), &user)
	if err != nil {
		t.Error("Failed to unmarshal response body from GET /users/{id}")
	}

	require.Equal(t, user.Email, "test@testman.com")
}

func TestPasswordNotIncluded(t *testing.T) {
	fmt.Println("Testing: TestPasswordNotIncluded")

	req, _ := http.NewRequest("GET", "/users/1", nil)

	response := executeRequest(req, ts)

	checkResponseCode(t, http.StatusOK, response.Code)

	t.Log(response.Body.String())

	var user User
	err := json.Unmarshal(response.Body.Bytes(), &user)
	if err != nil {
		t.Error("Failed to unmarshal response body from GET /users/{id}")
	}

	require.Empty(t, user.PasswordHash, "Failed to not include password hash when getting user.")
}

func TestCreateUser(t *testing.T) {
	fmt.Println("Testing: TestCreateUser")

	firstName := "New"
	lastName := "User"
	email := "newuser@testing.com"
	password := "mypassword$"
	license := "123USP"
	truck := "Semi-Truck"
	org := 1
	ttype := 0

	data := CreateUserPayload{
		FirstName:         &firstName,
		LastName:          &lastName,
		Email:             &email,
		PlaintextPassword: &password,
		LicenceNumber:     &license,
		TruckType:         &truck,
		OrganizationId:    &org,
		Type:              &ttype,
	}

	jsonBody, _ := json.Marshal(data)
	bodyReader := bytes.NewReader(jsonBody)

	req, _ := http.NewRequest("POST", "/users", bodyReader)

	response := executeRequest(req, ts)

	checkResponseCode(t, http.StatusOK, response.Code)

	t.Log(response.Body.String())

	var user User
	err := json.Unmarshal(response.Body.Bytes(), &user)
	if err != nil {
		t.Error("Failed to unmarshal response body from GET /users/{id}")
	}

	require.NotEqual(t, user.ID, 0, "Newly created user does not have a new ID.")
	require.Equal(t, user.FirstName, firstName)
	require.Equal(t, user.LastName, lastName)
	require.Equal(t, user.Email, email)
	require.Equal(t, user.Type, ttype)

}

func TestUpdateProfile(t *testing.T) {
	fmt.Println("Testing: TestUpdateProfile")

	firstName := "Update"
	lastName := "User"
	email := "updateuser@testing.com"
	password := "mypassword$"
	license := "Update"
	truck := "Semi-Truck"
	org := 1
	ttype := 0

	data := CreateUserPayload{
		FirstName:         &firstName,
		LastName:          &lastName,
		Email:             &email,
		PlaintextPassword: &password,
		LicenceNumber:     &license,
		TruckType:         &truck,
		OrganizationId:    &org,
		Type:              &ttype,
	}

	// Create a new user
	jsonBody, _ := json.Marshal(data)
	bodyReader := bytes.NewReader(jsonBody)

	req, _ := http.NewRequest("POST", "/users/", bodyReader)
	response := executeRequest(req, ts)
	checkResponseCode(t, http.StatusOK, response.Code)

	t.Log(response.Body.String())

	var user User
	err := json.Unmarshal(response.Body.Bytes(), &user)
	if err != nil {
		t.Error("Failed to unmarshal response body from POST /users/")
	}

	// Attempt to update profile of newly created user.
	newfname := "Updated"
	newlname := "Name"
	phone := "123-456-7890"
	bio := "Biography"
	image := "www.test.com"

	data2 := UserProfilePayload{
		FirstName: &newfname,
		LastName:  &newlname,
		Phone:     &phone,
		Bio:       &bio,
		ImageURL:  &image,
	}

	jsonBody, _ = json.Marshal(data2)
	bodyReader = bytes.NewReader(jsonBody)

	req, _ = http.NewRequest("PUT", fmt.Sprintf("/users/%d/profile", user.ID), bodyReader)
	response = executeRequest(req, ts)
	checkResponseCode(t, http.StatusOK, response.Code)

	// Attempt to retrieve user after updating
	req, _ = http.NewRequest("GET", fmt.Sprintf("/users/%d", user.ID), nil)
	response = executeRequest(req, ts)
	checkResponseCode(t, http.StatusOK, response.Code)

	t.Log(response.Body.String())

	err = json.Unmarshal(response.Body.Bytes(), &user)
	if err != nil {
		t.Error("Failed to unmarshal response body from GET /users/{id}")
	}

	require.Equal(t, user.FirstName, newfname)
	require.Equal(t, user.LastName, newlname)
	require.Equal(t, user.Phone, phone)
	require.Equal(t, user.Bio, bio)
	require.Equal(t, user.ImageURL, image)
}

func TestFailedLogin(t *testing.T) {
	fmt.Println("Testing: TestFailedLogin")

	firstName := "FailedLogin"
	lastName := "User"
	email := "failedloginuser@testing.com"
	password := "mypassword$"
	license := "FailedLogin"
	truck := "Semi-Truck"
	org := 1
	ttype := 0

	data := CreateUserPayload{
		FirstName:         &firstName,
		LastName:          &lastName,
		Email:             &email,
		PlaintextPassword: &password,
		LicenceNumber:     &license,
		TruckType:         &truck,
		OrganizationId:    &org,
		Type:              &ttype,
	}

	jsonBody, _ := json.Marshal(data)
	bodyReader := bytes.NewReader(jsonBody)

	// Create new user
	req, _ := http.NewRequest("POST", "/users", bodyReader)
	response := executeRequest(req, ts)
	checkResponseCode(t, http.StatusOK, response.Code)

	var user User
	err := json.Unmarshal(response.Body.Bytes(), &user)
	if err != nil {
		t.Error("Failed to unmarshal response body from GET /users/{id}")
	}

	// Test login payload with the same email but a different password
	// for the newly created user
	wrongPassword := "notcorrect!"
	data2 := LoginUserPayload{
		Email:             &email,
		PlaintextPassword: &wrongPassword,
	}

	jsonBody, _ = json.Marshal(data2)
	bodyReader = bytes.NewReader(jsonBody)

	// Attempt to login the new user with incorrect crednetials
	req, _ = http.NewRequest("POST", "/login", bodyReader)
	response = executeRequest(req, ts)
	checkResponseCode(t, http.StatusUnauthorized, response.Code)

	// Should be rejected with status unauthorized (401)
	require.Equal(t, http.StatusUnauthorized, response.Code)
}

func TestCreateAdmin(t *testing.T) {
	fmt.Println("Testing: TestCreateAdmin")

	// creating test data
	firstName := "New"
	lastName := "Admin"
	email := "newadmin@testing.com"
	password := "x"
	ttype := 2
	data := CreateUserPayload{
		FirstName:         &firstName,
		LastName:          &lastName,
		Email:             &email,
		PlaintextPassword: &password,
		Type:              &ttype,
	}

	// turning test data into a json body that can be used
	jsonBody, _ := json.Marshal(data)
	bodyReader := bytes.NewReader(jsonBody)

	req, _ := http.NewRequest("POST", "/users", bodyReader)

	response := executeRequest(req, ts)

	checkResponseCode(t, http.StatusOK, response.Code)

	// putting the returned response into User to compare
	t.Log(response.Body.String())
	var user User
	err := json.Unmarshal(response.Body.Bytes(), &user)
	if err != nil {
		t.Error("Failed to unmarshal response body from GET /users/{id}")
	}
	require.NotEqual(t, user.ID, 0, "Newly created user does not have a new ID.")
	require.Equal(t, user.FirstName, firstName)
	require.Equal(t, user.LastName, lastName)
	require.Equal(t, user.Email, email)
	require.Equal(t, user.Type, ttype)
	// clearing out admin
	var admin Admin
	ts.DB.Where("user_id = ?", user.ID).Delete(&admin)
}

func TestDriverLogin(t *testing.T) {
	fmt.Println("Testing: TestDriverLogin")

	firstName := "Login"
	lastName := "Driver"
	email := "logindriver@testing.com"
	password := "mypassword$"
	license := "123USP"
	truck := "Semi-Truck"
	org := 1
	ttype := 0

	data := CreateUserPayload{
		FirstName:         &firstName,
		LastName:          &lastName,
		Email:             &email,
		PlaintextPassword: &password,
		LicenceNumber:     &license,
		TruckType:         &truck,
		OrganizationId:    &org,
		Type:              &ttype,
	}

	jsonBody, _ := json.Marshal(data)
	bodyReader := bytes.NewReader(jsonBody)

	// Create new user
	req, _ := http.NewRequest("POST", "/users", bodyReader)
	response := executeRequest(req, ts)
	checkResponseCode(t, http.StatusOK, response.Code)

	var user User
	err := json.Unmarshal(response.Body.Bytes(), &user)
	if err != nil {
		t.Error("Failed to unmarshal response body from GET /users/{id}")
	}

	// Test login payload with the same email and password
	// for the newly created user
	data2 := LoginUserPayload{
		Email:             &email,
		PlaintextPassword: &password,
	}

	jsonBody, _ = json.Marshal(data2)
	bodyReader = bytes.NewReader(jsonBody)

	// Attempt to login the new user
	req, _ = http.NewRequest("POST", "/login", bodyReader)
	response = executeRequest(req, ts)
	checkResponseCode(t, http.StatusOK, response.Code)

	require.Equal(t, http.StatusOK, response.Code)
}

func TestLoginSponsor(t *testing.T) {
	fmt.Println("Testing: TestLoginSponsor")

	// creating test data
	firstName := "New"
	lastName := "Sponsor"
	email := "newsponsor@testing.com"
	password := "x"
	ttype := 1
	org := 1
	data := CreateUserPayload{
		FirstName:         &firstName,
		LastName:          &lastName,
		Email:             &email,
		PlaintextPassword: &password,
		Type:              &ttype,
		OrganizationId:    &org,
	}

	// turning test data into a json body that can be used
	jsonBody, _ := json.Marshal(data)
	bodyReader := bytes.NewReader(jsonBody)

	req, _ := http.NewRequest("POST", "/users", bodyReader)

	response := executeRequest(req, ts)

	checkResponseCode(t, http.StatusOK, response.Code)

	var user User
	err := json.Unmarshal(response.Body.Bytes(), &user)
	if err != nil {
		t.Error("Failed to unmarshal response body from GET /users/{id}")
	}

	data2 := LoginUserPayload{
		Email:             &email,
		PlaintextPassword: &password,
	}

	jsonBody, _ = json.Marshal(data2)
	bodyReader = bytes.NewReader(jsonBody)

	// Attempt to login the new sponsor
	req, _ = http.NewRequest("POST", "/login", bodyReader)
	response = executeRequest(req, ts)
	checkResponseCode(t, http.StatusOK, response.Code)

	require.Equal(t, http.StatusOK, response.Code)
	ts.DB.Delete(&Sponsor{}, "user_id = ?", user.ID)
	ts.DB.Delete(&User{}, user.ID)
}

func TestLoginAdmin(t *testing.T) {
	fmt.Println("Testing: TestLoginAdmin")

	// creating test data
	firstName := "Login"
	lastName := "Admin"
	email := "loginadmin@testing.com"
	password := "x"
	ttype := 2
	data := CreateUserPayload{
		FirstName:         &firstName,
		LastName:          &lastName,
		Email:             &email,
		PlaintextPassword: &password,
		Type:              &ttype,
	}

	// turning test data into a json body that can be used
	jsonBody, _ := json.Marshal(data)
	bodyReader := bytes.NewReader(jsonBody)

	req, _ := http.NewRequest("POST", "/users", bodyReader)

	response := executeRequest(req, ts)

	checkResponseCode(t, http.StatusOK, response.Code)

	var user User
	err := json.Unmarshal(response.Body.Bytes(), &user)
	if err != nil {
		t.Error("Failed to unmarshal response body from GET /users/{id}")
	}

	data2 := LoginUserPayload{
		Email:             &email,
		PlaintextPassword: &password,
	}

	jsonBody, _ = json.Marshal(data2)
	bodyReader = bytes.NewReader(jsonBody)

	// Attempt to login the new sponsor
	req, _ = http.NewRequest("POST", "/login", bodyReader)
	response = executeRequest(req, ts)
	checkResponseCode(t, http.StatusOK, response.Code)

	require.Equal(t, http.StatusOK, response.Code)
}

func TestFetchingEbayResults(t *testing.T) {
	fmt.Println("Testing: TestFetchingEbayResults")

	keywords := []string{"tools"}
	entries := 25
	page := 1
	org := 1
	crp := CatalogRequestPayload{
		Keywords:       &keywords,
		EntriesPerPage: &entries,
		TargetPage:     &page,
		OrganizationID: &org,
	}

	// turning test data into a json body that can be used
	jsonBody, _ := json.Marshal(crp)
	bodyReader := bytes.NewReader(jsonBody)

	req, _ := http.NewRequest("POST", "/catalog", bodyReader)

	response := executeRequest(req, ts)

	checkResponseCode(t, http.StatusOK, response.Code)

	var data CatalogReturnPayload
	err := json.Unmarshal(response.Body.Bytes(), &data)
	if err != nil {
		t.Error("Failed to unmarshal response body from POST /catalog")
	}

	count, _ := strconv.Atoi(data.Count)
	require.NotEmpty(t, data.Items, "Returned response from ebay catalog has no items.")
	require.LessOrEqual(t, count, entries)
	require.NotEmpty(t, data.Items[0].ItemID, "ItemID in EbayItem is empty.")
	require.NotEmpty(t, data.Items[0].Title, "Title in EbayItem is empty.")
	require.NotEmpty(t, data.Items[0].Points, "Points in EbayItem is 0.")
}

func TestDriverList(t *testing.T) {
	fmt.Println("Testing: TestDriverList")

	req, _ := http.NewRequest("GET", "/drivers/", nil)
	response := executeRequest(req, ts)
	checkResponseCode(t, http.StatusOK, response.Code)

	t.Log(response.Body.String())

	var data []Driver
	err := json.Unmarshal(response.Body.Bytes(), &data)
	if err != nil {
		t.Error("Failed to unmarshal response body from POST /catalog")
	}

	require.Equal(t, data[0].LicensePlate, "123UPS")
	require.Equal(t, data[1].LicensePlate, "123USP")
	require.Equal(t, data[2].LicensePlate, "Update")
	require.Equal(t, data[3].LicensePlate, "FailedLogin")
	require.Equal(t, data[4].LicensePlate, "123USP")
}

func TestIndiviudalDriverReport(t *testing.T) {
	fmt.Println("Testing: TestIndiviudalDriverReport")

	req, _ := http.NewRequest("GET", fmt.Sprintf("/reports/individual/%d", 1), nil)
	response := executeRequest(req, ts)
	checkResponseCode(t, http.StatusOK, response.Code)

	var data IndividualReportPayload
	err := json.Unmarshal(response.Body.Bytes(), &data)
	if err != nil {
		t.Error("Failed to unmarshal response body from GET /reports/individual/{driverID}")
	}

	DriverID := 1
	DriverFName := "Test"
	DriverLName := "Man"
	DriverEmail := "test@testman.com"
	OrganizationID := 1
	OrganizationName := "Testing Organization"
	Reason := "Reason"

	require.Equal(t, *data.DriverID, DriverID)
	require.Equal(t, *data.DriverFName, DriverFName)
	require.Equal(t, *data.DriverLName, DriverLName)
	require.Equal(t, *data.DriverEmail, DriverEmail)
	require.Equal(t, *data.OrganizationID, OrganizationID)
	require.Equal(t, *data.OrganizationName, OrganizationName)
	require.Equal(t, *data.PointHistory[0].Reason, Reason)
}
