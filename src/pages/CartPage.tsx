import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../lib/api';

function formatPrice(price: number): string {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: unknown }>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') {
      return message;
    }
  }

  return 'No se pudo completar la compra. Inténtalo de nuevo.';
}

function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (): Promise<void> => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await api.post('/orders', {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });
      clearCart();
      navigate('/my-orders');
    } catch (checkoutError: unknown) {
      setError(getErrorMessage(checkoutError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-void p-8 text-bone">
      <h1 className="mb-6 font-display text-4xl text-alarm">Carrito</h1>

      {items.length === 0 ? (
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <p className="font-display text-2xl text-bone">Tu carrito está vacío</p>
          <Link to="/" className="mt-4 inline-block bg-alarm px-6 py-3 text-bone">
            Ver catálogo
          </Link>
        </div>
      ) : (
        <>
          <div>
            {items.map(({ product, quantity }) => {
              const unitPrice = Number(product.price);
              const subtotal = unitPrice * quantity;

              return (
                <div
                  key={product.id}
                  className="flex flex-col gap-4 border-b border-blood py-4 sm:flex-row sm:items-center"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-20 w-20 object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-lg text-bone">{product.name}</h2>
                    <p className="font-body text-sm text-bone/75">
                      ${formatPrice(unitPrice)} por unidad
                    </p>
                  </div>

                  <label className="flex items-center gap-2 font-body text-sm">
                    Cantidad
                    <input
                      type="number"
                      min={1}
                      max={product.stock}
                      value={quantity}
                      onChange={(event) => {
                        const nextQuantity = Number(event.target.value);
                        if (Number.isInteger(nextQuantity) && nextQuantity >= 1) {
                          updateQuantity(product.id, Math.min(nextQuantity, product.stock));
                        }
                      }}
                      className="w-20 border border-blood bg-shadow px-3 py-2 text-bone"
                    />
                  </label>

                  <p className="min-w-24 text-right font-display text-bone">
                    ${formatPrice(subtotal)}
                  </p>

                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    className="px-3 py-2 font-body text-alarm transition hover:text-blood"
                  >
                    Quitar
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex w-full flex-col items-center gap-4 sm:items-end">
            <p className="w-full text-center font-display text-2xl text-alarm sm:text-right">
              Total: ${formatPrice(totalPrice)}
            </p>
            <button
              type="button"
              onClick={() => void handleCheckout()}
              disabled={submitting}
              className="w-full bg-alarm px-8 py-3 font-display text-bone transition hover:bg-blood disabled:opacity-50 sm:w-auto"
            >
              {submitting ? 'Procesando...' : 'Finalizar compra'}
            </button>
            {error && <p role="alert" className="font-body text-alarm">{error}</p>}
          </div>
        </>
      )}
    </main>
  );
}

export default CartPage;
