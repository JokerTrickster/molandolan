"use client";

import { useState } from "react";
import PurchaseFlow from "./PurchaseFlow";
import { Product } from "@/data/products";

export default function PurchaseButton({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        disabled={!product.inStock}
        onClick={() => setOpen(true)}
        className={`w-full py-4 rounded-2xl text-base font-bold transition-all ${
          product.inStock
            ? "bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 active:scale-[0.98]"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        {product.inStock ? "구매하기" : "품절"}
      </button>
      <PurchaseFlow product={product} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
