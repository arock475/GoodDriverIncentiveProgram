import React, { useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import defaultimg from "../../assets/default-image.jpg";
import { getUserClaims } from "../../utils/getUserClaims";

interface ShopItem {
  itemId: string;
  title: string;
  points: number;
  imageUrl: string;
  inCart: boolean;
}

interface ShopItemProps {
  item: ShopItem;
}

const ShopItem: React.FC<ShopItemProps> = ({ item }) => {
  const [currentItem, setCurrentItem] = useState<ShopItem>(item);

  const handleAddToCart = async () => {
    const claims = getUserClaims();

    await fetch(`http://http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/users/${claims.id}/cart`, {
      method: "PUT",
      body: JSON.stringify(currentItem),
    })
      .then(() => {
        setCurrentItem((prevItem) => {
          const updatedItem = { ...prevItem };
          updatedItem.inCart = true;
          return updatedItem;
        });
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  return (
    <Card className="my-3">
      <Card.Img variant="top" src={currentItem.imageUrl ? currentItem.imageUrl : defaultimg} />
      <Card.Body>
        <Card.Title>{currentItem.title}</Card.Title>
        <Card.Text>Points: {currentItem.points}</Card.Text>
        <Button onClick={handleAddToCart} variant="primary" disabled={currentItem.inCart}>
          {currentItem.inCart ? "Added" : "Add To Cart"}
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ShopItem;
