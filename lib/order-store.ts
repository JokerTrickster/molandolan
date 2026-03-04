export interface Order {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  buyerName: string;
  buyerPhone: string;
  address: string;
  isMember: boolean;
  status: "pending" | "paid" | "shipping" | "delivered";
  createdAt: string;
}

const STORAGE_KEY = "molandolan_orders";

function readAll(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(orders: Order[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function getOrders(): Order[] {
  return readAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getOrdersByPhone(phone: string): Order[] {
  return getOrders().filter((o) => o.buyerPhone === phone);
}

export function addOrder(
  data: Omit<Order, "id" | "status" | "createdAt">
): Order {
  const order: Order = {
    ...data,
    id: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  const orders = readAll();
  orders.push(order);
  writeAll(orders);
  return order;
}

export function updateOrderStatus(
  orderId: string,
  status: Order["status"]
): void {
  const orders = readAll();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx !== -1) {
    orders[idx].status = status;
    writeAll(orders);
  }
}

export const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "입금대기",
  paid: "입금확인",
  shipping: "배송중",
  delivered: "배송완료",
};
