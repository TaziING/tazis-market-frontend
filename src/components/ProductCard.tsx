import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';

const fallbackImage =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="192" viewBox="0 0 400 192"%3E%3Crect width="400" height="192" fill="%23161616"/%3E%3C/svg%3E';

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const isOutOfStock = product.stock === 0;
  const categoryName = product.category?.name ?? '';
  const price = Number(product.price).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <article
      className={`block border border-blood bg-shadow transition hover:border-alarm ${isOutOfStock ? 'opacity-60' : ''}`}
    >
      <Link to={`/product/${product.id}`} aria-label={`Ver ${product.name}`} className="block">
        <div className="relative">
          {imgError ? (
            <div className="flex h-48 w-full items-center justify-center bg-shadow text-sm text-blood">
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
              className="h-48 w-full object-cover"
            />
          )}
          <div className="absolute left-3 top-3 flex flex-col items-start gap-2">
            {product.isRare && (
              <span className="bg-contraband px-2 py-1 text-xs font-bold text-void">
                EDICIÓN RARA
              </span>
            )}
            {isOutOfStock ? (
              <span className="border border-bone bg-shadow px-2 py-1 text-xs text-bone">
                Agotado
              </span>
            ) : product.stock <= 3 ? (
              <span className="bg-alarm px-2 py-1 text-xs text-bone">
                ¡Últimas {product.stock} unidades!
              </span>
            ) : null}
          </div>
        </div>
        <h2 className="px-4 pt-4 font-display text-lg text-bone">{product.name}</h2>
      </Link>

      <div className="space-y-2 px-4 pb-4 pt-2">
        {categoryName ? (
          <Link
            to={`/category/${encodeURIComponent(categoryName)}`}
            className="font-body text-xs uppercase tracking-wide text-blood transition hover:text-alarm"
          >
            {categoryName}
          </Link>
        ) : (
          <p className="font-body text-xs uppercase tracking-wide text-blood">Sin categoría</p>
        )}
        <p className="font-display text-xl text-alarm">${price}</p>
      </div>
    </article>
  );
}

export default ProductCard;
