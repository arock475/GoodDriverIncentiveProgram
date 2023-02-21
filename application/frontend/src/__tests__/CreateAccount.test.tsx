import React from 'react';
import { render, screen } from '@testing-library/react';
import CreateAccount from '../pages/Login/CreateAccount';

test('Create Account Username', () => {
  render(<CreateAccount/>);

  const linkElement = screen.getByText("First Name");
  
  expect(linkElement).toBeInTheDocument();
});


test('Create Account Password', () => {
    render(<CreateAccount/>);
  
    const linkElement = screen.getByText("Last Name");
    
    expect(linkElement).toBeInTheDocument();
  });

  test('Create Account Email', () => {
    render(<CreateAccount/>);

    const linkElement = screen.getByText("Email");

    expect(linkElement).toBeInTheDocument();
});

test('Create Account Password', () => {
    render(<CreateAccount/>);

    const linkElement = screen.getByText("Password");

    expect(linkElement).toBeInTheDocument();
});


