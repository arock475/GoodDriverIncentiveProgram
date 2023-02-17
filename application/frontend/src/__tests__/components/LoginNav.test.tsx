import React from 'react';
import { render, screen } from '@testing-library/react';
import LoginNav from '../../components/Header/LoginNav';



test('LoginNav not logged in', () => {
    render(<LoginNav loggedIn={false}/>);
  
    const linkElement = screen.getByText("Login");
    
    expect(linkElement).toBeInTheDocument();
});

test('LoginNav logged in with user "test"', () => {
    render(<LoginNav loggedIn={true} loginUser={"test"}/>);
  
    const linkElement = screen.getByText("test");
    
    expect(linkElement).toBeInTheDocument();
});