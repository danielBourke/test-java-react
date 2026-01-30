import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { Product } from '../types';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (product: Product) => void;
    product: Product | null;
    saving?: boolean;
}

interface FormErrors {
    name?: string;
    price?: string;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSubmit, product, saving = false }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});

    const modalRef = useRef<HTMLDivElement>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const titleId = 'product-modal-title';

    useEffect(() => {
        if (product) {
            setName(product.name);
            setDescription(product.description || '');
            setPrice(String(product.price));
        } else {
            setName('');
            setDescription('');
            setPrice('');
        }
        setErrors({});
    }, [product, isOpen]);

    // Focus first input when modal opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => nameInputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !saving) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose, saving]);

    // Focus trap
    useEffect(() => {
        if (!isOpen) return;

        const modal = modalRef.current;
        if (!modal) return;

        const focusableElements = modal.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTab = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        modal.addEventListener('keydown', handleTab);
        return () => modal.removeEventListener('keydown', handleTab);
    }, [isOpen]);

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        if (!name || name.trim() === '') {
            newErrors.name = 'Name is required';
        }
        if (!price || price === '') {
            newErrors.price = 'Price is required';
        } else if (parseFloat(price) < 0.01) {
            newErrors.price = 'Price must be greater than 0';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (!validate()) return;
        onSubmit({ name, description, price, id: product?.id });
    };

    if (!isOpen) return null;

    const isEditing = !!product;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                onClick={!saving ? onClose : undefined}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                ref={modalRef}
                className="relative w-full max-w-lg bg-white rounded-2xl shadow-soft animate-slide-up"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isEditing ? 'bg-amber-100' : 'bg-primary-100'
                        }`}>
                            {isEditing ? (
                                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            )}
                        </div>
                        <h2 id={titleId} className="text-xl font-semibold text-gray-900">
                            {isEditing ? 'Edit Product' : 'Add New Product'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        aria-label="Close modal"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-5">
                        {/* Name Field */}
                        <div>
                            <label
                                htmlFor="product-name"
                                className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                                Product Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                ref={nameInputRef}
                                id="product-name"
                                type="text"
                                placeholder="Enter product name"
                                className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400 transition-colors duration-200 hover:border-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed ${
                                    errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'
                                }`}
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                                }}
                                disabled={saving}
                                aria-invalid={!!errors.name}
                                aria-describedby={errors.name ? 'name-error' : undefined}
                            />
                            {errors.name && (
                                <p id="name-error" className="mt-1.5 text-sm text-red-600 flex items-center gap-1" role="alert">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Description Field */}
                        <div>
                            <label
                                htmlFor="product-description"
                                className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                                Description
                            </label>
                            <textarea
                                id="product-description"
                                placeholder="Enter product description (optional)"
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 transition-colors duration-200 hover:border-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed resize-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={saving}
                            />
                        </div>

                        {/* Price Field */}
                        <div>
                            <label
                                htmlFor="product-price"
                                className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                                Price <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="text-gray-500">$</span>
                                </div>
                                <input
                                    id="product-price"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.00"
                                    className={`w-full pl-8 pr-4 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400 transition-colors duration-200 hover:border-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed ${
                                        errors.price ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300'
                                    }`}
                                    value={price}
                                    onChange={(e) => {
                                        setPrice(e.target.value);
                                        if (errors.price) setErrors(prev => ({ ...prev, price: undefined }));
                                    }}
                                    disabled={saving}
                                    aria-invalid={!!errors.price}
                                    aria-describedby={errors.price ? 'price-error' : undefined}
                                />
                            </div>
                            {errors.price && (
                                <p id="price-error" className="mt-1.5 text-sm text-red-600 flex items-center gap-1" role="alert">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {errors.price}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="px-5 py-2.5 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className={`px-5 py-2.5 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                                isEditing
                                    ? 'bg-amber-600 hover:bg-amber-700'
                                    : 'bg-primary-600 hover:bg-primary-700'
                            }`}
                        >
                            {saving ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    {isEditing ? (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Save Changes</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            <span>Add Product</span>
                                        </>
                                    )}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;
