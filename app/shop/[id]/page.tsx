import { productsData } from "@/data/products";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return productsData.map((item) => ({ id: item.id }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = productsData.find((item) => item.id === id);

  if (!product) {
    notFound();
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div>
      <div className="px-4 pt-4 pb-2">
        <Link
          href="/shop"
          className="inline-flex items-center text-sm text-primary font-medium"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          굿즈 목록
        </Link>
      </div>

      <div className="px-4 pb-8">
        <div className="w-full aspect-square bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl flex items-center justify-center text-8xl relative">
          {product.image}
          {product.badge && (
            <span className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full text-white ${
              product.badge === "SALE" ? "bg-red-500" :
              product.badge === "NEW" ? "bg-green-500" :
              product.badge === "BEST" ? "bg-primary" :
              "bg-secondary"
            }`}>
              {product.badge}
            </span>
          )}
        </div>

        <div className="mt-4">
          <span className="text-[10px] font-semibold text-muted bg-gray-100 px-2 py-0.5 rounded-full">
            {product.category}
          </span>
          <h1 className="text-xl font-black text-foreground mt-2">{product.name}</h1>

          <div className="flex items-baseline gap-2 mt-3">
            {discount > 0 && (
              <span className="text-lg font-black text-red-500">{discount}%</span>
            )}
            <span className="text-2xl font-black text-foreground">
              {product.price.toLocaleString()}원
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted line-through">
                {product.originalPrice.toLocaleString()}원
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 border-t border-card-border pt-6">
          <h2 className="text-sm font-bold text-foreground mb-2">상품 설명</h2>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-8 sticky bottom-20">
          <button
            disabled={!product.inStock}
            className={`w-full py-4 rounded-2xl text-base font-bold transition-all ${
              product.inStock
                ? "bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 active:scale-[0.98]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {product.inStock ? "구매하기" : "품절"}
          </button>
        </div>
      </div>
    </div>
  );
}
