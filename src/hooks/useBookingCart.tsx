import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { calculatePackageDiscount, DiscountResult } from "@/lib/packageDiscount";

type BookingCartItem = {
  serviceId: string;
  serviceName: string;
  staffId?: string;
  staffName?: string;
  date: Date;
  time: string;
  duration: number;
  price: number;
  guestName?: string;
  notes?: string;
  familyMemberId?: string;
  familyMemberName?: string;
  forSelf?: boolean;
  isRestaurant?: boolean;
};

type BookingCartContextType = {
  items: BookingCartItem[];
  addToCart: (item: BookingCartItem) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  totalPrice: number; // subtotal (pre-discount)
  itemCount: number;
  discount: DiscountResult; // multi-service package discount
  finalPrice: number; // total after discount
};

const BookingCartContext = createContext<BookingCartContextType | undefined>(undefined);

export const BookingCartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<BookingCartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("bookingCart");
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      // Convert date strings back to Date objects
      const itemsWithDates = parsed.map((item: any) => ({
        ...item,
        date: new Date(item.date),
      }));
      setItems(itemsWithDates);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("bookingCart", JSON.stringify(items));
  }, [items]);

  const addToCart = (item: BookingCartItem) => {
    setItems((prev) => [...prev, item]);
    toast.success("Added to booking cart");
  };

  const removeFromCart = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    toast.info("Removed from booking cart");
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem("bookingCart");
  };

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const itemCount = items.length;
  const discount = calculatePackageDiscount(items);
  const finalPrice = discount.total;

  return (
    <BookingCartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        totalPrice,
        itemCount,
        discount,
        finalPrice,
      }}
    >
      {children}
    </BookingCartContext.Provider>
  );
};

export const useBookingCart = () => {
  const context = useContext(BookingCartContext);
  if (context === undefined) {
    throw new Error("useBookingCart must be used within a BookingCartProvider");
  }
  return context;
};
