package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
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

	exitVal := m.Run()

	os.Exit(exitVal)
}

func TestListUsers(t *testing.T) {
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

	// Cleanup created user from test
	var driver Driver
	driver.ID = user.ID
	ts.DB.Model(&driver).Association("Organizations").Clear()
	ts.DB.Delete(&driver)
	ts.DB.Delete(&User{}, user.ID)
}

func TestUpdateProfile(t *testing.T) {
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

	// Create a new user
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

	// Cleanup created user from test
	var driver Driver
	driver.ID = user.ID
	ts.DB.Model(&driver).Association("Organizations").Clear()
	ts.DB.Delete(&driver)
	ts.DB.Delete(&User{}, user.ID)
}

func TestSuccessfulLogin(t *testing.T) {
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

	// Cleanup created user from test
	var driver Driver
	driver.ID = user.ID
	ts.DB.Model(&driver).Association("Organizations").Clear()
	ts.DB.Delete(&driver)
	ts.DB.Delete(&User{}, user.ID)
}

func TestFailedLogin(t *testing.T) {
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

	// Cleanup created user from test
	var driver Driver
	driver.ID = user.ID
	ts.DB.Model(&driver).Association("Organizations").Clear()
	ts.DB.Delete(&driver)
	ts.DB.Delete(&User{}, user.ID)
}

func TestCreateAdmin(t *testing.T) {
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

func TestDeleteAdmin(t *testing.T) {
	// test data
	var user User
	var admin Admin
	user.FirstName = "New"
	user.LastName = "Admin"
	user.Email = "newadmin@testing.com"
	hashedBytes, _ := bcrypt.GenerateFromPassword([]byte("x"), bcrypt.MinCost)
	user.PasswordHash = string(hashedBytes)
	user.Type = 2
	admin.User = user
	ts.DB.Create(&admin)

	// request to api
	jsonBody, _ := json.Marshal(admin)
	bodyReader := bytes.NewReader(jsonBody)
	url := fmt.Sprintf("/users/%d", admin.User.ID)
	req, _ := http.NewRequest("DELETE", url, bodyReader)
	response := executeRequest(req, ts)
	checkResponseCode(t, http.StatusOK, response.Code)

	// response and comparison
	t.Log(response.Body.String())
	result := ts.DB.First(&Admin{}, &admin)
	require.True(t, errors.Is(result.Error, gorm.ErrRecordNotFound), "Failed to Delete Admin")
	result = ts.DB.First(&User{}, &user)
	require.True(t, errors.Is(result.Error, gorm.ErrRecordNotFound), "Failed to Delete User associated with Admin")
}
