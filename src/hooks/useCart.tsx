import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

type CartItem = {
  productId: string;
  name: string;
  price_cents: number;
  quantity: number;
  image_url?: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (product: any) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  bookingId: string | null;
  setBookingId: (id: string | null) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Load cart and booking from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    const savedBookingId = localStorage.getItem("cartBookingId");
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
    if (savedBookingId) {
      setBookingId(savedBookingId);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  // Save bookingId to localStorage whenever it changes
  useEffect(() => {
    if (bookingId) {
      localStorage.setItem("cartBookingId", bookingId);
    } else {
      localStorage.removeItem("cartBookingId");
    }
  }, [bookingId]);

  const addItem = (product: any) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        toast.success("Quantity updated in cart");
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      toast.success("Added to cart");
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price_cents: product.price_cents,
          quantity: 1,
          image_url: product.image_url,
        },
      ];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
    toast.info("Removed from cart");
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setBookingId(null);
  };

  const total = items.reduce(
    (sum, item) => sum + item.price_cents * item.quantity,
    0
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        bookingId,
        setBookingId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
