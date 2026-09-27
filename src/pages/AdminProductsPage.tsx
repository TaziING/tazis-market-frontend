import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import type { Product } from '../types';

function getErrorMessage(error: unknown, fallback = 'No se pudieron cargar los productos.'): string {
  if (axios.isAxiosError<{ message?: unknown }>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') {
      return message;
    }
  }

  return fallback;
}

function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadProducts = async (): Promise<void> => {
      try {
        const response = await api.get<Product[]>('/products');
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
  }, []);

  const handleDelete = async (productId: string, productName: string): Promise<void> => {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar "${productName}"? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) {
      return;
    }

    setDeletingId(productId);
    try {
      await api.delete(`/products/${productId}`);
      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== productId),
      );
    } catch (deleteError: unknown) {
      window.alert(getErrorMessage(deleteError, 'No se pudo eliminar el producto.'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-void p-8 text-bone">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-alarm">Panel de Administración — Productos</h1>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/categories"
            className="border border-blood px-6 py-3 font-display text-bone transition hover:text-alarm"
          >
            Ver Categorías
          </Link>
          <Link
            to="/admin/products/new"
            className="bg-alarm px-6 py-3 font-display text-bone transition hover:bg-blood"
          >
            + Nuevo Producto
          </Link>
        </div>
      </div>

      {loading && <p className="font-body text-bone">Cargando...</p>}
      {!loading && error && <p role="alert" className="font-body text-alarm">{error}</p>}
      {!loading && !error && products.length === 0 && (
        <p className="font-body text-bone">No hay productos registrados.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left font-body text-bone">
            <thead>
              <tr className="border-b border-blood/30 text-sm text-blood">
                <th scope="col" className="px-4 py-3">Nombre</th>
                <th scope="col" className="px-4 py-3">Categoría</th>
                <th scope="col" className="px-4 py-3">Precio</th>
                <th scope="col" className="px-4 py-3">Stock</th>
                <th scope="col" className="px-4 py-3">Rara</th>
                <th scope="col" className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-blood/30 hover:bg-shadow">
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3">{product.category?.name ?? 'Sin categoría'}</td>
                  <td className="px-4 py-3">${Number(product.price).toFixed(2)}</td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3">{product.isRare ? 'Sí' : 'No'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        className="text-bone transition hover:text-alarm"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => void handleDelete(product.id, product.name)}
                        disabled={deletingId === product.id}
                        className="text-alarm transition hover:text-blood"
                      >
                        {deletingId === product.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default AdminProductsPage;
