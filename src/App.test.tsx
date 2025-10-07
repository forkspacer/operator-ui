import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders app container', () => {
  const { container } = render(<App />);
  const appContainer = container.querySelector('.app-container');
  expect(appContainer).toBeInTheDocument();
});
