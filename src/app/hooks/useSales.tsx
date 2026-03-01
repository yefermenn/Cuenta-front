import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SaleDetail {
  id: string;
  cantidad: number;
  precio_unitario: string;
  subtotal: string;
  productId: number;
  product?: any;
}

interface RawSale {
  id: string;
  fecha: string;
  metodo_pago: string;
  total_venta: string;
  saleDetails?: SaleDetail[];
}

export interface Venta {
  id: string;
  items: any[];
  totalVenta: number;
  fecha: string;
  rawFecha: string;
  metodo_pago: string;
}

interface SalesContextValue {
  ventas: Venta[];
  refreshSales: () => Promise<void>;
  isLoading: boolean;
}

const SalesContext = createContext<SalesContextValue | undefined>(undefined);

async function fetchSalesFromServer(): Promise<RawSale[]> {
  const token = localStorage.getItem('jwt');
  const res = await fetch('http://localhost:3000/sales', {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });
  if (!res.ok) throw new Error('Error fetching sales');
  return res.json();
}

function mapRawToVentas(raw: RawSale[]): Venta[] {
  const savedUser = localStorage.getItem('user');
  let products: any[] = [];
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      if (Array.isArray(user.products)) products = user.products;
    } catch {}
  }

  return raw.map((s) => ({
    id: s.id,
    items: Array.isArray(s.saleDetails)
      ? s.saleDetails.map((detail) => ({
          saleDetailId: detail.id,
          productoId: String(detail.productId),
          productoNombre: detail.product?.nombre || products.find((p) => p.id === detail.productId)?.nombre || 'Desconocido',
          cantidad: detail.cantidad,
          precioUnitario: parseFloat(detail.precio_unitario),
          total: parseFloat(detail.subtotal),
        }))
      : [],
    totalVenta: parseFloat(s.total_venta),
    fecha: s.fecha ? new Date(s.fecha).toLocaleString('es-ES') : new Date().toLocaleString('es-ES'),
    rawFecha: s.fecha,
    metodo_pago: s.metodo_pago,
  }));
}

export function SalesProvider({ children }: { children: ReactNode }) {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshSales = async () => {
    setIsLoading(true);
    try {
      const raw = await fetchSalesFromServer();
      const mapped = mapRawToVentas(raw as RawSale[]);
      setVentas(mapped);
    } catch (e) {
      // Silenciar errores para no romper la UI; se puede mejorar con un logger
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    // fetch once on mount
    (async () => {
      if (!mounted) return;
      await refreshSales();
    })();

    // Poll every 5s
    const id = setInterval(() => {
      refreshSales();
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SalesContext.Provider value={{ ventas, refreshSales, isLoading }}>
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const ctx = useContext(SalesContext);
  if (!ctx) throw new Error('useSales must be used within SalesProvider');
  return ctx;
}
