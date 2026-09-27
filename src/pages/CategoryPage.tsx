import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import api from '../lib/api';
import type { Product } from '../types';

function decodeCategoryName(categoryName: string | undefined): string {
  if (!categoryName) {
    return '';
  }

  try {
    return decodeURIComponent(categoryName);
  } catch {
    return categoryName;
  }
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: unknown }>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') {
      return message;
    }
  }

  return 'No se pudieron cargar los productos de esta categoría.';
}

function CategoryPage() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const displayCategoryName = decodeCategoryName(categoryName);

  useEffect(() => {
    let active = true;

    if (!categoryName) {
      setProducts([]);
      setError('No se especificó una categoría.');
      setLoading(false);
      return () => {
        active = false;
      };
    }

    const loadProducts = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<Product[]>(
          `/products?category=${encodeURIComponent(categoryName)}`,
        );
        if (active) {
          setProducts(response.data);
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

    void loadProducts();
    return () => {
      active = false;
    };
  }, [categoryName]);

  return (
    <main className="min-h-screen bg-void p-8 text-bone">
      <Link to="/" className="mb-4 inline-block text-sm text-blood transition hover:text-alarm">
        ← Volver al catálogo
      </Link>
      <h1 className="mb-6 font-display text-4xl text-alarm">
        Categoría: {displayCategoryName}
      </h1>

      {loading && <p className="font-body text-bone">Cargando...</p>}
      {!loading && error && <p role="alert" className="font-body text-alarm">{error}</p>}
      {!loading && !error && products.length === 0 && (
        <p className="font-body text-bone">No se encontraron productos con estos filtros.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}

export default CategoryPage;
