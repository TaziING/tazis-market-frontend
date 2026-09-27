import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '../types';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isProduct(value: unknown): value is Product {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.description === 'string' &&
    typeof value.imageUrl === 'string' &&
    typeof value.price === 'string' &&
    typeof value.stock === 'number' &&
    typeof value.isRare === 'boolean' &&
    typeof value.categoryId === 'string' &&
    typeof value.createdAt === 'string' &&
    (value.category === undefined ||
      (isRecord(value.category) &&
        typeof value.category.id === 'string' &&
        typeof value.category.name === 'string'))
  );
}

function readStoredCart(): CartItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedCart = window.localStorage.getItem('tazis_cart');
    if (!storedCart) {
      return [];
    }

    const parsed: unknown = JSON.parse(storedCart);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item: unknown): item is CartItem =>
      isRecord(item) &&
      isProduct(item.product) &&
      typeof item.quantity === 'number' &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0 &&
      item.quantity <= item.product.stock,
    );
  } catch {
    return [];
  }
}

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>(readStoredCart);

  useEffect(() => {
    try {
      window.localStorage.setItem('tazis_cart', JSON.stringify(items));
    } catch {
      // Keep the in-memory cart usable if browser storage is unavailable.
    }
  }, [items]);

  const addToCart = useCallback((product: Product, quantity = 1): void => {
    if (quantity <= 0 || product.stock <= 0) {
      return;
    }

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.product.id === product.id);
      const nextQuantity = Math.min(
        product.stock,
        (existingItem?.quantity ?? 0) + quantity,
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.product.id === product.id
            ? { product, quantity: nextQuantity }
            : item,
        );
      }

      return [...currentItems, { product, quantity: nextQuantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string): void => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.product.id !== productId),
    );
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number): void => {
    if (quantity <= 0) {
      setItems((currentItems) =>
        currentItems.filter((item) => item.product.id !== productId),
      );
      return;
    }

    setItems((currentItems) =>
      currentItems.flatMap((item) => {
        if (item.product.id !== productId) {
          return [item];
        }

        const limitedQuantity = Math.min(quantity, item.product.stock);
        return limitedQuantity > 0 ? [{ ...item, quantity: limitedQuantity }] : [];
      }),
    );
  }, []);

  const clearCart = useCallback((): void => {
    setItems([]);
  }, []);

  const value = useMemo<CartContextValue>(() => ({
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems: items.reduce((total, item) => total + item.quantity, 0),
    totalPrice: items.reduce(
      (total, item) => total + Number(item.product.price) * item.quantity,
      0,
    ),
  }), [items, addToCart, removeFromCart, updateQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe utilizarse dentro de un CartProvider.');
  }

  return context;
}
