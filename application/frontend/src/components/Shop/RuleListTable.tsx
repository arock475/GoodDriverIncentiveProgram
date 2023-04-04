import React, { useState, useEffect } from "react";
import { Table, Dropdown, Form, Button } from "react-bootstrap";

export type Rule = {
  type: string;
  value: any;
};

type RuleListTableProps = {
  rules: Rule[];
  onSave: (rules: Rule[]) => void;
};

const RuleListTable: React.FC<RuleListTableProps> = ({ rules, onSave }) => {
  const [currentRules, setCurrentRules] = useState<Rule[]>(rules);


  useEffect(() => {
    setCurrentRules(rules)
  }, [rules])

  const handleAddRule = () => {
    setCurrentRules([...currentRules, { type: "", value: null }]);
  };

  const handleDeleteRule = (index: number) => {
    const updatedRules = [...currentRules];
    updatedRules.splice(index, 1);
    setCurrentRules(updatedRules);
  };

  const handleTypeChange = (index: number, value: string) => {
    const updatedRules = [...currentRules];
    updatedRules[index].type = value;
    setCurrentRules(updatedRules);
  };

  const handleValueChange = (index: number, value: any) => {
    const updatedRules = [...currentRules];
    updatedRules[index].value = value;
    setCurrentRules(updatedRules);
  };

  const handleSave = () => {
    onSave(currentRules);
  };

  const renderTypeDropdown = (index: number) => {
    const types = ["Price Rule", "Restricted Keywords", "Other Rule"];

    return (
      <Dropdown onSelect={(value) => handleTypeChange(index, value)}>
        <Dropdown.Toggle variant="light" id={`type-dropdown-${index}`}>
          {currentRules[index].type || "Select Type"}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {types.map((type) => (
            <Dropdown.Item key={type} eventKey={type}>
              {type}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  const renderValueInput = (index: number) => {
    const type = currentRules[index].type;

    switch (type) {
      case "Price Rule":
        return (
          <>
            <Form.Label>Minimum:</Form.Label>
            <Form.Control
              type="number"
              value={currentRules[index].value?.min || ""}
              onChange={(e) =>
                handleValueChange(index, {
                  ...currentRules[index].value,
                  min: e.target.value,
                })
              }
            />
            <Form.Label>Maximum:</Form.Label>
            <Form.Control
              type="number"
              value={currentRules[index].value?.max || ""}
              onChange={(e) =>
                handleValueChange(index, {
                  ...currentRules[index].value,
                  max: e.target.value,
                })
              }
            />
          </>
        );
      case "Restricted Keywords":
        return (
          <Form.Control
            type="text"
            value={currentRules[index].value?.join(",") || ""}
            onChange={(e) => handleValueChange(index, e.target.value.split(","))}
          />
        );
      default:
        return (
          <Form.Control
            type="text"
            value={currentRules[index].value || ""}
            onChange={(e) => handleValueChange(index, e.target.value)}
          />
        );
    }
  };

  return (
    <>
      <Table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Value</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {currentRules.map((rule, index) => (
            <tr key={index}>
              <td>{renderTypeDropdown(index)}</td>
              <td>{renderValueInput(index)}</td>
              <td>
                <Button onClick={() => handleDeleteRule(index)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Button onClick={handleAddRule}>Add Rule</Button>
      <Button onClick={handleSave}>Save Rules</Button>
    </>
  );
};

export default RuleListTable;
