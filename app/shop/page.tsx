import { productsData } from "@/data/products";
import ProductCard from "@/components/shop/ProductCard";

export default function ShopPage() {
  return (
    <div>
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-black text-foreground">굿즈판매</h1>
        <p className="text-xs text-muted mt-1">모란도란 공식 굿즈를 만나보세요</p>
      </div>

      <div className="px-4 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {productsData.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
