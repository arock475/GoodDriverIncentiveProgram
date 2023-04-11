import React, { useEffect, useState } from "react";
import ShopItem from "../../components/Shop/ShopItem";
import ShopItemDeck from "../../components/Shop/ShopItemDeck";
import { Container, Row, Col, Form, InputGroup, FormControl, Button } from "react-bootstrap";
import { getUserClaims } from "../../utils/getUserClaims";
import { User } from "../../components/CreateUser/CreateUser";

interface EbayResponse {
  items: ShopItem[];
  count: string;
  totalEntries: string;
}

interface DriverCatalogCtx {
  userId: number;
  organizationName: string;
  organizationId: number;
  points: number;
}

interface CartResponse {
  items: ShopItem[];
  pointTotal: number;
}

const ShopCatalog: React.FC = () => {
  const [driverCtx, setDriverCtx] = useState<DriverCatalogCtx>({
    userId: 0,
    organizationName: "",
    organizationId: 1,
    points: 0,
  });
  const [searchTerm, setSearchTerm] = useState<string>("tools");
  const [items, setItems] = useState<ShopItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [fetchedPages, setFetchedPages] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [showAffordableOnly, setShowAffordableOnly] = useState(false);

  const [userClaims, setUserClaims] = useState(getUserClaims());

  const entriesPerPage = 25;

  useEffect(() => {
    fetch(`http://http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/users/${userClaims.id}/catalog`)
      .then((response) => response.json())
      .then((data: DriverCatalogCtx) => {
        setDriverCtx(data);
      });
  }, []);


  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const searchInput = event.currentTarget as HTMLInputElement;
      if (searchInput.value !== "") {
        setSearchTerm(searchInput.value);
      }
    }
  };

  // Whenever search term is changed, query the ebay api and display the results.
  useEffect(() => {
    items.length = 0;

    const nextButton = document.getElementById("nextButton") as HTMLInputElement;
    nextButton.disabled = false;
    nextButton.classList.remove("disabled");

    fetchEbayItems(1);
    setFetchedPages(1);
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchEbayItems = async (pageNumber: number) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keywords: [searchTerm],
        entriesPerPage: entriesPerPage,
        targetPage: pageNumber,
        organizationId: driverCtx.organizationId,
      }),
    };

    fetch("http://http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/catalog", requestOptions)
      .then((response) => response.json())
      .then((data: EbayResponse) => {
        setTotalEntries(+data.totalEntries);

        // Fetch existing cart items from backend
        fetch(`http://http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/users/${userClaims.id}/cart`)
          .then((response) => response.json())
          .then((cart: CartResponse) => {
            const itemIds: string[] = cart.items ? cart.items.map((item) => item.itemId) : [];
            setItems(
              data.items.map((item) => {
                const inCart = itemIds.includes(item.itemId);
                item.inCart = inCart;
                return item;
              })
            );
          });
      });
  };

  const handleNextPage = () => {
    window.scrollTo(0, 0);

    // Don't fetch pages that we've already fetched.
    if (currentPage + 1 > fetchedPages) {
      fetchEbayItems(currentPage + 1);
      setCurrentPage(currentPage + 1);
      setFetchedPages(fetchedPages + 1);
    } else {
      setCurrentPage(currentPage + 1);
    }

    // If we don't have enough total items to display another page, disable the button.
    if ((currentPage + 1) * entriesPerPage >= totalEntries - 1) {
      const nextButton = document.getElementById("nextButton") as HTMLInputElement;
      nextButton.disabled = true;
      nextButton.classList.add("disabled");
    }
  };

  const handlePreviousPage = () => {
    window.scrollTo(0, 0);

    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      const nextButton = document.getElementById("nextButton") as HTMLInputElement;
      nextButton.disabled = false;
      nextButton.classList.remove("disabled");
    }
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowAffordableOnly(event.target.checked);
  };

  // Slice list to only include that page's results.
  const itemsToRender = items
    .slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage)
    .filter((item) => {
      if (showAffordableOnly) {
        return item.points <= driverCtx.points;
      } else return true;
    });

  return (
    <div>
      <Container fluid className="bg-light py-2">
        <Row className="align-items-center">
          <Col>
            <h3>Shop Catalog</h3>
          </Col>
          <Col>
            <InputGroup>
              <FormControl placeholder="Search Shop" aria-label="Search" onKeyDown={handleSearch} />
              <InputGroup.Text>
                <i className="bi bi-search"></i>
              </InputGroup.Text>
            </InputGroup>
          </Col>
          <Col>
            <div className="text-end">
              <h4>{driverCtx.organizationName}</h4>
              {userClaims.role === User.Driver && (
                <div>
                  <h4>Points: {driverCtx.points}</h4>
                  <Button href="/catalog/checkout">Checkout</Button>
                </div>
              )}
              {(userClaims.role === User.Sponsor || userClaims.role === User.Admin) && (
                <Button href="/catalog/manage">Manage</Button>
              )}
            </div>
          </Col>
        </Row>
        <Row className="align-items-center">
          <Col>
            <Form.Check
              type="checkbox"
              id="affordableOnlyCheckbox"
              label="Show only what I can afford"
              checked={showAffordableOnly}
              onChange={handleCheckboxChange}
            />
          </Col>
        </Row>
        <ShopItemDeck items={itemsToRender} />
        <div className="d-flex justify-content-center">
          <Button id="previousButton" onClick={handlePreviousPage}>
            Previous
          </Button>
          <Button id="nextButton" onClick={handleNextPage} style={{ marginLeft: "10px" }}>
            Next
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default ShopCatalog;
