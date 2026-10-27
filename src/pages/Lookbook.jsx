import { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Heart,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { toPng } from "html-to-image";
import { supabase } from "../lib/supabase";
import "./Lookbook.css";
import { formatNaira } from "../lib/format";

/* =========================================================
   HELPERS
   ========================================================= */

function makeId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}


function getImage(product) {
  const images = product?.images;

  if (Array.isArray(images)) {
    const first = images.find(Boolean);

    if (typeof first === "string") {
      return first;
    }

    if (first?.url) {
      return first.url;
    }
  }

  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);

      if (Array.isArray(parsed)) {
        const first = parsed.find(Boolean);

        if (typeof first === "string") {
          return first;
        }

        if (first?.url) {
          return first.url;
        }
      }
    } catch {
      if (images.trim()) {
        return images.trim();
      }
    }
  }

  return "";
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getCategoryForProduct(product, categories) {
  if (!product) {
    return null;
  }

  const byId = categories.find(
    category =>
      String(category.id) ===
      String(product.category_id)
  );

  if (byId) {
    return byId;
  }

  const productCategory = normalize(
    product.category_slug ||
      product.category ||
      ""
  );

  if (!productCategory) {
    return null;
  }

  return (
    categories.find(category => {
      const categorySlug = normalize(category.slug);
      const categoryName = normalize(category.name);

      return (
        categorySlug === productCategory ||
        categoryName === productCategory
      );
    }) || null
  );
}

/*
  These are NOT the Studio categories.

  They only tell the canvas roughly where a product
  should sit when the user adds it.

  Your actual category tabs still come directly
  from Supabase.
*/
function getCanvasSlot(product, category) {
  const value = [
    product?.name,
    product?.category,
    product?.category_slug,
    category?.name,
    category?.slug,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    /shoe|sneaker|trainer|boot|loafer|sandal|footwear/.test(
      value
    )
  ) {
    return "shoes";
  }

  if (
    /jean|pant|trouser|short|skirt|bottom|cargo|jogger/.test(
      value
    )
  ) {
    return "bottoms";
  }

  if (
    /accessor|cap|hat|beanie|bag|glass|watch|chain|necklace|earring|bracelet|ring|belt|collectible/.test(
      value
    )
  ) {
    return "accessories";
  }

  return "tops";
}

function makeCanvasItem(
  product,
  slot,
  index = 0
) {
  const positions = {
    tops: {
      x: 50,
      y: 30,
    },

    bottoms: {
      x: 50,
      y: 52,
    },

    shoes: {
      x: 50,
      y: 76,
    },

    accessories: {
      x: 78,
      y: 22,
    },
  };

  const widths = {
    tops: 190,
    bottoms: 175,
    shoes: 145,
    accessories: 115,
  };

  const base =
    positions[slot] || positions.tops;

  const offset =
    (index % 4) * 5;

  return {
    id: makeId(),

    productId: product.id,

    name: product.name,

    slug: product.slug,

    image: getImage(product),

    price: Number(product.price || 0),

    slot,

    x: Math.min(
      82,
      Math.max(
        18,
        base.x + offset
      )
    ),

    y: Math.min(
      82,
      Math.max(
        14,
        base.y + offset
      )
    ),

    width:
      widths[slot] || 150,

    rotation:
      slot === "accessories"
        ? index % 2
          ? 5
          : -5
        : 0,

    z: index + 1,
  };
}

/* =========================================================
   COMPONENT
   ========================================================= */

