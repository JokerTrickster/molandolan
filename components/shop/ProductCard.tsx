import Link from "next/link";
import { Product } from "@/data/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/shop/${product.id}`} className="block">
      <article className="bg-card-bg rounded-2xl border border-card-border overflow-hidden hover:shadow-md transition-shadow active:scale-[0.98] transition-transform">
        <div className="aspect-square bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center text-5xl relative">
          {product.image}
          {product.badge && (
            <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
              product.badge === "SALE" ? "bg-red-500" :
              product.badge === "NEW" ? "bg-green-500" :
              product.badge === "BEST" ? "bg-primary" :
              "bg-secondary"
            }`}>
              {product.badge}
            </span>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-bold text-sm bg-black/60 px-3 py-1 rounded-full">
                품절
              </span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-bold text-foreground line-clamp-1">{product.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-base font-bold text-primary">
              {product.price.toLocaleString()}원
            </span>
            {product.originalPrice && (
              <span className="text-xs text-muted line-through">
                {product.originalPrice.toLocaleString()}원
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
