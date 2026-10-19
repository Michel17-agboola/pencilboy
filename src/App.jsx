import { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Drops from "./pages/Drops";
import Lookbook from "./pages/Lookbook";
import World from "./pages/World";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Search from "./pages/Search";
import Product from "./pages/Product";
import Bag from "./pages/Bag";
import Account from "./pages/Account";
import SignIn from "./pages/SignIn";
import Checkout from "./pages/Checkout";
import Policy from "./pages/Policy";
import Admin from "./pages/Admin";
import { supabase } from "./lib/supabase";
import {
  trackVisitor,
  trackCartAdd,
  saveProductLike,
  removeProductLike,
} from "./lib/storeTracking";
import {
  FALLBACK_PRODUCTS,
  FALLBACK_DROPS,
  FALLBACK_STORIES,
  FALLBACK_LOOKBOOK,
} from "./data/fallback";

const FALLBACK_CATEGORIES = [
  { id: "new-in", name: "NEW IN", slug: "new-in" },
  { id: "tees", name: "TEES", slug: "tees" },
  { id: "shorts", name: "SHORTS", slug: "shorts" },
  {
    id: "hoodies",
    name: "HOODIES & SWEATERS",
    slug: "hoodies",
  },
  { id: "pants", name: "PANTS", slug: "pants" },
  { id: "jackets", name: "JACKETS", slug: "jackets" },
  {
    id: "knitwear",
    name: "KNITWEAR",
    slug: "knitwear",
  },
  {
    id: "accessories",
    name: "ACCESSORIES",
    slug: "accessories",
  },
];

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function readStorage(key, fallback = []) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function useHashRoute() {
  const getRoute = () =>
    window.location.hash.replace(/^#/, "") || "/";

  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const update = () => setRoute(getRoute());

    window.addEventListener("hashchange", update);

    return () =>
      window.removeEventListener(
        "hashchange",
        update
      );
  }, []);

  const navigate = (path) => {
    if (window.location.hash === `#${path}`) {
      window.scrollTo({
        top: 0,
        behavior: "auto",
      });

      return;
    }

    window.location.hash = path;

    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  };

  return [route, navigate];
}

