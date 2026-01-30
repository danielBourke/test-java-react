import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ProductModal from './ProductModal';
import { Product, PaginationState, PageResponse } from '../types';

// Confirmation Modal Component
interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmLabel,
    onConfirm,
    onCancel,
    loading = false
}) => {
    const cancelRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen) {
            cancelRef.current?.focus();
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !loading) {
                onCancel();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onCancel, loading]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
        >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={!loading ? onCancel : undefined} />
            <div className="relative bg-white rounded-2xl shadow-soft max-w-sm w-full p-6 animate-slide-up">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 id="confirm-title" className="text-lg font-semibold text-gray-900">{title}</h3>
                </div>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex gap-3 justify-end">
                    <button
                        ref={cancelRef}
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading && (
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        )}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Skeleton Card Component
const SkeletonCard: React.FC = () => (
    <div className="bg-white rounded-xl shadow-card p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
        <div className="flex gap-2">
            <div className="h-9 bg-gray-200 rounded flex-1" />
            <div className="h-9 bg-gray-200 rounded flex-1" />
        </div>
    </div>
);

// Product Card Component
interface ProductCardProps {
    product: Product;
    onEdit: () => void;
    onDelete: () => void;
    isDeleting: boolean;
    index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete, isDeleting, index }) => {
    const formatPrice = (price: number | string) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(numPrice);
    };

    return (
        <article
            className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 flex flex-col animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
            role="article"
            aria-label={`Product: ${product.name}`}
        >
            <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                    {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                    {product.description || 'No description available'}
                </p>
                <div className="mb-4">
                    <span className="text-2xl font-bold text-primary-600">
                        {formatPrice(product.price)}
                    </span>
                </div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                    onClick={onEdit}
                    className="flex-1 px-4 py-2 text-primary-600 font-medium rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
                    aria-label={`Edit ${product.name}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                </button>
                <button
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 text-red-600 font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    aria-label={`Delete ${product.name}`}
                >
                    {isDeleting ? (
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    )}
                    Delete
                </button>
            </div>
        </article>
    );
};

// Empty State Component
const EmptyState: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
    <div className="text-center py-16 px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Get started by adding your first product to the inventory.
        </p>
        <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Your First Product
        </button>
    </div>
);

// Toast Notification Component
interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div
            className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-slide-up ${
                type === 'success' ? 'bg-green-600' : 'bg-red-600'
            } text-white`}
            role="alert"
            aria-live="polite"
        >
            {type === 'success' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            )}
            <span className="font-medium">{message}</span>
            <button
                onClick={onClose}
                className="ml-2 hover:opacity-80 transition-opacity"
                aria-label="Dismiss notification"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

const ProductList: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ id: number; name: string } | null>(null);
    const [pagination, setPagination] = useState<PaginationState>({
        page: 0,
        size: 9,
        totalPages: 0,
        totalElements: 0
    });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const addButtonRef = useRef<HTMLButtonElement>(null);
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, [pagination.page]);

    const fetchProducts = async (): Promise<void> => {
        setLoading(true);
        try {
            const response = await api.get<PageResponse<Product>>('/products', {
                params: {
                    page: pagination.page,
                    size: pagination.size
                }
            });
            setProducts(response.data.content || []);
            setPagination(prev => ({
                ...prev,
                totalPages: response.data.totalPages || 0,
                totalElements: response.data.totalElements || 0
            }));
        } catch (err) {
            console.error("Error fetching products", err);
            setToast({ message: "Failed to load products. Please try again.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = (): void => {
        setCurrentProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product: Product): void => {
        setCurrentProduct(product);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (product: Product): void => {
        setConfirmDelete({ id: product.id!, name: product.name });
    };

    const handleDeleteConfirm = async (): Promise<void> => {
        if (!confirmDelete) return;

        setDeletingId(confirmDelete.id);
        try {
            await api.delete(`/products/${confirmDelete.id}`);
            setToast({ message: `"${confirmDelete.name}" has been deleted.`, type: 'success' });
            setConfirmDelete(null);
            fetchProducts();
        } catch (err: unknown) {
            console.error("Error deleting product", err);
            const axiosError = err as { response?: { status?: number } };
            if (axiosError.response?.status === 404) {
                setToast({ message: "Product not found. It may have already been deleted.", type: 'error' });
            } else {
                setToast({ message: "Failed to delete product. Please try again.", type: 'error' });
            }
        } finally {
            setDeletingId(null);
        }
    };

    const handleSubmit = async (product: Product): Promise<void> => {
        setSaving(true);
        try {
            if (product.id) {
                await api.put(`/products/${product.id}`, product);
                setToast({ message: `"${product.name}" has been updated.`, type: 'success' });
            } else {
                await api.post('/products', product);
                setToast({ message: `"${product.name}" has been created.`, type: 'success' });
            }
            setIsModalOpen(false);
            fetchProducts();
            setTimeout(() => addButtonRef.current?.focus(), 100);
        } catch (err: unknown) {
            console.error("Error saving product", err);
            const axiosError = err as { response?: { data?: Record<string, string> & { message?: string } } };
            if (axiosError.response?.data) {
                const errors = axiosError.response.data;
                if (typeof errors === 'object' && !errors.message) {
                    const messages = Object.values(errors).join(', ');
                    setToast({ message: messages || "Failed to save product.", type: 'error' });
                } else {
                    setToast({ message: errors.message || "Failed to save product.", type: 'error' });
                }
            } else {
                setToast({ message: "Failed to save product. Please try again.", type: 'error' });
            }
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = (): void => {
        logout();
        navigate('/login');
    };

    const handlePageChange = (newPage: number): void => {
        setPagination(prev => ({ ...prev, page: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        const { page, totalPages } = pagination;

        if (totalPages <= 5) {
            for (let i = 0; i < totalPages; i++) pages.push(i);
        } else {
            pages.push(0);
            if (page > 2) pages.push('ellipsis');
            for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) {
                pages.push(i);
            }
            if (page < totalPages - 3) pages.push('ellipsis');
            pages.push(totalPages - 1);
        }
        return pages;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Navigation */}
            <nav className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-gray-900 hidden sm:block">Product Manager</span>
                        </div>

                        {/* Desktop User Menu */}
                        <div className="hidden md:flex items-center gap-4">
                            <div className="flex items-center gap-2 text-gray-600">
                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                    <span className="text-primary-700 font-medium text-sm">
                                        {user?.username?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-sm font-medium">{user?.username}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Sign out
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                            aria-expanded={mobileMenuOpen}
                        >
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                    <span className="text-primary-700 font-medium">
                                        {user?.username?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{user?.username}</p>
                                    <p className="text-sm text-gray-500">Logged in</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-2 text-left text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
                        {pagination.totalElements > 0 && (
                            <p className="text-gray-500 mt-1">
                                {pagination.totalElements} {pagination.totalElements === 1 ? 'product' : 'products'} in inventory
                            </p>
                        )}
                    </div>
                    <button
                        ref={addButtonRef}
                        onClick={handleCreate}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Product
                    </button>
                </div>

                {/* Stats Cards */}
                {!loading && pagination.totalElements > 0 && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl shadow-card p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{pagination.totalElements}</p>
                                    <p className="text-sm text-gray-500">Total Products</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-card p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                                    <p className="text-sm text-gray-500">On This Page</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-card p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{pagination.totalPages}</p>
                                    <p className="text-sm text-gray-500">Total Pages</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-card p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{pagination.size}</p>
                                    <p className="text-sm text-gray-500">Per Page</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Product Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <EmptyState onAdd={handleCreate} />
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product, index) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onEdit={() => handleEdit(product)}
                                    onDelete={() => handleDeleteClick(product)}
                                    isDeleting={deletingId === product.id}
                                    index={index}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <nav className="flex justify-center items-center gap-1 mt-8" aria-label="Pagination">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 0}
                                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Previous page"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                {getPageNumbers().map((pageNum, idx) =>
                                    pageNum === 'ellipsis' ? (
                                        <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
                                    ) : (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`min-w-[2.5rem] h-10 rounded-lg font-medium transition-colors ${
                                                pagination.page === pageNum
                                                    ? 'bg-primary-600 text-white'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                            aria-label={`Page ${pageNum + 1}`}
                                            aria-current={pagination.page === pageNum ? 'page' : undefined}
                                        >
                                            {pageNum + 1}
                                        </button>
                                    )
                                )}

                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages - 1}
                                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Next page"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </nav>
                        )}
                    </>
                )}
            </main>

            {/* Modals */}
            <ProductModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setTimeout(() => addButtonRef.current?.focus(), 100);
                }}
                onSubmit={handleSubmit}
                product={currentProduct}
                saving={saving}
            />

            <ConfirmModal
                isOpen={!!confirmDelete}
                title="Delete Product"
                message={`Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setConfirmDelete(null)}
                loading={!!deletingId}
            />

            {/* Toast Notifications */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default ProductList;
