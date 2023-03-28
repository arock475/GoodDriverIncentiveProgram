import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../pages/Dashboard/Dashboard';

test('Dashboard with no login', () => {
    render(<Dashboard/>);
  
    const linkElement = screen.getByText("");
    
    expect(!linkElement).toBeInTheDocument();
});
