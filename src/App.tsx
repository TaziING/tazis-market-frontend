import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminProductFormPage from './pages/AdminProductFormPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminCategoryFormPage from './pages/AdminCategoryFormPage';
import CartPage from './pages/CartPage';
import CategoryPage from './pages/CategoryPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MyOrdersPage from './pages/MyOrdersPage';
import ProductDetailPage from './pages/ProductDetailPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/my-orders" element={<MyOrdersPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/category/:categoryName" element={<CategoryPage />} />
            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/admin/products" element={<AdminProductsPage />} />
              <Route path="/admin/products/new" element={<AdminProductFormPage />} />
              <Route path="/admin/products/:id/edit" element={<AdminProductFormPage />} />
              <Route path="/admin/categories" element={<AdminCategoriesPage />} />
              <Route path="/admin/categories/new" element={<AdminCategoryFormPage />} />
              <Route path="/admin/categories/:id/edit" element={<AdminCategoryFormPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
