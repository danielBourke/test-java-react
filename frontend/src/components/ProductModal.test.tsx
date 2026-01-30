import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductModal from './ProductModal';

describe('ProductModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(
      <ProductModal
        isOpen={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        product={null}
      />
    );

    expect(screen.queryByText('Add New Product')).not.toBeInTheDocument();
  });

  it('should render Add New Product when no product is passed', () => {
    render(
      <ProductModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        product={null}
      />
    );

    expect(screen.getByText('Add New Product')).toBeInTheDocument();
  });

  it('should render Edit Product when product is passed', () => {
    const product = { id: 1, name: 'Test', description: 'Desc', price: '10.00' };
    render(
      <ProductModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        product={product}
      />
    );

    expect(screen.getByText('Edit Product')).toBeInTheDocument();
  });

  it('should populate form fields when editing a product', () => {
    const product = { id: 1, name: 'Test Product', description: 'Test Desc', price: '29.99' };
    render(
      <ProductModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        product={product}
      />
    );

    expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Desc')).toBeInTheDocument();
    expect(screen.getByDisplayValue('29.99')).toBeInTheDocument();
  });

  it('should show validation error when name is empty', async () => {
    render(
      <ProductModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        product={null}
      />
    );

    // Get inputs by their type/placeholder
    const priceInput = screen.getByRole('spinbutton'); // number input
    await userEvent.type(priceInput, '10.00');

    const submitButton = screen.getByText('Save Changes');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it.skip('should show validation error when price is invalid', async () => {
    render(
      <ProductModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        product={null}
      />
    );

    // Get name input (first textbox)
    const textInputs = screen.getAllByRole('textbox');
    const nameInput = textInputs[0];
    await userEvent.type(nameInput, 'Test Product');

    const priceInput = screen.getByRole('spinbutton');
    fireEvent.change(priceInput, { target: { value: '0' } });

    const submitButton = screen.getByText('Save Changes');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Price must be greater than 0')).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should call onSubmit with form data when valid', async () => {
    render(
      <ProductModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        product={null}
      />
    );

    // Get all inputs
    const textInputs = screen.getAllByRole('textbox');
    const nameInput = textInputs[0]; // First textbox is name
    const descInput = textInputs[1]; // Second is description (textarea)
    const priceInput = screen.getByRole('spinbutton');

    await userEvent.type(nameInput, 'New Product');
    await userEvent.type(descInput, 'New Description');
    await userEvent.type(priceInput, '25.99');

    const submitButton = screen.getByText('Save Changes');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'New Product',
        description: 'New Description',
        price: '25.99',
        id: undefined
      });
    });
  });

  it('should call onClose when Cancel is clicked', async () => {
    render(
      <ProductModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        product={null}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should disable buttons when saving', () => {
    render(
      <ProductModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        product={null}
        saving={true}
      />
    );

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.getByText('Saving...')).toBeDisabled();
    expect(screen.getByText('Cancel')).toBeDisabled();
  });
});
