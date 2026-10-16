import { ShoppingBag, X, Plus, ArrowUpRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import BrandLogo from "./BrandLogo";

const FALLBACK_CATEGORIES = [
  { id: "new-in", name: "NEW IN", slug: "new-in" },
  { id: "tops", name: "TOPS", slug: "tops" },
  { id: "bottoms", name: "BOTTOMS", slug: "bottoms" },
  { id: "headgear", name: "HEADGEAR", slug: "headgear" },
  { id: "hoodies", name: "HOODIES & SWEATS", slug: "hoodies-sweats" },
  { id: "jackets", name: "JACKETS", slug: "jackets" },
  { id: "footwear", name: "FOOTWEAR", slug: "footwear" },
  { id: "accessories", name: "ACCESSORIES", slug: "accessories" },
  { id: "collectibles", name: "COLLECTIBLES", slug: "collectibles" },
  { id: "bags", name: "BAGS", slug: "bags" },
];

const MENU_ITEMS = [
  ["SHOP", "/shop"],
  ["DROPS", "/drops"],
  ["LOOKBOOK", "/lookbook"],
  ["WORLD", "/world"],
  ["ABOUT", "/about"],
  ["CONTACT", "/contact"],
  ["ACCOUNT", "/account"],
];

export default function Header({
  categories = [],
  cartCount = 0,
  navigate,
  loading = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const currentRoute =
    window.location.hash.replace(/^#/, "") || "/";
  const currentPath = currentRoute.split("?")[0];

  const activeCategory = useMemo(() => {
    const query = new URLSearchParams(
      currentRoute.split("?")[1] || ""
    );

    return (
      query.get("category") || ""
    ).toLowerCase();
  }, [currentRoute]);

  const displayCategories = useMemo(() => {
    const source = categories.length
      ? categories
      : loading
        ? []
        : FALLBACK_CATEGORIES;

    const seen = new Set();
    const result = [];

    source.forEach((category) => {
      if (!category) return;

      const name = String(
        category.name || ""
      ).trim();

      const slug = String(
        category.slug || ""
      ).trim();

      const normalized = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const isNewIn =
        normalized === "new-in" ||
        normalized === "new-ins" ||
        slug.toLowerCase() === "new-in" ||
        slug.toLowerCase() === "new-ins";

      const key = isNewIn
        ? "new-in"
        : slug.toLowerCase() ||
          normalized ||
          String(category.id);

      if (seen.has(key)) return;

      seen.add(key);

      result.push({
        ...category,
        id: category.id || key,
        name: isNewIn ? "NEW IN" : name,
        slug: isNewIn
          ? "new-in"
          : slug || normalized,
      });
    });

    return result;
  }, [categories, loading]);

  const goTo = (path) => {
    setMenuOpen(false);

    if (typeof navigate === "function") {
      navigate(path);
    } else {
      window.location.hash = `#${path}`;
    }
  };

  const handleCategory = (category) => {
    if (
      !category?.slug ||
      category.slug === "new-in"
    ) {
      goTo("/shop");
      return;
    }

    goTo(
      `/shop?category=${encodeURIComponent(
        category.slug
      )}`
    );
  };

  useEffect(() => {
    document.body.style.overflow = menuOpen
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="store-header">
        <button
          type="button"
          className={`store-menu ${
            menuOpen ? "is-open" : ""
          }`}
          onClick={() =>
            setMenuOpen((value) => !value)
          }
          aria-label={
            menuOpen
              ? "Close menu"
              : "Open menu"
          }
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <X
              size={21}
              strokeWidth={1.5}
            />
          ) : (
            <Plus
              size={21}
              strokeWidth={1.5}
            />
          )}
        </button>

        <BrandLogo navigate={goTo} />

        <button
          type="button"
          className="store-bag"
          onClick={() => goTo("/cart")}
          aria-label="Cart"
        >
          <ShoppingBag
            size={21}
            strokeWidth={1.5}
          />

          {cartCount > 0 && (
            <span>
              {cartCount > 99
                ? "99+"
                : cartCount}
            </span>
          )}
        </button>

        <nav
          className="category-nav"
          aria-label="Shop categories"
        >
          {loading ? (
            <div
              className="category-nav-skeleton"
              aria-hidden="true"
            >
              {Array.from({
                length: 7,
              }).map((_, index) => (
                <span key={index} />
              ))}
            </div>
          ) : (
            displayCategories.map(
              (category) => {
                const isNewIn =
                  category.slug ===
                  "new-in";

                const isActive = isNewIn
                  ? currentPath ===
                      "/shop" &&
                    !activeCategory
                  : activeCategory ===
                    String(
                      category.slug
                    ).toLowerCase();

                return (
                  <button
                    type="button"
                    key={category.id}
                    className={
                      isActive
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      handleCategory(
                        category
                      )
                    }
                  >
                    {category.name}
                  </button>
                );
              }
            )
          )}
        </nav>
      </header>

      {menuOpen && (
        <div className="store-menu-overlay">
          <div className="store-menu-top">
            <button
              type="button"
              className="store-menu-logo"
              onClick={() =>
                goTo("/")
              }
              aria-label="PNCHE Studios home"
            >
              <img
                src="/pnche.png"
                alt="PNCHE Studios"
              />
            </button>

            <button
              type="button"
              className="store-menu-close"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              <span>CLOSE</span>
              <X
                size={22}
                strokeWidth={1.5}
              />
            </button>
          </div>

          <div className="store-menu-content">
            <section className="store-menu-main">
              <span className="store-menu-label">
                MENU
              </span>

              <div className="store-menu-links">
                {MENU_ITEMS.map(
                  ([label, path]) => (
                    <button
                      type="button"
                      key={label}
                      onClick={() =>
                        goTo(path)
                      }
                    >
                      <span>
                        {label}
                      </span>

                      <ArrowUpRight
                        size={28}
                        strokeWidth={1.3}
                      />
                    </button>
                  )
                )}
              </div>
            </section>

            <aside className="store-menu-categories">
              <span className="store-menu-label">
                SHOP BY CATEGORY
              </span>

              <div className="store-menu-category-list">
                {displayCategories.map(
                  (category) => (
                    <button
                      type="button"
                      key={category.id}
                      onClick={() =>
                        handleCategory(
                          category
                        )
                      }
                    >
                      <span>
                        {category.name}
                      </span>

                      <ArrowUpRight
                        size={18}
                        strokeWidth={1.4}
                      />
                    </button>
                  )
                )}
              </div>
            </aside>
          </div>
        </div>
      )}
    </>
  );
}