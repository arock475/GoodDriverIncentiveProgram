import React, { useEffect, useState } from "react";
import { Form, FormControlProps, InputGroup } from "react-bootstrap";
import Fuse from "fuse.js";
import { MDBCheckbox, MDBRadio } from "mdb-react-ui-kit";

interface UserItem {
  id: number;
  first: string;
  last: string;
  full: string;
  email: string;
}

export type SearchSelectProps = {
  colorTheme?: string,
  UserID?: number
  setUserID?: React.Dispatch<React.SetStateAction<number>>
}

const UserSearch: React.FC<SearchSelectProps> = ({
  colorTheme = 'Dark', UserID, setUserID
}) => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserID(Number(e.target.value));
    console.log(UserID);
  }

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

              <div className="d-flex justify-content-between align-items-center">
                <MDBRadio name='flexCheck' value={user.id} id='flexCheckDefault' onChange={handleChange} />
                <div>
                  <h6>{user.full}</h6>
                  <small className="text-muted">{user.email}</small>
                </div>
                <div>
                  <small>ID: {user.id}</small>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default UserSearch;
