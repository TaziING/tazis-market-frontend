import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import type { Category } from '../types';

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: unknown }>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') {
      return message;
    }
  }

  return fallback;
}

function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadCategories();
    return () => {
      active = false;
    };
  }, []);

  const handleDelete = async (categoryId: string, categoryName: string): Promise<void> => {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar "${categoryName}"? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) {
      return;
    }

    setDeletingId(categoryId);
    try {
      await api.delete(`/categories/${categoryId}`);
      setCategories((currentCategories) =>
        currentCategories.filter((category) => category.id !== categoryId),
      );
    } catch (deleteError: unknown) {
      window.alert(getErrorMessage(deleteError, 'No se pudo eliminar la categoría.'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-void p-8 text-bone">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-alarm">Panel de Administración — Categorías</h1>
        <Link
          to="/admin/categories/new"
          className="bg-alarm px-6 py-3 font-display text-bone transition hover:bg-blood"
        >
          + Nueva Categoría
        </Link>
      </div>

      <Link
        to="/admin/products"
        className="mb-6 inline-block text-sm text-blood transition hover:text-alarm"
      >
        ← Volver a Productos
      </Link>

      {loading && <p className="font-body text-bone">Cargando...</p>}
      {!loading && error && <p role="alert" className="font-body text-alarm">{error}</p>}
      {!loading && !error && categories.length === 0 && (
        <p className="font-body text-bone">No hay categorías registradas.</p>
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-left font-body text-bone">
            <thead>
              <tr className="border-b border-blood/30 text-sm text-blood">
                <th scope="col" className="px-4 py-3">Nombre</th>
                <th scope="col" className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-blood/30 hover:bg-shadow">
                  <td className="px-4 py-3">{category.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      <Link
                        to={`/admin/categories/${category.id}/edit`}
                        className="text-bone transition hover:text-alarm"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => void handleDelete(category.id, category.name)}
                        disabled={deletingId === category.id}
                        className="text-alarm transition hover:text-blood disabled:opacity-50"
                      >
                        {deletingId === category.id ? 'Eliminando...' : 'Eliminar'}
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

export default AdminCategoriesPage;
