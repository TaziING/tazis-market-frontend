import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import type { Category, Product } from '../types';

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: unknown }>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') {
      return message;
    }
  }

  return 'No se pudo guardar el producto. Inténtalo de nuevo.';
}

function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [isRare, setIsRare] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(Boolean(id));
    setError(null);

    const loadFormData = async (): Promise<void> => {
      try {
        const categoriesResponse = await api.get<Category[]>('/categories');
        if (active) {
          setCategories(categoriesResponse.data);
        }

        if (id) {
          const productResponse = await api.get<Product>(`/products/${id}`);
          if (active) {
            const product = productResponse.data;
            setName(product.name);
            setDescription(product.description);
            setImageUrl(product.imageUrl);
            setCategoryId(product.categoryId);
            setPrice(String(product.price));
            setStock(String(product.stock));
            setIsRare(product.isRare);
          }
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

    void loadFormData();
    return () => {
      active = false;
    };
  }, [id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const productData = {
      name,
      description,
      imageUrl,
      price: Number(price),
      stock: Number(stock),
      categoryId,
      isRare,
    };

    try {
      if (id) {
        await api.put(`/products/${id}`, productData);
      } else {
        await api.post('/products', productData);
      }
      navigate('/admin/products');
    } catch (submitError: unknown) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-void p-8 text-bone">
      <div className="mx-auto max-w-2xl">
        <Link to="/admin/products" className="mb-4 inline-block text-sm text-blood transition hover:text-alarm">
          ← Volver
        </Link>
        <h1 className="mb-6 font-display text-3xl text-alarm">
          {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
        </h1>

        {loading ? (
          <p className="font-body text-bone">Cargando...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="product-name" className="font-body text-sm">Nombre</label>
              <input
                id="product-name"
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full border border-blood bg-void p-3 text-bone focus:border-alarm focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="product-description" className="font-body text-sm">Descripción</label>
              <textarea
                id="product-description"
                required
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full border border-blood bg-void p-3 text-bone focus:border-alarm focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="product-image-url" className="font-body text-sm">URL de imagen</label>
              <input
                id="product-image-url"
                type="url"
                required
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                className="w-full border border-blood bg-void p-3 text-bone focus:border-alarm focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="product-category" className="font-body text-sm">Categoría</label>
              <select
                id="product-category"
                required
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="w-full border border-blood bg-void p-3 text-bone focus:border-alarm focus:outline-none"
              >
                <option value="" disabled>Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="product-price" className="font-body text-sm">Precio</label>
                <input
                  id="product-price"
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  className="w-full border border-blood bg-void p-3 text-bone focus:border-alarm focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="product-stock" className="font-body text-sm">Stock</label>
                <input
                  id="product-stock"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={stock}
                  onChange={(event) => setStock(event.target.value)}
                  className="w-full border border-blood bg-void p-3 text-bone focus:border-alarm focus:outline-none"
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 font-body text-sm">
              <input
                type="checkbox"
                checked={isRare}
                onChange={(event) => setIsRare(event.target.checked)}
                className="accent-alarm"
              />
              Edición rara
            </label>

            {error && <p role="alert" className="text-sm text-alarm">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="bg-alarm px-6 py-3 font-display text-bone transition hover:bg-blood disabled:opacity-50"
            >
              {submitting
                ? 'Guardando...'
                : isEditing
                  ? 'Guardar Cambios'
                  : 'Crear Producto'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default AdminProductFormPage;
