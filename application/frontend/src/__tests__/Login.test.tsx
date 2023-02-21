import React from 'react';
import { render, screen } from '@testing-library/react';
import Login from '../pages/Login/Login';

test('Header Username', () => {
  render(<Login/>);

  const linkElement = screen.getByText("Username");
  
  expect(linkElement).toBeInTheDocument();
});


test('Header Password', () => {
    render(<Login/>);
  
    const linkElement = screen.getByText("Password");
    
    expect(linkElement).toBeInTheDocument();
  });



