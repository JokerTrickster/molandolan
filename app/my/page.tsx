"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getOrders, Order, STATUS_LABELS } from "@/lib/order-store";
import Link from "next/link";

type Tab = "profile" | "orders";

export default function MyPage() {
  const { user, isLoggedIn, updateProfile } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");
  const [orders, setOrders] = useState<Order[]>([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
    }
  }, [user]);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  const handleSaveProfile = () => {
    updateProfile({ name, phone, address });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!isLoggedIn) {
    return (
      <div className="px-4 pt-10 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-lg font-black text-foreground mb-2">로그인이 필요합니다</h1>
        <p className="text-sm text-muted mb-6">마이페이지를 이용하려면 로그인해 주세요.</p>
        <Link
          href="/login"
          className="inline-block px-8 py-3 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold"
        >
          로그인하기
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-black text-foreground">마이페이지</h1>
        <p className="text-xs text-muted mt-1">{user?.nickname}님 환영합니다</p>
      </div>

      <div className="px-4 mb-4">
        <div className="flex gap-2">
          <TabButton label="프로필 관리" active={tab === "profile"} onClick={() => setTab("profile")} />
          <TabButton label="주문 내역" active={tab === "orders"} onClick={() => setTab("orders")} />
        </div>
      </div>

      {tab === "profile" && (
        <div className="px-4 pb-8">
          <div className="bg-white rounded-2xl border border-card-border p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">닉네임</label>
              <input
                type="text"
                value={user?.nickname || ""}
                disabled
                className="w-full px-4 py-3 rounded-xl bg-gray-100 text-sm text-muted"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="실명을 입력하세요"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-card-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">휴대폰번호</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-1234-5678"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-card-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">기본 배송지</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="기본 배송지를 입력하세요"
                rows={2}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-card-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              className="w-full py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-primary to-secondary text-white active:scale-[0.98] transition-transform"
            >
              {saved ? "저장 완료!" : "프로필 저장"}
            </button>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="px-4 pb-8">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-sm text-muted">주문 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${
        active
          ? "bg-primary text-white"
          : "bg-gray-100 text-muted"
      }`}
    >
      {label}
    </button>
  );
}

function OrderCard({ order }: { order: Order }) {
  const statusColor: Record<Order["status"], string> = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-blue-100 text-blue-700",
    shipping: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
  };

  const date = new Date(order.createdAt);
  const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;

  return (
    <div className="bg-white rounded-2xl border border-card-border p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{order.productImage}</span>
          <div>
            <p className="text-sm font-bold text-foreground">{order.productName}</p>
            <p className="text-xs text-muted">{order.quantity}개 · {order.totalPrice.toLocaleString()}원</p>
          </div>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor[order.status]}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>
      <div className="text-xs text-muted space-y-0.5 border-t border-card-border pt-2">
        <p>주문번호: {order.id}</p>
        <p>주문일: {dateStr}</p>
        <p>수령인: {order.buyerName} ({order.buyerPhone})</p>
        <p>배송지: {order.address}</p>
      </div>
    </div>
  );
}
