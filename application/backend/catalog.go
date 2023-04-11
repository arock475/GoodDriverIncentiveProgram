package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"math"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

// What GetCatalog expects from the frontend.
type CatalogRequestPayload struct {
	Keywords       *[]string `json:"keywords"`
	EntriesPerPage *int      `json:"entriesPerPage"`
	TargetPage     *int      `json:"targetPage"`
	OrganizationID *int      `json:"organizationId"`
}

// What GetCatalog will return to the frontend.
// This is essentially a pruned EbayResponse for easier use.
type CatalogReturnPayload struct {
	Items        []EbayItem `json:"items"`
	Count        string     `json:"count"`
	TotalEntries string     `json:"totalEntries"`
}

type GetCartItemsReturnPayload struct {
	CartItems   []EbayItem `json:"items"`
	TotalPoints int        `json:"pointTotal"`
}

// All the necessary information about a driver for the shop catalog page
// User information, points, and organization.
type DriverCatalogCtxReturnPayload struct {
	UserID           int    `json:"userId"`
	OrganizationID   int    `json:"organizationId"`
	OrganizationName string `json:"organizationName"`
	Points           int64  `json:"points"`
}

type EbayItem struct {
	ItemID   string `json:"itemId"`
	Title    string `json:"title"`
	ImageURL string `json:"imageUrl"`
	Points   int    `json:"points"`
}

// Ebay specific API structs
type ItemFilter struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

type PaginationInput struct {
	EntriesPerPage int `json:"entriesPerPage"`
	PageNumber     int `json:"pageNumber"`
}

type FindItemsAdvancedRequest struct {
	Keywords        []string        `json:"keywords"`
	ItemFilter      []ItemFilter    `json:"itemFilter"`
	PaginationInput PaginationInput `json:"paginationInput"`
}

type EbayResponse struct {
	FindItemsAdvancedResponse []struct {
		SearchResult []struct {
			Count string `json:"@count"`
			Items []struct {
				ItemID        []string `json:"itemId"`
				Title         []string `json:"title"`
				ImageURL      []string `json:"galleryURL"`
				SellingStatus []struct {
					CurrentPrice []struct {
						CurrencyID string `json:"@currencyId"`
						Value      string `json:"__value__"`
					} `json:"currentPrice"`
				} `json:"sellingStatus"`
			} `json:"item"`
		} `json:"searchResult"`
		PaginationOutput []struct {
			PageNumber     []string `json:"pageNumber"`
			EntriesPerPage []string `json:"entriesPerPage"`
			TotalPages     []string `json:"totalPages"`
			TotalEntries   []string `json:"totalEntries"`
		} `json:"paginationOutput"`
	} `json:"findItemsAdvancedResponse"`
}

func UnpackEbayResponse(response *EbayResponse, pointsRatio float64) (crp CatalogReturnPayload, err error) {
	// Extract the information we want from the EbayResponse struct
	// Extract it into the json struct we intend to return back from our API

	// Check if any of our top level fields are malformed
	if len(response.FindItemsAdvancedResponse) == 0 ||
		len(response.FindItemsAdvancedResponse[0].PaginationOutput) == 0 ||
		len(response.FindItemsAdvancedResponse[0].PaginationOutput[0].TotalEntries) == 0 ||
		len(response.FindItemsAdvancedResponse[0].SearchResult) == 0 {
		err = fmt.Errorf("Ebay API did not return information we needed.")
		return
	}

	crp.TotalEntries = response.FindItemsAdvancedResponse[0].PaginationOutput[0].TotalEntries[0]
	crp.Count = response.FindItemsAdvancedResponse[0].SearchResult[0].Count
	for _, ri := range response.FindItemsAdvancedResponse[0].SearchResult[0].Items {
		// If any of the fields are malformed, skip it.
		// Empty fields are fine, but the key must be present
		if len(ri.ItemID) == 0 ||
			len(ri.Title) == 0 ||
			len(ri.ImageURL) == 0 ||
			len(ri.SellingStatus) == 0 ||
			len(ri.SellingStatus[0].CurrentPrice) == 0 {
			continue
		}
		value, _ := strconv.ParseFloat(ri.SellingStatus[0].CurrentPrice[0].Value, 64)
		crp.Items = append(crp.Items,
			EbayItem{
				ItemID:   ri.ItemID[0],
				Title:    ri.Title[0],
				ImageURL: ri.ImageURL[0],
				Points:   int(math.Ceil(value * pointsRatio)),
			})
	}

	return crp, nil

}

