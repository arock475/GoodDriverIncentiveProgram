import React, { useEffect, useState } from "react";
import { Form, FormControlProps, InputGroup } from "react-bootstrap";
import Fuse from "fuse.js";
import { Link } from "react-router-dom";

interface UserItem {
  id: number;
  first: string;
  last: string;
  full: string;
  email: string;
}

const UserSearch: React.FC = () => {
  const [items, setItems] = useState<UserItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<UserItem[]>([]);

  // Load all relevant users upon rendering component for responsive searching.
  useEffect(() => {
    const fetchUsers = async () => {
      const resp = await fetch("http://ec2-54-221-146-123.compute-1.amazonaws.com:3333/users");
      const data = await resp.json();

      const users = data.map((user: any) => ({
        id: user.id,
        first: user.firstName,
        last: user.lastName,
        full: user.firstName + " " + user.lastName,
        email: user.email,
      }));

      setItems(users);
    };

    fetchUsers();
  }, []);

  const options: Fuse.IFuseOptions<UserItem> = {
    keys: ["full", "first", "last", "email", "id"],
    threshold: 0,
  };

  const fuse = new Fuse(items, options);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toString();
    setSearchTerm(term);

    if (term.length === 0) {
      setSearchResults([]);
      return;
    }

    const results = fuse.search(term).map((result) => result.item);
    setSearchResults(results);
  };

  const linkStyle = {
    textDecoration: "none",
    color: "blue",
  };

  return (
    <>
      <Form.Control
        type="text"
        placeholder="Search users"
        value={searchTerm}
        onChange={handleSearchChange}
      />
      {searchResults.length > 0 && (
        <ul className="list-group mt-3">
          {searchResults.map((user) => (
            <li key={user.id} className="list-group-item">
              <Link to={`/user/${user.id}`} style={linkStyle}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6>{user.full}</h6>
                    <small className="text-muted">{user.email}</small>
                  </div>
                  <div>
                    <small>ID: {user.id}</small>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default UserSearch;
