import React from "react";
import { Card, Button } from "react-bootstrap";
import defaultimg from '../../assets/default-image.jpg'

interface ShopItem {
  itemId: string;
  title: string;
  points: number;
  imageUrl: string;
}

interface ShopItemProps {
  item: ShopItem;
}

const ShopItem: React.FC<ShopItemProps> = ({ item }) => {
  return (
    <Card className="my-3">
      <Card.Img variant="top" src={item.imageUrl ? item.imageUrl : defaultimg} />
      <Card.Body>
        <Card.Title>{item.title}</Card.Title>
        <Card.Text>Points: {item.points}</Card.Text>
        <Button variant="primary">Add To Cart</Button>
      </Card.Body>
    </Card>
  );
};

export default ShopItem;