export default function Lookbook() {
  const canvasRef = useRef(null);

  const [products, setProducts] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [activeTab, setActiveTab] =
    useState("all");

  const [items, setItems] =
    useState([]);

  const [selectedId, setSelectedId] =
    useState(null);

  const [dragging, setDragging] =
    useState(null);

  const [savingImage, setSavingImage] =
    useState(false);

  const [message, setMessage] =
    useState("");

  /* =======================================================
     LOAD PRODUCTS + CATEGORIES
     ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadStudioData() {
      const [
        productsResult,
        categoriesResult,
      ] = await Promise.all([
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

      if (cancelled) {
        return;
      }

      if (!productsResult.error) {
        setProducts(
          productsResult.data || []
        );
      } else {
        console.warn(
          "PNCHE STUDIIOS products:",
          productsResult.error.message
        );
      }

      if (!categoriesResult.error) {
        setCategories(
          categoriesResult.data || []
        );
      } else {
        console.warn(
          "PNCHE STUDIIOS categories:",
          categoriesResult.error.message
        );
      }
    }

    loadStudioData();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     PREPARE PRODUCTS

     IMPORTANT:
     We DO NOT remove products simply because
     they don't have an image.

     This means the Studio can show the full
     published catalogue.
     ======================================================= */

  const studioProducts = useMemo(() => {
    return products.map(product => {
      const category =
        getCategoryForProduct(
          product,
          categories
        );

      return {
        ...product,

        studioCategoryId:
          category?.id || null,

        studioCategoryName:
          category?.name ||
          product.category ||
          "Uncategorised",

        studioSlot:
          getCanvasSlot(
            product,
            category
          ),

        studioImage:
          getImage(product),
      };
    });
  }, [products, categories]);

  /* =======================================================
     DYNAMIC CATEGORY TABS

     ALL
     +
     EVERY PUBLISHED CATEGORY FROM SUPABASE
     ======================================================= */

  const categoryTabs = useMemo(() => {
    const tabs = [
      {
        id: "all",
        label: "ALL",
      },
    ];

    categories.forEach(category => {
      if (!category?.id) {
        return;
      }

      tabs.push({
        id: `category-${category.id}`,
        categoryId: category.id,
        label: String(
          category.name || "CATEGORY"
        ).toUpperCase(),
      });
    });

    return tabs;
  }, [categories]);

  /* =======================================================
     VISIBLE PRODUCTS
     ======================================================= */

  const visibleProducts = useMemo(() => {
    if (activeTab === "all") {
      return studioProducts;
    }

    const selectedTab =
      categoryTabs.find(
        tab => tab.id === activeTab
      );

    if (!selectedTab?.categoryId) {
      return [];
    }

    return studioProducts.filter(
      product =>
        String(
          product.studioCategoryId
        ) ===
        String(
          selectedTab.categoryId
        )
    );
  }, [
    activeTab,
    categoryTabs,
    studioProducts,
  ]);

  /* =======================================================
     CURRENT TAB
     ======================================================= */

  const activeCategoryName =
    useMemo(() => {
      if (activeTab === "all") {
        return "ALL";
      }

      const tab =
        categoryTabs.find(
          item =>
            item.id === activeTab
        );

      return tab?.label || "CATEGORY";
    }, [
      activeTab,
      categoryTabs,
    ]);

  /* =======================================================
     TOTAL PRICE
     ======================================================= */

  const lookTotal = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total +
        Number(item.price || 0),
      0
    );
  }, [items]);

  /* =======================================================
     ADD PRODUCT
     ======================================================= */

  const addProduct = product => {
    if (!product?.studioImage) {
      setMessage(
        `${product.name} needs an image before it can be added`
      );

      window.setTimeout(
        () => setMessage(""),
        2200
      );

      return;
    }

    const slot =
      product.studioSlot || "tops";

    const sameSlotCount =
      items.filter(
        item =>
          item.slot === slot
      ).length;

    const item =
      makeCanvasItem(
        product,
        slot,
        sameSlotCount
      );

    setItems(current => [
      ...current,
      item,
    ]);

    setSelectedId(item.id);

    setMessage(
      `${product.name} added to your look`
    );

    window.setTimeout(
      () => setMessage(""),
      1600
    );
  };

  /* =======================================================
     REMOVE
     ======================================================= */

  const removeItem = id => {
    setItems(current =>
      current.filter(
        item => item.id !== id
      )
    );

    setSelectedId(current =>
      current === id
        ? null
        : current
    );
  };

  /* =======================================================
     CLEAR
     ======================================================= */

  const clearCanvas = () => {
    setItems([]);

    setSelectedId(null);

    setMessage(
      "Canvas cleared"
    );

    window.setTimeout(
      () => setMessage(""),
      1400
    );
  };

  /* =======================================================
     ROTATE
     ======================================================= */

  const rotateSelected = amount => {
    if (!selectedId) {
      return;
    }

    setItems(current =>
      current.map(item =>
        item.id === selectedId
          ? {
              ...item,
              rotation:
                item.rotation +
                amount,
            }
          : item
      )
    );
  };

  /* =======================================================
     RESIZE
     ======================================================= */

  const resizeSelected = amount => {
    if (!selectedId) {
      return;
    }

    setItems(current =>
      current.map(item =>
        item.id === selectedId
          ? {
              ...item,
              width: Math.min(
                330,
                Math.max(
                  70,
                  item.width +
                    amount
                )
              ),
            }
          : item
      )
    );
  };

  /* =======================================================
     DRAG ITEM ON CANVAS
     ======================================================= */

  const startCanvasDrag = (
    event,
    item
  ) => {
    if (
      event.target.closest(
        "button"
      )
    ) {
      return;
    }

    const rect =
      canvasRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const left =
      (item.x / 100) *
      rect.width;

    const top =
      (item.y / 100) *
      rect.height;

    setSelectedId(item.id);

    setDragging({
      id: item.id,

      offsetX:
        event.clientX -
        rect.left -
        left,

      offsetY:
        event.clientY -
        rect.top -
        top,
    });
  };

  /* =======================================================
     CANVAS DRAGGING
     ======================================================= */

  useEffect(() => {
    if (!dragging) {
      return undefined;
    }

    const handleMove = event => {
      const rect =
        canvasRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      const nextX =
        ((event.clientX -
          rect.left -
          dragging.offsetX) /
          rect.width) *
        100;

      const nextY =
        ((event.clientY -
          rect.top -
          dragging.offsetY) /
          rect.height) *
        100;

      setItems(current =>
        current.map(item =>
          item.id ===
          dragging.id
            ? {
                ...item,

                x: Math.min(
                  94,
                  Math.max(
                    6,
                    nextX
                  )
                ),

                y: Math.min(
                  94,
                  Math.max(
                    6,
                    nextY
                  )
                ),
              }
            : item
        )
      );
    };

    const handleUp = () =>
      setDragging(null);

    window.addEventListener(
      "pointermove",
      handleMove
    );

    window.addEventListener(
      "pointerup",
      handleUp
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        handleMove
      );

      window.removeEventListener(
        "pointerup",
        handleUp
      );
    };
  }, [dragging]);

  /* =======================================================
     DROP PRODUCT
     ======================================================= */

  const handleDrop = event => {
    event.preventDefault();

    const productId =
      event.dataTransfer.getData(
        "application/pnche-product"
      );

    const product =
      studioProducts.find(
        item =>
          String(item.id) ===
          productId
      );

    if (product) {
      addProduct(product);
    }
  };

  /* =======================================================
     SAVE AS IMAGE
     ======================================================= */

  const downloadLook = async () => {
    if (
      !canvasRef.current ||
      !items.length
    ) {
      setMessage(
        "Add something to your canvas first"
      );

      window.setTimeout(
        () => setMessage(""),
        1800
      );

      return;
    }

    setSavingImage(true);

    try {
      const dataUrl =
        await toPng(
          canvasRef.current,
          {
            cacheBust: true,

            pixelRatio: 2,

            backgroundColor:
              "#ffffff",

            filter: node =>
              !node.classList?.contains(
                "studio-export-hidden"
              ),
          }
        );

      const link =
        document.createElement(
          "a"
        );

      link.download = `pnche-studiiios-look-${Date.now()}.png`;

      link.href = dataUrl;

      link.click();

      setMessage(
        "Look image saved"
      );
    } catch (error) {
      console.error(
        "PNCHE STUDIIOS image export failed:",
        error
      );

      setMessage(
        "Image export failed — try again"
      );
    } finally {
      setSavingImage(false);

      window.setTimeout(
        () => setMessage(""),
        2200
      );
    }
  };

  /* =======================================================
     SHOP PRODUCT
     ======================================================= */

  const shopProduct = item => {
    const slug =
      item.slug ||
      String(
        item.name || ""
      )
        .toLowerCase()
        .replace(
          /[^a-z0-9]+/g,
          "-"
        )
        .replace(
          /(^-|-$)/g,
          ""
        );

    window.location.hash =
      `/product/${slug}`;
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className="pnche-studio-page">

      {/* =================================================
          INTRO
          ================================================= */}

      <section className="pnche-studio-intro">
        <div>
          <span className="pnche-studio-eyebrow">
            PNCHE STUDIIOS.
          </span>

          <h1>
            STYLE YOUR LOOK.
          </h1>

          <p>
            Build an outfit with
            PNCHE pieces. Drag it.
            Move it. Make it yours.
          </p>
        </div>

        <div className="pnche-studio-intro-note">
          <span>
            DIGITAL STYLING
          </span>

          <span>
            NO RULES.
          </span>
        </div>
      </section>

      {/* =================================================
          WORKSPACE
          ================================================= */}

      <section className="pnche-studio-workspace">

        {/* ===============================================
            PRODUCTS / CATEGORIES
            =============================================== */}

        <aside className="pnche-studio-sidebar pnche-studio-products">

          <div className="pnche-studio-panel-head">
            <div>
              <span>
                BUILD
              </span>

              <h2>
                YOUR FIT
              </h2>
            </div>

            <span className="pnche-studio-count">
              {visibleProducts.length}
            </span>
          </div>

          {/* =============================================
              DYNAMIC CATEGORY TABS
              ============================================= */}

          <div
            className="pnche-studio-tabs"
            role="tablist"
            aria-label="Studio categories"
          >
            {categoryTabs.map(
              tab => (
                <button
                  key={tab.id}
                  type="button"
                  className={
                    activeTab ===
                    tab.id
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActiveTab(
                      tab.id
                    )
                  }
                >
                  {tab.label}
                </button>
              )
            )}
          </div>

          {/* =============================================
              ACTIVE CATEGORY LABEL
              ============================================= */}

          <div className="pnche-studio-category-label">
            {activeCategoryName}
          </div>

          {/* =============================================
              PRODUCT LIST
              ============================================= */}

          <div className="pnche-studio-product-list">

            {visibleProducts.length ? (
              visibleProducts.map(
                product => (
                  <button
                    key={
                      product.id
                    }
                    type="button"
                    className="pnche-studio-product"
                    draggable={
                      Boolean(
                        product.studioImage
                      )
                    }
                    onDragStart={
                      event => {
                        if (
                          !product.studioImage
                        ) {
                          return;
                        }

                        event.dataTransfer.effectAllowed =
                          "copy";

                        event.dataTransfer.setData(
                          "application/pnche-product",
                          String(
                            product.id
                          )
                        );
                      }
                    }
                    onClick={() =>
                      addProduct(
                        product
                      )
                    }
                    title={
                      product.studioImage
                        ? "Drag to the canvas or tap to add"
                        : "This product needs an image"
                    }
                  >

                    <span className="pnche-studio-product-image">

                      {product.studioImage ? (
                        <img
                          src={
                            product.studioImage
                          }
                          alt=""
                          draggable="false"
                        />
                      ) : (
                        <span className="pnche-studio-no-image">
                          NO IMAGE
                        </span>
                      )}

                    </span>

                    <span className="pnche-studio-product-info">

                      <strong>
                        {
                          product.name
                        }
                      </strong>

                      <small>
                        {product.studioImage
                          ? "ADD TO LOOK"
                          : "IMAGE NEEDED"}
                      </small>

                      <span className="pnche-studio-product-price">
                        {formatNaira(
                          product.price
                        )}
                      </span>

                    </span>

                  </button>
                )
              )
            ) : (
              <div className="pnche-studio-empty-products">

                <span>
                  {activeCategoryName}
                </span>

                <p>
                  No published
                  products in
                  this category
                  yet.
                </p>

              </div>
            )}

          </div>

        </aside>

        {/* ===============================================
            CANVAS
            =============================================== */}

        <div className="pnche-studio-stage">

          <div className="pnche-studio-stage-head">

            <span>
              THE CANVAS
            </span>

            <span>
              {items.length} ITEM
              {items.length === 1
                ? ""
                : "S"}
            </span>

          </div>

          <div
            ref={canvasRef}
            className="pnche-studio-canvas"
            onDragOver={event =>
              event.preventDefault()
            }
            onDrop={handleDrop}
            onPointerDown={event => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setSelectedId(null);
              }
            }}
          >

            <div className="pnche-studio-grid" />

            <div className="pnche-studio-canvas-brand">
              <span>
                PNCHE
              </span>

              <small>
                STUDIIOS.
              </small>
            </div>

            {!items.length && (
              <div className="pnche-studio-drop-message">

                <span>
                  DROP YOUR PIECES
                  HERE
                </span>

                <small>
                  or tap any item to
                  add it
                </small>

              </div>
            )}

            {items.map(
              item => (
                <div
                  key={item.id}
                  className={`pnche-studio-canvas-item ${
                    selectedId ===
                    item.id
                      ? "selected"
                      : ""
                  }`}
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    width: `${item.width}px`,
                    zIndex: item.z,
                    transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                  }}
                  onPointerDown={event =>
                    startCanvasDrag(
                      event,
                      item
                    )
                  }
                >

                  <img
                    src={item.image}
                    alt={item.name}
                    draggable="false"
                  />

                  {selectedId ===
                    item.id && (
                    <div className="pnche-studio-item-tools studio-export-hidden">

                      <button
                        type="button"
                        onPointerDown={event =>
                          event.stopPropagation()
                        }
                        onClick={() =>
                          rotateSelected(
                            -5
                          )
                        }
                        aria-label="Rotate left"
                      >
                        ↶
                      </button>

                      <button
                        type="button"
                        onPointerDown={event =>
                          event.stopPropagation()
                        }
                        onClick={() =>
                          resizeSelected(
                            -10
                          )
                        }
                        aria-label="Make smaller"
                      >
                        −
                      </button>

                      <button
                        type="button"
                        onPointerDown={event =>
                          event.stopPropagation()
                        }
                        onClick={() =>
                          resizeSelected(
                            10
                          )
                        }
                        aria-label="Make bigger"
                      >
                        +
                      </button>

                      <button
                        type="button"
                        onPointerDown={event =>
                          event.stopPropagation()
                        }
                        onClick={() =>
                          rotateSelected(
                            5
                          )
                        }
                        aria-label="Rotate right"
                      >
                        ↷
                      </button>

                      <button
                        type="button"
                        onPointerDown={event =>
                          event.stopPropagation()
                        }
                        onClick={() =>
                          removeItem(
                            item.id
                          )
                        }
                        aria-label="Remove item"
                      >
                        <X
                          size={13}
                        />
                      </button>

                    </div>
                  )}

                </div>
              )
            )}

          </div>

          {/* =============================================
              ACTIONS
              ============================================= */}

          <div className="pnche-studio-actions">

            <button
              type="button"
              onClick={
                clearCanvas
              }
              className="secondary"
            >
              <Trash2
                size={14}
              />

              CLEAR
            </button>

            <div className="pnche-studio-main-actions">

              <button
                type="button"
                onClick={
                  downloadLook
                }
                disabled={
                  savingImage
                }
              >
                <Download
                  size={14}
                />

                {savingImage
                  ? "CREATING..."
                  : "SAVE AS IMAGE"}
              </button>

            </div>

          </div>

        </div>

        {/* ===============================================
            SELECTED / YOUR LOOK
            =============================================== */}

        <aside className="pnche-studio-sidebar pnche-studio-selected">

          <div className="pnche-studio-panel-head">

            <div>
              <span>
                YOUR LOOK
              </span>

              <h2>
                SELECTED
              </h2>
            </div>

            <Heart
              size={15}
              strokeWidth={1.5}
            />

          </div>

          <div className="pnche-studio-selected-list">

            {items.length ? (
              items.map(
                item => (
                  <div
                    key={item.id}
                    className={`pnche-studio-selected-item ${
                      selectedId ===
                      item.id
                        ? "active"
                        : ""
                    }`}
                  >

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedId(
                          item.id
                        )
                      }
                    >

                      <span className="pnche-studio-selected-thumb">

                        <img
                          src={
                            item.image
                          }
                          alt=""
                        />

                      </span>

                      <span>

                        <strong>
                          {
                            item.name
                          }
                        </strong>

                        <small>
                          {item.slot.toUpperCase()}
                        </small>

                        <small>
                          {formatNaira(
                            item.price
                          )}
                        </small>

                      </span>

                    </button>

                    <button
                      type="button"
                      className="remove"
                      onClick={() =>
                        removeItem(
                          item.id
                        )
                      }
                      aria-label={`Remove ${item.name}`}
                    >
                      <X
                        size={13}
                      />
                    </button>

                  </div>
                )
              )
            ) : (
              <div className="pnche-studio-selected-empty">

                <RotateCcw
                  size={18}
                  strokeWidth={1.3}
                />

                <p>
                  Your canvas is
                  empty.
                </p>

                <span>
                  Pick pieces from
                  the left.
                </span>

              </div>
            )}

          </div>

          {/* =============================================
              LOOK TOTAL
              ============================================= */}

          {items.length > 0 && (
            <div className="pnche-studio-look-summary">

              <div className="pnche-studio-total-row">

                <span>
                  TOTAL
                </span>

                <strong>
                  {formatNaira(
                    lookTotal
                  )}
                </strong>

              </div>

            </div>
          )}

          {/* =============================================
              SHOP THE PIECES
              ============================================= */}

          {items.length > 0 && (
            <div className="pnche-studio-shop-list">

              <span>
                SHOP THE PIECES
              </span>

              {items.map(
                item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      shopProduct(
                        item
                      )
                    }
                  >

                    {item.name}

                    <span>
                      →
                    </span>

                  </button>
                )
              )}

            </div>
          )}

        </aside>

      </section>

      {/* =================================================
          TOAST
          ================================================= */}

      {message && (
        <div className="pnche-studio-toast">
          {message}
        </div>
      )}

    </main>
  );
}