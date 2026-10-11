import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { ProductsPage } from '@/features/products';
import { OrdersPage } from '@/features/orders';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/products" replace />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route
        path="*"
        element={
          <>
            <h1>Nie znaleziono strony</h1>
            <Link to="/products">Przejdź do Products</Link>
          </>
        }
      />
    </Routes>
  );
}
