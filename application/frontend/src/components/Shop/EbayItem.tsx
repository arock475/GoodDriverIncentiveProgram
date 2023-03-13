import React from "react";
import { Card, Button } from "react-bootstrap";

interface EbayItem {
  id: string;
  name: string;
  desc: string;
  points: number;
  imageUrl: string;
}

interface EbayItemProps {
  item: EbayItem;
}

const EbayItem: React.FC<EbayItemProps> = ({ item }) => {
  return (
    <Card className="my-3">
      <Card.Img variant="top" src={item.imageUrl} />
      <Card.Body>
        <Card.Title>{item.name}</Card.Title>
        <Card.Text>{item.desc}</Card.Text>
        <Card.Text>Points: {item.points}</Card.Text>
        <Button variant="primary">Add To Cart</Button>
      </Card.Body>
    </Card>
  );
};

export default EbayItem;
