"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { addOrder } from "@/lib/order-store";
import { Product } from "@/data/products";

type Step = "choose" | "form" | "confirm" | "done";

const BANK_INFO = {
  bank: "국민은행",
  account: "123-456-789012",
  holder: "모란도란",
};

export default function PurchaseFlow({
  product,
  open,
  onClose,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  const { user, isLoggedIn } = useAuth();
  const [step, setStep] = useState<Step>("choose");
  const [isMember, setIsMember] = useState(false);
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [orderId, setOrderId] = useState("");

  if (!open) return null;

  const totalPrice = product.price * qty;

  const chooseMember = (member: boolean) => {
    setIsMember(member);
    if (member && isLoggedIn && user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
    } else {
      setName("");
      setPhone("");
      setAddress("");
    }
    setStep("form");
  };

  const canSubmit = name.trim() && phone.trim() && address.trim() && qty >= 1;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setStep("confirm");
  };

  const handleConfirm = () => {
    const order = addOrder({
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      unitPrice: product.price,
      quantity: qty,
      totalPrice,
      buyerName: name,
      buyerPhone: phone,
      address,
      isMember,
    });
    setOrderId(order.id);
    setStep("done");
  };

  const handleClose = () => {
    setStep("choose");
    setQty(1);
    setName("");
    setPhone("");
    setAddress("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative w-full max-w-md bg-white rounded-t-3xl p-6 pb-24 max-h-[85vh] overflow-y-auto animate-slide-up">
        {step === "choose" && (
          <>
            <h2 className="text-lg font-black text-foreground mb-1">구매 방법 선택</h2>
            <p className="text-xs text-muted mb-6">{product.name}</p>
            <button
              onClick={() => chooseMember(true)}
              className="w-full py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-primary to-secondary text-white mb-3 active:scale-[0.98] transition-transform"
            >
              회원 구매
            </button>
            <button
              onClick={() => chooseMember(false)}
              className="w-full py-4 rounded-2xl text-base font-bold bg-gray-100 text-foreground active:scale-[0.98] transition-transform"
            >
              비회원 구매
            </button>
          </>
        )}

        {step === "form" && (
          <>
            <h2 className="text-lg font-black text-foreground mb-4">
              주문 정보 입력
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted block mb-1">수량</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-10 rounded-xl bg-gray-100 text-lg font-bold flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-lg font-bold w-8 text-center">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(10, qty + 1))}
                    className="w-10 h-10 rounded-xl bg-gray-100 text-lg font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              <InputField label="이름 *" value={name} onChange={setName} placeholder="홍길동" />
              <InputField label="휴대폰번호 *" value={phone} onChange={setPhone} placeholder="010-1234-5678" type="tel" />
              <div>
                <label className="text-xs font-semibold text-muted block mb-1">배송지 *</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="서울시 강남구 테헤란로 123 모란빌딩 101호"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-card-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-card-border">
                <span className="text-sm text-muted">총 금액</span>
                <span className="text-xl font-black text-foreground">
                  {totalPrice.toLocaleString()}원
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep("choose")}
                className="flex-1 py-3 rounded-2xl text-sm font-bold bg-gray-100 text-foreground"
              >
                이전
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all ${
                  canSubmit
                    ? "bg-gradient-to-r from-primary to-secondary active:scale-[0.98]"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                구매하기
              </button>
            </div>
          </>
        )}

        {step === "confirm" && (
          <>
            <h2 className="text-lg font-black text-foreground mb-4">계좌이체 정보</h2>
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-5 space-y-3 mb-4">
              <InfoRow label="은행" value={BANK_INFO.bank} />
              <InfoRow label="계좌번호" value={BANK_INFO.account} bold />
              <InfoRow label="예금주" value={BANK_INFO.holder} />
              <div className="border-t border-card-border pt-3">
                <InfoRow label="입금액" value={`${totalPrice.toLocaleString()}원`} bold />
              </div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3 mb-6">
              <p className="text-xs text-yellow-700 leading-relaxed">
                위 계좌로 입금해 주시면 확인 후 배송이 시작됩니다.
                입금자명을 주문자명과 동일하게 해 주세요.
              </p>
            </div>
            <div className="space-y-2 text-sm text-muted mb-6">
              <p>상품: {product.name} x {qty}개</p>
              <p>수령인: {name} ({phone})</p>
              <p>배송지: {address}</p>
            </div>
            <button
              onClick={handleConfirm}
              className="w-full py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-primary to-secondary text-white active:scale-[0.98] transition-transform"
            >
              주문 완료
            </button>
          </>
        )}

        {step === "done" && (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-lg font-black text-foreground mb-2">주문이 완료되었습니다!</h2>
            <p className="text-sm text-muted mb-1">주문번호: {orderId}</p>
            <p className="text-xs text-muted mb-6">
              마이페이지에서 주문 내역과 배송 상태를 확인할 수 있습니다.
            </p>
            <button
              onClick={handleClose}
              className="w-full py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-primary to-secondary text-white active:scale-[0.98] transition-transform"
            >
              확인
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-card-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}

function InfoRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-muted">{label}</span>
      <span className={`text-sm ${bold ? "font-black text-foreground" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}
