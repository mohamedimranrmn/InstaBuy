import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.productId);

      if (existing) {
        return prev.map(item =>
          item.productId === product.productId
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [...prev, {
        productId: product.productId,
        productName: product.productName,
        price: product.price,
        imageUrl: product.imageUrl,
        qty: 1
      }];
    });
  };

  const increaseQty = (productId) => {
    setCart(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const decreaseQty = (productId) => {
    setCart(prev =>
      prev
        .map(item =>
          item.productId === productId ? { ...item, qty: item.qty - 1 } : item
        )
        .filter(item => item.qty > 0)
    );
  };

  const removeItem = (productId) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart, addToCart, increaseQty, decreaseQty,
        removeItem, clearCart, total, count
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}