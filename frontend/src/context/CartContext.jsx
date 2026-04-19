import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(cart.map((item) =>
        item.id === product.id ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const increaseQty = (id) => {
    setCart(cart.map((item) =>
      item.id === id ? { ...item, qty: item.qty + 1 } : item
    ));
  };

  const decreaseQty = (id) => {
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, qty: item.qty - 1 } : item
      ).filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // ✅ ADD THIS
  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart, addToCart, increaseQty, decreaseQty,
        removeItem, clearCart, total,
        count
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}