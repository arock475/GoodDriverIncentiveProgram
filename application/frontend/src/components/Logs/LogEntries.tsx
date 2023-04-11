import React, { useState } from "react";
import Table from "react-bootstrap/Table";
import { CSVLink, CSVDownload } from "react-csv";

export interface LogEntry {
  id: string;
  event: string;
  status: string;
  description: string;
  email: string;
  timestamp: string;
}

interface LogTableProps {
  entries: LogEntry[];
}

const LogTable: React.FC<LogTableProps> = ({ entries }) => {
  const [sortField, setSortField] = useState<string>("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const sortedLogEntries = entries.sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (aValue < bValue) {
      return sortOrder === "asc" ? -1 : 1;
    } else if (aValue > bValue) {
      return sortOrder === "asc" ? 1 : -1;
    } else {
      return 0;
    }
  });

  return ( 
    <>
    <Table striped bordered hover style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th onClick={() => handleSort("event")} style={{ cursor: "pointer" }}>
            Event
          </th>
          <th onClick={() => handleSort("status")} style={{ cursor: "pointer" }}>
            Status
          </th>
          <th onClick={() => handleSort("description")} style={{ cursor: "pointer" }}>
            Description
          </th>
          <th onClick={() => handleSort("email")} style={{ cursor: "pointer" }}>
            Email
          </th>
          <th onClick={() => handleSort("timestamp")} style={{ cursor: "pointer" }}>
            Timestamp
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedLogEntries.map((entry) => (
          <tr key={entry.id} style={{ borderBottom: "1px solid #ddd" }}>
            <td>{entry.event}</td>
            <td>{entry.status}</td>
            <td>{entry.description}</td>
            <td>{entry.email}</td>
            <td>{entry.timestamp}</td>
          </tr>
        ))}
      </tbody>
    </Table>
    <CSVLink data={sortedLogEntries} filename={"TruckDriving_Logs.csv"}>Download As CSV File</CSVLink>
    </>
  )
};

export default LogTable;
