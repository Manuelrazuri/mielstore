import { useState, useEffect } from 'react';

export const useCart = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Normalizar: asegurar que los precios son números y la cantidad es entero
      const normalized = parsed.map(item => ({
        ...item,
        precio_normal: parseFloat(item.precio_normal) || 0,
        precio_mayor: parseFloat(item.precio_mayor) || 0,
        cantidad: parseInt(item.cantidad, 10) || 0
      }));
      setCart(normalized);
    }
  }, []);

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const addItem = (product, cantidad) => {
    // Normalizar los precios al agregar
    const normalizedProduct = {
      ...product,
      precio_normal: parseFloat(product.precio_normal) || 0,
      precio_mayor: parseFloat(product.precio_mayor) || 0,
      cantidad: parseInt(cantidad, 10) || 0
    };

    const existing = cart.find(i => i.id_producto === normalizedProduct.id_producto);
    let newCart;
    if (existing) {
      newCart = cart.map(i =>
        i.id_producto === normalizedProduct.id_producto
          ? { ...i, cantidad: i.cantidad + normalizedProduct.cantidad }
          : i
      );
    } else {
      newCart = [...cart, normalizedProduct];
    }
    saveCart(newCart);
  };

  const updateQuantity = (id, cantidad) => {
    if (cantidad <= 0) {
      removeItem(id);
      return;
    }
    const newCart = cart.map(i =>
      i.id_producto === id ? { ...i, cantidad: parseInt(cantidad, 10) } : i
    );
    saveCart(newCart);
  };

  const removeItem = (id) => {
    const newCart = cart.filter(i => i.id_producto !== id);
    saveCart(newCart);
  };

  const clearCart = () => saveCart([]);

  const getTotalItems = () => cart.reduce((sum, i) => sum + i.cantidad, 0);

  const getSubtotal = () => {
    return cart.reduce((sum, i) => {
      const price = i.cantidad >= 6 ? i.precio_mayor : i.precio_normal;
      return sum + (price * i.cantidad);
    }, 0);
  };

  const getShippingCost = () => {
    const totalUnits = cart.reduce((sum, i) => sum + i.cantidad, 0);
    return totalUnits >= 6 ? 6 : 8;
  };

  const getTotal = () => getSubtotal() + getShippingCost();

  return {
    cart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalItems,
    getSubtotal,
    getShippingCost,
    getTotal
  };
};