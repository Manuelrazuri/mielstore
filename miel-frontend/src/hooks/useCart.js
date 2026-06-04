import { useState, useEffect } from 'react';

export const useCart = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const addItem = (product, cantidad) => {
    const existing = cart.find(i => i.id_producto === product.id_producto);
    let newCart;
    if (existing) {
      newCart = cart.map(i =>
        i.id_producto === product.id_producto
          ? { ...i, cantidad: i.cantidad + cantidad }
          : i
      );
    } else {
      newCart = [...cart, { ...product, cantidad }];
    }
    saveCart(newCart);
  };

  const updateQuantity = (id, cantidad) => {
    if (cantidad <= 0) {
      removeItem(id);
      return;
    }
    const newCart = cart.map(i =>
      i.id_producto === id ? { ...i, cantidad } : i
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
      return sum + price * i.cantidad;
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