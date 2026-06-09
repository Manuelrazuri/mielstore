import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute';
import LandingPage from './components/landing/LandingPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProductList from './components/products/ProductList';
import CartPage from './components/cart/CartPage';
import Checkout from './components/cart/Checkout';
import MyOrders from './components/orders/MyOrders';
import Dashboard from './components/admin/Dashboard';
import ProductsAdmin from './components/admin/ProductsAdmin';
import OrdersList from './components/admin/OrdersList';
import UsersList from './components/admin/UsersList';
import PickupDatesAdmin from './components/admin/PickupDatesAdmin';
import './index.scss';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/productos" element={<ProductList />} />
            <Route path="/carrito" element={<CartPage />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/mis-pedidos" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
            {/* Rutas de administrador */}
            <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/productos" element={<ProtectedRoute adminOnly><ProductsAdmin /></ProtectedRoute>} />
            <Route path="/admin/pedidos" element={<ProtectedRoute adminOnly><OrdersList /></ProtectedRoute>} />
            <Route path="/admin/usuarios" element={<ProtectedRoute adminOnly><UsersList /></ProtectedRoute>} />
            <Route path="/admin/fechas-recojo" element={<ProtectedRoute adminOnly><PickupDatesAdmin /></ProtectedRoute>} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;