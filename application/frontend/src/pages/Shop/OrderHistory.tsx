import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import ShopItem from "../../components/Shop/ShopItem";
import { getUserClaims } from "../../utils/getUserClaims";

interface OrdersResponse {
    items: ShopItem[];
}

const OrderHistory: React.FC = () => {
    const [userClaims, setUserClaims] = useState(getUserClaims());
    const [cartItems, setCartItems] = useState<ShopItem[]>([]);
    const [pointTotal, setPointTotal] = useState<number>(0);

    const fetchCartItems = () => {
        // Fetch cart shop items from backend
        fetch(`http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/users/${userClaims.id}/orders`)
            .then((response) => response.json())
            .then((data: OrdersResponse) => {
                if (data.items) {
                    setCartItems(data.items);
                } else {
                    setCartItems([]);
                }
            });
    };

    useEffect(() => {
        fetchCartItems();
    }, []);

    return (
        <Container fluid>
            <div className="">
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title">Order History</h5>
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
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default OrderHistory;