func (s *Server) GetCatalog(w http.ResponseWriter, r *http.Request) {
	data := CatalogRequestPayload{}

	err := json.NewDecoder(r.Body).Decode(&data)
	if err == io.EOF {
		// no body is fine, just continue and use defaults.
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	keywords := []string{"tool"}
	if data.Keywords != nil {
		keywords = *data.Keywords
	}

	entriesPerPage := 25
	if data.EntriesPerPage != nil {
		entriesPerPage = *data.EntriesPerPage
	}

	targetPage := 1
	if data.TargetPage != nil {
		targetPage = *data.TargetPage
	}

	var orgID int
	if data.OrganizationID != nil {
		orgID = *data.OrganizationID
	} else {
		http.Error(w, "Organization ID required.", http.StatusBadRequest)
		return
	}

	var organization Organization
	result := s.DB.First(&organization, orgID)
	if result.Error != nil {
		http.Error(w, "Organization Not Found", http.StatusNotFound)
		return
	}

	// Make request body to send to ebay
	url := "https://svcs.sandbox.ebay.com/services/search/FindingService/v1"
	request := FindItemsAdvancedRequest{
		Keywords: keywords,
		ItemFilter: []ItemFilter{
			{
				Name:  "ListingType",
				Value: "FixedPrice",
			},
			{
				Name:  "Condition",
				Value: "1000",
			},
		},
		PaginationInput: PaginationInput{
			EntriesPerPage: entriesPerPage,
			PageNumber:     targetPage,
		},
	}

	// Marshal the request body into raw json
	body, err := json.Marshal(request)
	if err != nil {
		http.Error(w, "Invalid FindItemsAdvanced api request", http.StatusBadRequest)
		return
	}

	// Make client with body and add authentication headers
	client := &http.Client{}
	req, err := http.NewRequest("POST", url, bytes.NewReader(body))

	if err != nil {
		http.Error(w, "Failed to create http.NewRequest from created body payload.", http.StatusBadRequest)
		return
	}

	req.Header.Add("X-EBAY-SOA-SECURITY-APPNAME", "AaronSpe-Team25Tr-SBX-4757afe53-80b1455b")
	req.Header.Add("X-EBAY-SOA-OPERATION-NAME", "findItemsAdvanced")
	req.Header.Add("x-ebay-soa-response-data-format", "JSON")
	req.Header.Add("x-ebay-soa-request-data-format", "JSON")
	req.Header.Add("Content-Type", "application/json")

	// Execute the request and read in the raw json body returned
	res, err := client.Do(req)
	if err != nil {
		http.Error(w, "Failed executing request to ebay API", http.StatusBadRequest)
		return
	}
	defer res.Body.Close()

	respbody, err := ioutil.ReadAll(res.Body)
	if err != nil {
		http.Error(w, "Failed reading returned body from ebay API", http.StatusBadRequest)
		return
	}

	// Unmarshal the raw json into an auxilary EbayResponse struct for ease of use extracting
	var response EbayResponse
	err = json.Unmarshal(respbody, &response)
	if err != nil {
		http.Error(w, "Failed unmarshaling returned body from ebay API", http.StatusBadRequest)
		return
	}

	crp, err := UnpackEbayResponse(&response, organization.PointsRatio)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
	}

	// Turn the CatalogReturnPayload into raw json to send back to the API caller.
	json, _ := json.Marshal(crp)

	w.Header().Set("Content-Type", "application/json")
	w.Write(json)
}

func (s *Server) GetUserCatalogCtx(w http.ResponseWriter, r *http.Request) {
	var driver Driver

	if userID := chi.URLParam(r, "userID"); userID != "" {
		result := s.DB.Preload("Organization").First(&driver, "user_id = ?", userID)
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "User Not Found", http.StatusNotFound)
			return
		}
	} else {
		http.Error(w, "User Not Found", http.StatusNotFound)
		return
	}

	var points *int64
	// Get all organization specific points given to the driver.
	result := s.DB.Model(&Points{}).
		Preload("PointsCategory").
		Joins("JOIN points_categories pc ON pc.id = points.points_category_id").
		Select("sum(pc.num_change)").
		Where("driver_id = ? and organization_id = ?", driver.ID, driver.OrganizationID).
		Scan(&points)

	if result.Error != nil {
		http.Error(w, "Error calculating driver's points.", http.StatusInternalServerError)
		return
	}

	if points == nil {
		tmp := int64(0)
		points = &tmp
	}

	returnCtx := DriverCatalogCtxReturnPayload{
		UserID:           driver.UserID,
		OrganizationID:   driver.OrganizationID,
		OrganizationName: driver.Organization.Name,
		Points:           *points,
	}

	returned, _ := json.Marshal(returnCtx)
	w.Write(returned)
}

