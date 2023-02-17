import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../../components/Header/Header';

test('Header home', () => {
  render(<Header colorTheme={"primary"} loggedIn={false}/>);

  const linkElement = screen.getByText("Home");
  
  expect(linkElement).toBeInTheDocument();
});


test('Header not logged in', () => {
  render(<Header colorTheme={"primary"} loggedIn={false}/>);

  const linkElement = screen.getByText("Login");
  
  expect(linkElement).toBeInTheDocument();
});

test('Header logged in username', () => {
  render(<Header colorTheme={"primary"} loggedIn={true} loginUser={"UserName"}/>);

  const linkElement = screen.getByText("UserName");
  
  expect(linkElement).toBeInTheDocument();
});

