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
  const [category, setCategory] =
    useState("");

  useEffect(() => {
    const readCategory = () => {
      const hash =
        window.location.hash.replace(
          /^#/,
          ""
        );

      const params =
        new URLSearchParams(
          hash.split("?")[1] || ""
        );

      setCategory(
        (
          params.get("category") ||
          ""
        ).toLowerCase()
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
    /*
     * /shop without ?category=
     * is NEW IN.
     */
    if (!category) {
      return products.filter(
        (product) =>
          product.new_in === true
      );
    }

    const categoryRecord =
      categories.find(
        (item) =>
          String(
            item.slug || ""
          ).toLowerCase() ===
          category
      );

    return products.filter(
      (product) => {
        /*
         * Main method:
         * product.category_id
         * matches category.id.
         */
        if (
          categoryRecord &&
          product.category_id
        ) {
          return (
            String(
              product.category_id
            ) ===
            String(
              categoryRecord.id
            )
          );
        }

        /*
         * Fallback if a product already
         * contains category_slug.
         */
        const productCategorySlug =
          String(
            product.category_slug ||
              ""
          ).toLowerCase();

        if (
          productCategorySlug
        ) {
          return (
            productCategorySlug ===
            category
          );
        }

        /*
         * Older fallback using category name.
         */
        const productCategoryName =
          String(
            product.category || ""
          ).toLowerCase();

        if (
          productCategoryName
        ) {
          return categories.some(
            (item) =>
              String(
                item.slug || ""
              ).toLowerCase() ===
                category &&
              String(
                item.name || ""
              ).toLowerCase() ===
                productCategoryName
          );
        }

        return false;
      }
    );
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