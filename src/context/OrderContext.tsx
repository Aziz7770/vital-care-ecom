import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  note: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  status: OrderStatus;
  locked: boolean;
  createdAt: string;
  updatedAt: string;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "status" | "locked" | "createdAt" | "updatedAt">) => string;
  updateStatus: (orderId: string, status: OrderStatus) => void;
  toggleLock: (orderId: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const STORAGE_KEY = "homeopathy_orders";

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const addOrder = useCallback((orderData: Omit<Order, "id" | "status" | "locked" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const id = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const newOrder: Order = {
      ...orderData,
      id,
      status: "pending",
      locked: false,
      createdAt: now,
      updatedAt: now,
    };
    setOrders((prev) => [newOrder, ...prev]);
    return id;
  }, []);

  const updateStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId && !o.locked
          ? { ...o, status, updatedAt: new Date().toISOString() }
          : o
      )
    );
  }, []);

  const toggleLock = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, locked: !o.locked, updatedAt: new Date().toISOString() }
          : o
      )
    );
  }, []);

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateStatus, toggleLock }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrders must be used within OrderProvider");
  return context;
};
