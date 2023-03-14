import React, { useEffect, useState } from "react";
import { Col, Row, Button } from "react-bootstrap";
import ShopItem from "./ShopItem";

interface ShopItemDeckProps {
  items: ShopItem[];
}

const ShopItemDeck: React.FC<ShopItemDeckProps> = (props) => {
  return (
    <Row xs={1} md={2} lg={5} className="justify-content-center">
      {props.items.map((item) => (
        <Col key={item.itemId}>
          <ShopItem item={item} />
        </Col>
      ))}
    </Row>
  );
};

export default ShopItemDeck;
