import { useEffect, useState } from 'react';
import axios from 'axios';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import api from '../lib/api';
import type { Category, Product } from '../types';

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: unknown }>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') {
      return message;
    }
  }

  return fallback;
}

function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isRareOnly, setIsRareOnly] = useState(false);

  useEffect(() => {
    let active = true;

    const loadCategories = async (): Promise<void> => {
      try {
        const response = await api.get<Category[]>('/categories');
        if (active) {
          setCategories(response.data);
        }
      } catch (loadError: unknown) {
        if (active) {
          setError(getErrorMessage(loadError, 'No se pudieron cargar las categorías.'));
        }
      }
    };

    void loadCategories();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    let active = true;
    const loadProducts = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      const params: { search?: string; category?: string; isRare?: string } = {};
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      if (selectedCategory) {
        const category = categories.find(({ id }) => id === selectedCategory);
        if (category) {
          params.category = category.name;
        }
      }
      if (isRareOnly) {
        params.isRare = 'true';
      }

      try {
        const response = await api.get<Product[]>('/products', { params });
        if (active) {
          setProducts(response.data);
        }
      } catch (loadError: unknown) {
        if (active) {
          setError(getErrorMessage(loadError, 'No se pudieron cargar los productos.'));
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
  }, [debouncedSearch, selectedCategory, isRareOnly, categories]);

  return (
    <main className="min-h-screen bg-void p-8 text-bone">
      <Hero />
      <h1 id="catalogo" className="mt-8 font-display text-4xl text-alarm">Catálogo</h1>

      <section aria-label="Filtros de productos" className="my-8 flex flex-wrap items-center gap-4">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar productos..."
          aria-label="Buscar productos"
          className="min-w-56 border border-blood bg-shadow px-4 py-3 font-body text-bone placeholder:text-bone/50 focus:border-alarm focus:outline-none"
        />

        <select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          aria-label="Filtrar por categoría"
          className="border border-blood bg-shadow px-4 py-3 font-body text-bone focus:border-alarm focus:outline-none"
        >
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <label className="flex cursor-pointer items-center gap-2 font-body text-bone">
          <input
            type="checkbox"
            checked={isRareOnly}
            onChange={(event) => setIsRareOnly(event.target.checked)}
            className="accent-alarm"
          />
          Solo edición rara
        </label>
      </section>

      {loading && <p className="font-body text-bone">Cargando...</p>}
      {error && <p role="alert" className="font-body text-alarm">{error}</p>}
      {!loading && !error && products.length === 0 && (
        <p className="font-body text-bone">No se encontraron productos con estos filtros.</p>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}

export default HomePage;
