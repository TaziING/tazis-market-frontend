import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import type { Category } from '../types';

function getErrorMessage(error: unknown, fallback = 'No se pudo guardar la categoría. Inténtalo de nuevo.'): string {
  if (axios.isAxiosError<{ message?: unknown }>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') {
      return message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function AdminCategoryFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(Boolean(id));
    setError(null);

    if (!id) {
      return () => {
        active = false;
      };
    }

    const loadCategory = async (): Promise<void> => {
      try {
        const response = await api.get<Category[]>('/categories');
        const category = response.data.find((item) => item.id === id);
        if (!category) {
          throw new Error('Categoría no encontrada.');
        }
        if (active) {
          setName(category.name);
        }
      } catch (loadError: unknown) {
        if (active) {
          setError(getErrorMessage(loadError, 'No se pudo cargar la categoría.'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadCategory();
    return () => {
      active = false;
    };
  }, [id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (id) {
        await api.put(`/categories/${id}`, { name });
      } else {
        await api.post('/categories', { name });
      }
      navigate('/admin/categories');
    } catch (submitError: unknown) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-void p-8 text-bone">
      <div className="mx-auto max-w-2xl">
        <Link to="/admin/categories" className="mb-4 inline-block text-sm text-blood transition hover:text-alarm">
          ← Volver
        </Link>
        <h1 className="mb-6 font-display text-3xl text-alarm">
          {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
        </h1>

        {loading ? (
          <p className="font-body text-bone">Cargando...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="category-name" className="font-body text-sm">Nombre</label>
              <input
                id="category-name"
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full border border-blood bg-void p-3 text-bone focus:border-alarm focus:outline-none"
              />
            </div>

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
                  : 'Crear Categoría'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default AdminCategoryFormPage;
