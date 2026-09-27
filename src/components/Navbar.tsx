import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = 'font-body text-bone transition hover:text-alarm';
  const closeMenu = (): void => setMenuOpen(false);

  return (
    <header className="border-b-2 border-alarm bg-void px-6 py-4 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-6">
          <Link
            to="/"
            className="font-display text-2xl tracking-wide text-alarm sm:text-3xl"
          >
            TAZI&apos;S MARKET
          </Link>

          <nav aria-label="Navegación principal" className="hidden items-center gap-5 md:flex">
            <Link to="/" className={linkClass}>Catálogo</Link>
            {isAuthenticated && (
              <Link to="/my-orders" className={linkClass}>Mis pedidos</Link>
            )}
            {isAdmin && <Link to="/admin/products" className={linkClass}>Admin</Link>}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-4 md:flex">
              {isAuthenticated ? (
                <>
                  <span className="font-body text-sm text-bone/75">{user?.email}</span>
                  <button
                    type="button"
                    onClick={logout}
                    className={`${linkClass} cursor-pointer border border-blood px-3 py-2`}
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className={linkClass}>Iniciar sesión</Link>
                  <Link to="/register" className={linkClass}>Registrarse</Link>
                </>
              )}
            </div>

            <Link
              to="/cart"
              aria-label={`Carrito, ${totalItems} productos`}
              className="relative font-body text-bone transition hover:text-alarm"
            >
              <span aria-hidden="true">🛒</span>
              {totalItems > 0 && (
                <span className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-alarm px-1 text-xs text-bone">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              type="button"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen((open) => !open)}
              className={`${linkClass} md:hidden`}
            >
              ☰
            </button>
          </div>
        </div>

        {menuOpen && (
          <div id="mobile-navigation" className="mt-4 border-t border-blood/30 pt-3 md:hidden">
            <nav aria-label="Navegación móvil" className="flex flex-col">
              <Link to="/" onClick={closeMenu} className={`${linkClass} border-b border-blood/30 py-3`}>
                Catálogo
              </Link>
              {isAuthenticated && (
                <Link
                  to="/my-orders"
                  onClick={closeMenu}
                  className={`${linkClass} border-b border-blood/30 py-3`}
                >
                  Mis pedidos
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin/products"
                  onClick={closeMenu}
                  className={`${linkClass} border-b border-blood/30 py-3`}
                >
                  Admin
                </Link>
              )}
            </nav>

            <div className="flex flex-col items-start gap-3 pt-4">
              {isAuthenticated ? (
                <>
                  <span className="font-body text-sm text-bone/75">{user?.email}</span>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className={`${linkClass} cursor-pointer border-b border-blood/30 pb-3`}
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeMenu} className={`${linkClass} border-b border-blood/30 pb-3`}>
                    Iniciar sesión
                  </Link>
                  <Link to="/register" onClick={closeMenu} className={linkClass}>
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