func (s *Server) AddItemToCart(w http.ResponseWriter, r *http.Request) {
	var driver Driver

	if userID := chi.URLParam(r, "userID"); userID != "" {
		result := s.DB.First(&driver, "user_id = ?", userID)
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "User Not Found", http.StatusNotFound)
			return
		}
	} else {
		http.Error(w, "User Not Found", http.StatusNotFound)
		return
	}

	data := EbayItem{}
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	purchase := Purchase{
		DriverID:       driver.ID,
		OrganizationID: driver.OrganizationID,
		ItemID:         data.ItemID,
		ItemTitle:      data.Title,
		ImageURL:       data.ImageURL,
		Points:         data.Points,
		InCart:         true,
		CheckedOut:     false,
	}

	result := s.DB.Create(&purchase)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(200)
}

func (s *Server) RemoveItemFromCart(w http.ResponseWriter, r *http.Request) {
	var driver Driver

	if userID := chi.URLParam(r, "userID"); userID != "" {
		result := s.DB.First(&driver, "user_id = ?", userID)
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "User Not Found", http.StatusNotFound)
			return
		}
	} else {
		http.Error(w, "User Not Found", http.StatusNotFound)
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusBadRequest)
		return
	}

	// Convert the byte slice to a string
	itemId := string(body)

	result := s.DB.Delete(&Purchase{}, "item_id = ?", itemId)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(200)
}

func (s *Server) GetCartItems(w http.ResponseWriter, r *http.Request) {
	var driver Driver

	if userID := chi.URLParam(r, "userID"); userID != "" {
		result := s.DB.First(&driver, "user_id = ?", userID)
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "User Not Found", http.StatusNotFound)
			return
		}
	} else {
		http.Error(w, "User Not Found", http.StatusNotFound)
		return
	}

	var cart []Purchase

	result := s.DB.Where("driver_id = ? AND in_cart = 1", driver.ID).Find(&cart)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusBadRequest)
		return
	}

	var cartItems []EbayItem
	totalPointCost := 0
	for _, purchase := range cart {
		cartItems = append(cartItems, EbayItem{
			ItemID:   purchase.ItemID,
			Title:    purchase.ItemTitle,
			ImageURL: purchase.ImageURL,
			Points:   purchase.Points,
		})
		totalPointCost += purchase.Points
	}

	payload := GetCartItemsReturnPayload{
		CartItems:   cartItems,
		TotalPoints: totalPointCost,
	}

	returned, _ := json.Marshal(payload)
	w.Write(returned)
}

func (s *Server) CheckoutItems(w http.ResponseWriter, r *http.Request) {
	var driver Driver

	if userID := chi.URLParam(r, "userID"); userID != "" {
		result := s.DB.First(&driver, "user_id = ?", userID)
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			http.Error(w, "User Not Found", http.StatusNotFound)
			return
		}
	} else {
		http.Error(w, "User Not Found", http.StatusNotFound)
		return
	}

	var cart []Purchase

	fmt.Println(driver)
	result := s.DB.Where("driver_id = ? AND organization_id = ? AND in_cart = ?", driver.ID, driver.OrganizationID, true).Find(&cart)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusBadRequest)
		return
	}
	fmt.Println(cart)

	totalPointCost := 0

	for i := range cart {
		cart[i].InCart = false
		cart[i].CheckedOut = true

		totalPointCost += cart[i].Points
	}

	fmt.Println(cart)

	var points *int64
	// Get all organization specific points given to the driver.
	result = s.DB.Model(&Points{}).
		Preload("PointsCategory").
		Joins("JOIN points_categories pc ON pc.id = points.points_category_id").
		Select("sum(pc.num_change)").
		Where("driver_id = ? and organization_id = ?", driver.ID, driver.OrganizationID).
		Scan(&points)

	if result.Error != nil {
		http.Error(w, "Error calculating driver's points.", http.StatusInternalServerError)
		return
	}

	if points == nil {
		tmp := int64(0)
		points = &tmp
	}

	if int64(totalPointCost) > *points {
		http.Error(w, "Not enough points for cart checkout.", http.StatusBadRequest)
		return
	}

	// Deduct points

	result = s.DB.Save(&cart)
	if result.Error != nil {
		http.Error(w, "Couldn't update cart items.", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(200)
}
