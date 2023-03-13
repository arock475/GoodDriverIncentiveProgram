import React from "react";
import { Col, Row, Container } from "react-bootstrap";
import EbayItem from "./EbayItem";

const itemx: EbayItem = {
  id: "123",
  name: "iPhone",
  desc: "iPhone 11 Max is a phone but really I just wanted the description to be longer in an example.",
  points: 1199,
  imageUrl: "https://picsum.photos/300/200",
};

const EbayCatalog: React.FC = () => {
  const items: EbayItem[] = [...Array(25)].fill(itemx);

  return (
    <Row xs={1} md={2} lg={5} className="justify-content-center">
      {items.map((item) => (
        <Col>
          <EbayItem item={item} />
        </Col>
      ))}
    </Row>
  );
};

export default EbayCatalog;
