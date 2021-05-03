import { render, screen } from '@testing-library/react';
import Header from './components/Header';

test('renders hey cinema link', () => {
  render(<Header />);
  const linkElement = screen.getByText(/hey/i);
  expect(linkElement).toBeInTheDocument();
});
