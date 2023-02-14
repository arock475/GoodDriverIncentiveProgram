import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../pages/App';

test('Test description', () => {
  render(<App />);
  const linkElement = screen.getByText('Home');
  expect(linkElement).toBeInTheDocument();
  expect(true);
});
