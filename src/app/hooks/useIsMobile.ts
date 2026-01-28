import { useState, useEffect } from 'react';

/**
 * Hook para detectar si la pantalla es móvil
 * Considera móvil cualquier pantalla menor a 768px (breakpoint md de Tailwind)
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Verificar en la carga inicial
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    // Agregar listener para cambios de tamaño
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}
