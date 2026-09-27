import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import type { Order } from '../types';

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: unknown }>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') {
      return message;
    }
  }

  return fallback;
}

function formatPrice(price: number): string {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadOrders = async (): Promise<void> => {
      try {
        const response = await api.get<Order[]>('/orders/my-orders');
        if (active) {
          setOrders(response.data);
        }
      } catch (loadError: unknown) {
        if (active) {
          setError(getErrorMessage(loadError, 'No se pudieron cargar tus pedidos.'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadOrders();
    return () => {
      active = false;
    };
  }, []);

  const cancelOrder = async (orderId: string): Promise<void> => {
    setCancelingId(orderId);
    try {
      const response = await api.patch<Pick<Order, 'id' | 'status'>>(
        `/orders/${orderId}/cancel`,
      );
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? { ...order, ...response.data }
            : order,
        ),
      );
    } catch (cancelError: unknown) {
      window.alert(getErrorMessage(cancelError, 'No se pudo cancelar el pedido.'));
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-void p-8 text-bone">
      <h1 className="mb-6 font-display text-4xl text-alarm">Mis Pedidos</h1>

      {loading && <p className="font-body text-bone">Cargando...</p>}
      {!loading && error && <p role="alert" className="font-body text-alarm">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="font-body text-bone">
          <p>Aún no tienes pedidos.</p>
          <Link to="/" className="mt-4 inline-block text-blood transition hover:text-alarm">
            Ir al catálogo
          </Link>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div>
          {orders.map((order) => {
            const statusStyle = order.status === 'PENDING'
              ? 'bg-contraband text-void'
              : order.status === 'CANCELLED'
                ? 'bg-blood text-bone'
                : 'bg-alarm text-bone';
            const statusLabel = order.status === 'PENDING'
              ? 'Pendiente'
              : order.status === 'CANCELLED'
                ? 'Cancelado'
                : order.status;

            return (
              <article key={order.id} className="mb-4 border border-blood bg-shadow p-6">
                <div className="flex justify-between gap-4">
                  <div>
                    <h2 className="font-display text-lg text-bone">
                      Pedido #{order.id.slice(0, 8)}
                    </h2>
                    <p className="text-sm text-blood">
                      {new Date(order.createdAt).toLocaleDateString('es-CR')}
                    </p>
                  </div>
                  <span className={`h-fit px-3 py-1 text-xs font-bold ${statusStyle}`}>
                    {statusLabel}
                  </span>
                </div>

                <ul className="my-5 space-y-2 font-body text-sm">
                  {order.items.map((item) => {
                    const subtotal = Number(item.priceAtPurchase) * item.quantity;
                    return (
                      <li key={item.id} className="flex justify-between gap-4">
                        <span>
                          {item.product?.name ?? 'Producto no disponible'} x{item.quantity}
                        </span>
                        <span>${formatPrice(subtotal)}</span>
                      </li>
                    );
                  })}
                </ul>

                <p className="text-right font-display text-xl text-alarm">
                  Total: ${formatPrice(Number(order.total))}
                </p>

                {order.status === 'PENDING' && (
                  <div className="mt-4 text-right">
                    <button
                      type="button"
                      onClick={() => void cancelOrder(order.id)}
                      disabled={cancelingId === order.id}
                      className="bg-alarm px-4 py-2 font-body text-bone transition hover:bg-blood disabled:opacity-50"
                    >
                      {cancelingId === order.id ? 'Cancelando...' : 'Cancelar pedido'}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default MyOrdersPage;
