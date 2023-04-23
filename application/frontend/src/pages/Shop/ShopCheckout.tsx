import React, { useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import ShopItem from "../../components/Shop/ShopItem";
import { getUserClaims } from "../../utils/getUserClaims";

interface CartResponse {
  items: ShopItem[];
  pointTotal: number;
}

const ShopCheckout: React.FC = () => {
  const [userClaims, setUserClaims] = useState(getUserClaims());
  const [cartItems, setCartItems] = useState<ShopItem[]>([]);
  const [pointTotal, setPointTotal] = useState<number>(0);

  const fetchCartItems = () => {
    // Fetch cart shop items from backend
    fetch(`http://localhost:3333/users/${userClaims.id}/cart`)
      .then((response) => response.json())
      .then((data: CartResponse) => {
        if (data.items) {
          setCartItems(data.items);
        } else {
          setCartItems([]);
        }

        setPointTotal(data.pointTotal);
      });
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const handleCheckout = async () => {
    await fetch(`http://localhost:3333/users/${userClaims.id}/checkout`, {
      method: "PUT",
    })
      .then(() => {
        fetchCartItems();
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const handleRemoveItem = async (itemId: string) => {
    await fetch(`http://localhost:3333/users/${userClaims.id}/cart`, {
      method: "DELETE",
      body: itemId,
    })
      .then(() => {
        fetchCartItems();
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  return (
    <Container fluid>
      <div className="">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Cart</h5>
            <ul className="list-group">
              {cartItems.map((cartItem) => (
                <li
                  key={cartItem.itemId}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <img src={cartItem.imageUrl} alt={cartItem.title} className="cart-item-image" />
                  <span className="cart-item-title">{cartItem.title}</span>
                  <span className="cart-item-quantity">x {1}</span>
                  <span className="cart-item-points">Points: {cartItem.points * 1}</span>
                  <Button
                    className="btn btn-danger"
                    onClick={() => handleRemoveItem(cartItem.itemId)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
            {cartItems.length === 0 && <p className="text-center mt-3">Cart is empty</p>}
            <h5 className="text-center mt-3">Total Points:</h5>
            <h6 className="text-center">{pointTotal}</h6>
            <button
              className="btn btn-success btn-block mt-3"
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ShopCheckout;
