import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../lib/api';
import type { Product } from '../types';

const fallbackImage =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect width="800" height="600" fill="%23161616"/%3E%3C/svg%3E';

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: unknown }>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') {
      return message;
    }
    if (error.response?.status === 404) {
      return 'Producto no encontrado.';
    }
  }

  return 'No se pudo cargar el producto.';
}

function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);
  const addedTimeout = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setProduct(null);
    setQuantity(1);
    setImgError(false);
    setAdded(false);

    if (!id) {
      setError('No se especificó el producto.');
      setLoading(false);
      return () => {
        active = false;
      };
    }

    const loadProduct = async (): Promise<void> => {
      try {
        const response = await api.get<Product>(`/products/${id}`);
        if (active) {
          setProduct(response.data);
        }
      } catch (loadError: unknown) {
        if (active) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadProduct();
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => () => {
    if (addedTimeout.current !== null) {
      window.clearTimeout(addedTimeout.current);
    }
  }, []);

  const handleAddToCart = (): void => {
    if (!product || product.stock === 0) {
      return;
    }

    addToCart(product, quantity);
    setAdded(true);
    if (addedTimeout.current !== null) {
      window.clearTimeout(addedTimeout.current);
    }
    addedTimeout.current = window.setTimeout(() => {
      setAdded(false);
      addedTimeout.current = null;
    }, 2000);
  };

  const formattedPrice = product
    ? Number(product.price).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '';

  return (
    <main className="min-h-screen bg-void p-8 text-bone">
      {loading && <p className="font-body text-bone">Cargando...</p>}
      {!loading && error && <p role="alert" className="font-body text-alarm">{error}</p>}

      {!loading && !error && product && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            {imgError ? (
              <div className="flex h-96 w-full items-center justify-center bg-shadow text-sm text-blood">
                Sin imagen
              </div>
            ) : (
              <img
                src={product.imageUrl}
                alt={product.name}
                onError={(event) => {
                  event.currentTarget.src = fallbackImage;
                  setImgError(true);
                }}
                className="h-96 w-full object-cover"
              />
            )}
          </div>

          <section>
            <h1 className="font-display text-4xl text-alarm">{product.name}</h1>
            {product.category?.name ? (
              <Link
                to={`/category/${encodeURIComponent(product.category.name)}`}
                className="mt-2 inline-block font-body text-sm uppercase tracking-wide text-blood transition hover:text-alarm"
              >
                {product.category.name}
              </Link>
            ) : (
              <p className="mt-2 font-body text-sm uppercase tracking-wide text-blood">
                Sin categor�a
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {product.isRare && (
                <span className="bg-contraband px-2 py-1 text-xs font-bold text-void">
                  EDICIÓN RARA
                </span>
              )}
              {product.stock === 0 ? (
                <span className="border border-bone bg-shadow px-2 py-1 text-xs text-bone">
                  Agotado
                </span>
              ) : product.stock <= 3 ? (
                <span className="bg-alarm px-2 py-1 text-xs text-bone">
                  ¡Últimas {product.stock} unidades!
                </span>
              ) : null}
            </div>

            <p className="mt-4 font-body text-bone">{product.description}</p>
            <p className="mt-4 font-display text-3xl text-alarm">${formattedPrice}</p>

            <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <label htmlFor="product-quantity" className="font-body text-sm">
                Cantidad
              </label>
              <input
                id="product-quantity"
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                disabled={product.stock === 0}
                onChange={(event) => {
                  const nextQuantity = Number(event.target.value);
                  setQuantity(Math.max(1, Math.min(product.stock, nextQuantity)));
                }}
                className="w-20 border border-blood bg-shadow p-2 text-bone disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-alarm px-6 py-3 font-display text-bone transition hover:bg-blood disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {product.stock === 0 ? 'Agotado' : 'Añadir al carrito'}
              </button>
            </div>

            {added && (
              <p role="status" className="mt-3 font-body text-contraband">
                Añadido al carrito
              </p>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

export default ProductDetailPage;
