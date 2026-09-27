import { useEffect, useState } from 'react';
import api from '../lib/api';
import type { Product } from '../types';

const imagePositions = [
  'left-[8%] top-[12%] rotate-[-7deg]',
  'right-[8%] top-[24%] rotate-[5deg]',
  'bottom-[5%] left-[31%] rotate-[-2deg]',
];

function Hero() {
  const [rareProducts, setRareProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadRareProducts = async (): Promise<void> => {
      try {
        const response = await api.get<Product[]>('/products', {
          params: { isRare: 'true' },
        });
        if (active) {
          setRareProducts(response.data.slice(0, 3));
        }
      } catch {
        if (active) {
          setRareProducts([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadRareProducts();
    return () => {
      active = false;
    };
  }, []);

  const scrollToCatalog = (): void => {
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="grid min-h-[70vh] grid-cols-1 bg-void md:min-h-[80vh] md:grid-cols-2">
      <div className="flex flex-col justify-center p-8 md:p-16">
        <h1 className="m-0 -ml-1 font-display text-6xl leading-[0.9] text-alarm sm:text-7xl md:-ml-2 md:text-8xl lg:text-9xl">
          TAZI&apos;S<br />MARKET
        </h1>
        <p className="mt-4 max-w-md font-body text-lg text-bone md:text-xl">
          Reliquias de videojuegos que ya no deberías poder encontrar. Cada pieza tiene una historia — y un dueño nuevo esperando.
        </p>
        <button
          type="button"
          onClick={scrollToCatalog}
          className="mt-8 inline-block w-fit bg-alarm px-8 py-4 font-display text-bone transition hover:bg-blood"
        >
          Ver catálogo
        </button>
      </div>

      <div className="relative min-h-[360px] overflow-hidden p-6 md:min-h-[560px] md:p-8">
        <div
          className="absolute inset-0 bg-shadow"
          style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%)' }}
        />

        {loading ? null : rareProducts.length > 0 ? (
          rareProducts.map((product, index) => (
            <div
              key={product.id}
              className={`absolute z-10 ${imagePositions[index]} transition-transform duration-300 hover:z-20 hover:scale-105`}
            >
              <div className="relative">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-40 w-40 border-4 border-alarm object-cover sm:h-48 sm:w-48 md:h-64 md:w-64"
                />
                <span className="absolute left-2 top-2 bg-contraband/95 px-2 py-1 text-xs font-bold text-void shadow-md">
                  EDICIÓN RARA
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="flex h-56 w-56 rotate-[-6deg] items-center justify-center border-4 border-alarm bg-void sm:h-64 sm:w-64">
              <span className="font-display text-7xl text-alarm">TM</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Hero;