export default function App() {
  const [route, navigate] = useHashRoute();

  const baseRoute = route.split("?")[0];

  const [products, setProducts] = useState(
    FALLBACK_PRODUCTS
  );

  const [categories, setCategories] = useState(
    FALLBACK_CATEGORIES
  );

  const [drops, setDrops] = useState(
    FALLBACK_DROPS
  );

  const [stories, setStories] = useState(
    FALLBACK_STORIES
  );

  const [lookbook, setLookbook] = useState(
    FALLBACK_LOOKBOOK
  );

  const [cart, setCart] = useState(() =>
    readStorage("pencilboy_cart", [])
  );

  const [saved, setSaved] = useState(() =>
    readStorage("pencilboy_saved", [])
  );

  const [user, setUser] = useState(null);

  /*
   * -------------------------------------------------------
   * VISITOR TRACKING
   * -------------------------------------------------------
   */

  useEffect(() => {
    if (baseRoute === "/admin") {
      return;
    }

    trackVisitor();
  }, []);

  /*
   * -------------------------------------------------------
   * LOCAL CART STORAGE
   * -------------------------------------------------------
   */

  useEffect(() => {
    localStorage.setItem(
      "pencilboy_cart",
      JSON.stringify(cart)
    );
  }, [cart]);

  /*
   * -------------------------------------------------------
   * LOCAL SAVED STATE
   * -------------------------------------------------------
   *
   * This remains temporarily while the persistent
   * Supabase Likes system is being completed.
   */

  useEffect(() => {
    localStorage.setItem(
      "pencilboy_saved",
      JSON.stringify(saved)
    );
  }, [saved]);

  /*
   * -------------------------------------------------------
   * LOAD STORE
   * -------------------------------------------------------
   */

  useEffect(() => {
    let subscription;

    async function loadStore() {
      try {
        const authResult =
          await supabase.auth.getUser();

        if (!authResult.error) {
          setUser(
            authResult.data?.user || null
          );
        }

        const [p, c] = await Promise.all([
          supabase
            .from("products")
            .select("*")
            .eq("status", "PUBLISHED")
            .order("sort_order", {
              ascending: true,
            }),

          supabase
            .from("categories")
            .select("*")
            .eq("status", "PUBLISHED")
            .order("sort_order", {
              ascending: true,
            }),
        ]);

        if (p.data?.length) {
          setProducts(p.data);
        }

        if (c.data?.length) {
          setCategories(c.data);
        }

        if (p.error) {
          console.warn(
            "PENCILBOY products query:",
            p.error.message
          );
        }

        if (c.error) {
          console.warn(
            "PENCILBOY categories query:",
            c.error.message
          );
        }

        const authListener =
          supabase.auth.onAuthStateChange(
            (_event, session) => {
              setUser(
                session?.user || null
              );
            }
          );

        subscription =
          authListener.data.subscription;
      } catch (error) {
        console.warn(
          "PENCILBOY: Supabase unavailable. Using fallback data.",
          error
        );
      }
    }

    loadStore();

    return () =>
      subscription?.unsubscribe();
  }, []);

  /*
   * -------------------------------------------------------
   * OPEN PRODUCT
   * -------------------------------------------------------
   */

  const openProduct = (product) => {
    if (!product) {
      return;
    }

    const productSlug =
      product.slug ||
      slugify(product.name);

    if (!productSlug) {
      return;
    }

    navigate(
      `/product/${encodeURIComponent(
        productSlug
      )}`
    );
  };

  /*
   * -------------------------------------------------------
   * SAVE / LIKE
   * -------------------------------------------------------
   *
   * Persistent Supabase Likes will replace this local
   * behaviour in the next step.
   */

  const onSave = async (id) => {
    if (!id) {
      return;
    }
  
    const isCurrentlySaved =
      saved.includes(id);
  
    /*
     * Update the UI immediately so the heart
     * feels instant.
     */
    setSaved((current) =>
      isCurrentlySaved
        ? current.filter(
            (item) => item !== id
          )
        : [...current, id]
    );
  
    /*
     * Persist the like in Supabase.
     */
    if (isCurrentlySaved) {
      const success =
        await removeProductLike(id);
  
      /*
       * If Supabase failed, restore the
       * previous UI state.
       */
      if (!success) {
        setSaved((current) =>
          current.includes(id)
            ? current
            : [...current, id]
        );
      }
    } else {
      const success =
        await saveProductLike(id);
  
      /*
       * If Supabase failed, restore the
       * previous UI state.
       */
      if (!success) {
        setSaved((current) =>
          current.filter(
            (item) => item !== id
          )
        );
      }
    }
  };
  /*
   * -------------------------------------------------------
   * ADD TO CART
   * -------------------------------------------------------
   */

  const addToBag = (
    product,
    size,
    qty
  ) => {
    setCart((current) => {
      const existingIndex =
        current.findIndex(
          (item) =>
            item.id === product.id &&
            item.size === size
        );

      if (existingIndex >= 0) {
        return current.map(
          (item, index) =>
            index === existingIndex
              ? {
                  ...item,
                  qty:
                    item.qty +
                    qty,
                }
              : item
        );
      }

      return [
        ...current,
        {
          ...product,
          size,
          qty,
        },
      ];
    });

    /*
     * Record cart addition in Supabase.
     *
     * Tracking is non-blocking.
     */
    trackCartAdd(
      product?.id,
      qty
    );

    navigate("/bag");
  };

  /*
   * -------------------------------------------------------
   * SELECTED PRODUCT
   * -------------------------------------------------------
   *
   * Product URLs can come from:
   *
   *   /product/product-slug
   *
   * We resolve products using several safe identifiers:
   *
   * 1. Exact slug
   * 2. Normalised slug
   * 3. Slug generated from product name
   * 4. Product ID
   *
   * This prevents valid products from falling through
   * to the Home page.
   */

  const productRouteSlug =
    route.startsWith("/product/")
      ? route
          .slice("/product/".length)
          .split("?")[0]
      : "";

  let decodedProductSlug = "";

  try {
    decodedProductSlug = decodeURIComponent(
      productRouteSlug
    );
  } catch {
    decodedProductSlug = productRouteSlug;
  }

  const normalizedProductSlug =
    decodedProductSlug
      .toLowerCase()
      .trim();

  const selectedProduct =
    normalizedProductSlug
      ? products.find((product) => {
          const exactSlug = String(
            product.slug || ""
          )
            .toLowerCase()
            .trim();

          const generatedSlug = slugify(
            product.name
          );

          const productId = String(
            product.id || ""
          )
            .toLowerCase()
            .trim();

          return (
            exactSlug ===
              normalizedProductSlug ||
            generatedSlug ===
              normalizedProductSlug ||
            productId ===
              normalizedProductSlug
          );
        })
      : null;

  let page;

  switch (baseRoute) {
    case "/":
      page = (
        <Home navigate={navigate} />
      );
      break;

    case "/shop":
      page = (
        <Shop
          products={products}
          categories={categories}
          onOpen={openProduct}
          onSave={onSave}
          saved={saved}
        />
      );
      break;

    case "/drops":
      page = (
        <Drops
          products={products}
          drops={drops}
          onOpen={openProduct}
          onSave={onSave}
          saved={saved}
        />
      );
      break;

    case "/lookbook":
      page = (
        <Lookbook
          entries={lookbook}
        />
      );
      break;

    case "/world":
      page = (
        <World
          stories={stories}
        />
      );
      break;

    case "/about":
      page = <About />;
      break;

    case "/contact":
      page = <Contact />;
      break;

    case "/search":
      page = (
        <Search
          products={products}
          onOpen={openProduct}
          onSave={onSave}
          saved={saved}
        />
      );
      break;

    case "/bag":
      page = (
        <Bag
          cart={cart}
          setCart={setCart}
          navigate={navigate}
        />
      );
      break;

    case "/checkout":
      page = (
        <Checkout
          cart={cart}
          user={user}
          navigate={navigate}
          clearCart={() =>
            setCart([])
          }
        />
      );
      break;

    case "/account":
      page = (
        <Account
          user={user}
          navigate={navigate}
          onSignOut={async () => {
            await supabase.auth.signOut();
            navigate("/");
          }}
        />
      );
      break;

    case "/signin":
      page = (
        <SignIn
          navigate={navigate}
        />
      );
      break;

    case "/admin":
      page = (
        <Admin
          user={user}
          navigate={navigate}
        />
      );
      break;

    case "/terms":
    case "/privacy":
    case "/returns":
      page = (
        <Policy
          type={baseRoute.slice(1)}
        />
      );
      break;

    default:
      /*
       * IMPORTANT:
       *
       * Previously, any product that could not be resolved
       * was silently sent to Home.
       *
       * Now we only show the product page when the product
       * actually exists.
       *
       * If the route is a product route but the product
       * cannot be found, we show a proper not-found state
       * instead of pretending the user requested Home.
       */

      if (
        baseRoute.startsWith(
          "/product/"
        )
      ) {
        page = selectedProduct ? (
          <Product
            product={selectedProduct}
            onBack={() =>
              navigate("/shop")
            }
            addToBag={addToBag}
          />
        ) : (
          <section
            className="empty-block"
            style={{
              minHeight:
                "60vh",
              padding:
                "80px 20px",
            }}
          >
            <span className="eyebrow">
              PENCILBOY
            </span>

            <h2
              style={{
                margin:
                  "16px 0",
              }}
            >
              PRODUCT NOT FOUND
            </h2>

            <p>
              This product is
              no longer
              available.
            </p>

            <button
              type="button"
              className="landing-enter"
              style={{
                color: "#111",
                borderBottom:
                  "1px solid #111",
                marginTop:
                  "24px",
              }}
              onClick={() =>
                navigate("/shop")
              }
            >
              BACK TO SHOP
            </button>
          </section>
        );
      } else {
        page = (
          <Home
            navigate={navigate}
          />
        );
      }

      break;
  }

  const isLandingPage =
    baseRoute === "/";

  const isAdminPage =
    baseRoute === "/admin";

  return (
    <>
      {!isLandingPage &&
        !isAdminPage && (
          <Header
            cartCount={cart.reduce(
              (sum, item) =>
                sum +
                Number(
                  item.qty || 0
                ),
              0
            )}
            navigate={navigate}
            categories={categories}
          />
        )}

      {page}

      {!isLandingPage &&
        !isAdminPage && (
          <Footer />
        )}
    </>
  );
}