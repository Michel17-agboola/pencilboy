import { useEffect, useMemo, useState } from "react";
import ProductGrid from "../components/ProductGrid";

export default function Shop({
  products,
  categories = [],
  onOpen,
  onSave,
  saved,
  loading = false,
}) {
  const [category, setCategory] = useState("");

  useEffect(() => {
    const readCategory = () => {
      const hash = window.location.hash.replace(
        /^#/,
        ""
      );

      const params = new URLSearchParams(
        hash.split("?")[1] || ""
      );

      setCategory(
        (params.get("category") || "").toLowerCase()
      );
    };

    readCategory();

    window.addEventListener(
      "hashchange",
      readCategory
    );

    return () => {
      window.removeEventListener(
        "hashchange",
        readCategory
      );
    };
  }, []);

  const visible = useMemo(() => {
    if (!category) return products;

    return products.filter((product) => {
      const productCategory = String(
        product.category_slug || ""
      ).toLowerCase();

      if (productCategory) {
        return productCategory === category;
      }

      const categoryRecord = categories.find(
        (item) =>
          item.name?.toLowerCase() ===
          String(product.category || "").toLowerCase()
      );

      return (
        categoryRecord?.slug?.toLowerCase() ===
        category
      );
    });
  }, [
    products,
    categories,
    category,
  ]);

  return (
    <section className="shop-page">
      <ProductGrid
        products={visible}
        onOpen={onOpen}
        onSave={onSave}
        saved={saved}
        loading={loading}
      />
    </section>
  );
}