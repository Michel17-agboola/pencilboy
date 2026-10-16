import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Clock3,
  Package,
  ShoppingBag,
  Users,
  Wallet,
  AlertTriangle,
  Eye,
  Heart,
  ShoppingCart,
  RefreshCw,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const EXCLUDED_STATUSES = [
  "CANCELLED",
  "CANCELED",
  "FAILED",
  "REFUNDED",
];

const RANGE_OPTIONS = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "12m", label: "12 Months" },
];

function formatNaira(value) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-NG").format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getStartDate(range) {
  const now = new Date();

  if (range === "today") {
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
  }

  if (range === "7d") {
    const date = new Date(now);
    date.setDate(date.getDate() - 6);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  if (range === "30d") {
    const date = new Date(now);
    date.setDate(date.getDate() - 29);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  const date = new Date(now);
  date.setMonth(date.getMonth() - 11);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);

  return date;
}

function isExcludedOrder(order) {
  return EXCLUDED_STATUSES.includes(
    String(order?.status || "").toUpperCase()
  );
}

function getCustomerKey(order) {
  return (
    order?.customer_id ||
    order?.email ||
    order?.customer_name ||
    order?.id
  );
}

function getOrderTotal(order) {
  return Number(order?.total) || 0;
}

function buildChartData(orders, range) {
  const now = new Date();

  if (range === "today") {
    const buckets = Array.from({ length: 24 }, (_, hour) => ({
      label: `${String(hour).padStart(2, "0")}:00`,
      revenue: 0,
      orders: 0,
    }));

    orders.forEach((order) => {
      const date = new Date(order.created_at);

      if (
        date.getFullYear() !== now.getFullYear() ||
        date.getMonth() !== now.getMonth() ||
        date.getDate() !== now.getDate()
      ) {
        return;
      }

      const hour = date.getHours();

      if (buckets[hour]) {
        buckets[hour].revenue += getOrderTotal(order);
        buckets[hour].orders += 1;
      }
    });

    return buckets;
  }

  if (range === "7d") {
    const buckets = [];

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      buckets.push({
        dateKey: date.toISOString().slice(0, 10),
        label: new Intl.DateTimeFormat("en-NG", {
          weekday: "short",
        }).format(date),
        revenue: 0,
        orders: 0,
      });
    }

    orders.forEach((order) => {
      const date = new Date(order.created_at);
      const key = date.toISOString().slice(0, 10);

      const bucket = buckets.find(
        (item) => item.dateKey === key
      );

      if (bucket) {
        bucket.revenue += getOrderTotal(order);
        bucket.orders += 1;
      }
    });

    return buckets;
  }

  if (range === "30d") {
    const buckets = [];

    for (let i = 29; i >= 0; i -= 1) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      buckets.push({
        dateKey: date.toISOString().slice(0, 10),
        label: String(date.getDate()),
        revenue: 0,
        orders: 0,
      });
    }

    orders.forEach((order) => {
      const date = new Date(order.created_at);
      const key = date.toISOString().slice(0, 10);

      const bucket = buckets.find(
        (item) => item.dateKey === key
      );

      if (bucket) {
        bucket.revenue += getOrderTotal(order);
        bucket.orders += 1;
      }
    });

    return buckets;
  }

  const buckets = [];

  for (let i = 11; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    date.setDate(1);
    date.setHours(0, 0, 0, 0);

    buckets.push({
      monthKey: `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`,
      label: new Intl.DateTimeFormat("en-NG", {
        month: "short",
      }).format(date),
      revenue: 0,
      orders: 0,
    });
  }

  orders.forEach((order) => {
    const date = new Date(order.created_at);

    const key = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    const bucket = buckets.find(
      (item) => item.monthKey === key
    );

    if (bucket) {
      bucket.revenue += getOrderTotal(order);
      bucket.orders += 1;
    }
  });

  return buckets;
}

function StatCard({
  label,
  value,
  icon: Icon,
  detail,
  trend,
}) {
  return (
    <article className="dashboard-stat-card">
      <div className="dashboard-stat-top">
        <span>{label}</span>

        <span className="dashboard-stat-icon">
          <Icon size={17} strokeWidth={1.6} />
        </span>
      </div>

      <strong>{value}</strong>

      <div className="dashboard-stat-bottom">
        <small>{detail}</small>

        {trend !== undefined && trend !== null && (
          <span
            className={
              trend >= 0
                ? "dashboard-trend positive"
                : "dashboard-trend negative"
            }
          >
            {trend >= 0 ? (
              <ArrowUpRight size={13} />
            ) : (
              <ArrowDownRight size={13} />
            )}

            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </article>
  );
}

function ActivityCard({ label, value, icon: Icon }) {
  return (
    <article className="dashboard-activity-card">
      <div className="dashboard-activity-icon">
        <Icon size={17} strokeWidth={1.5} />
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

export default function AdminDashboard() {
  const [range, setRange] = useState("7d");

  const [orders, setOrders] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadDashboard(showRefresh = false) {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const [productsResult, ordersResult, itemsResult] =
        await Promise.all([
          supabase
            .from("products")
            .select("*, categories(id, name, slug)")
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("orders")
            .select("*")
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("order_items")
            .select("*")
            .order("created_at", {
              ascending: false,
            }),
        ]);

      if (productsResult.error) {
        throw productsResult.error;
      }

      setProducts(productsResult.data || []);

      if (ordersResult.error) {
        console.warn(
          "PENCILBOY orders table is not available yet:",
          ordersResult.error.message
        );

        setOrders([]);
      } else {
        setOrders(ordersResult.data || []);
      }

      if (itemsResult.error) {
        console.warn(
          "PENCILBOY order_items table is not available yet:",
          itemsResult.error.message
        );

        setOrderItems([]);
      } else {
        setOrderItems(itemsResult.data || []);
      }
    } catch (err) {
      console.error("Dashboard load error:", err);

      setError(
        err?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const validOrders = useMemo(
    () => orders.filter((order) => !isExcludedOrder(order)),
    [orders]
  );

  const startDate = useMemo(
    () => getStartDate(range),
    [range]
  );

  const rangeOrders = useMemo(
    () =>
      validOrders.filter(
        (order) =>
          new Date(order.created_at) >= startDate
      ),
    [validOrders, startDate]
  );

  const previousRangeOrders = useMemo(() => {
    const currentStart = startDate;
    const now = new Date();

    const rangeLength =
      now.getTime() - currentStart.getTime();

    const previousEnd = new Date(currentStart);

    const previousStart = new Date(
      currentStart.getTime() - rangeLength
    );

    return validOrders.filter((order) => {
      const date = new Date(order.created_at);

      return (
        date >= previousStart &&
        date < previousEnd
      );
    });
  }, [validOrders, startDate]);

  const revenue = useMemo(
    () =>
      rangeOrders.reduce(
        (sum, order) => sum + getOrderTotal(order),
        0
      ),
    [rangeOrders]
  );

  const previousRevenue = useMemo(
    () =>
      previousRangeOrders.reduce(
        (sum, order) => sum + getOrderTotal(order),
        0
      ),
    [previousRangeOrders]
  );

  const revenueChange = useMemo(() => {
    if (previousRevenue === 0) {
      return revenue > 0 ? 100 : 0;
    }

    return Math.round(
      ((revenue - previousRevenue) /
        previousRevenue) *
        100
    );
  }, [revenue, previousRevenue]);

  const orderChange = useMemo(() => {
    if (previousRangeOrders.length === 0) {
      return rangeOrders.length > 0 ? 100 : 0;
    }

    return Math.round(
      ((rangeOrders.length -
        previousRangeOrders.length) /
        previousRangeOrders.length) *
        100
    );
  }, [
    rangeOrders.length,
    previousRangeOrders.length,
  ]);

  const customers = useMemo(() => {
    const unique = new Set();

    rangeOrders.forEach((order) => {
      unique.add(getCustomerKey(order));
    });

    return unique.size;
  }, [rangeOrders]);

  const chartData = useMemo(
    () => buildChartData(rangeOrders, range),
    [rangeOrders, range]
  );

  const chartMax = useMemo(() => {
    const max = Math.max(
      ...chartData.map((item) => item.revenue),
      0
    );

    return max || 1;
  }, [chartData]);

  const topProducts = useMemo(() => {
    const productMap = new Map();

    const rangeOrderIds = new Set(
      rangeOrders.map((order) => order.id)
    );

    orderItems.forEach((item) => {
      if (
        item.order_id &&
        !rangeOrderIds.has(item.order_id)
      ) {
        return;
      }

      const key =
        item.product_id ||
        item.product_name ||
        "unknown";

      if (!productMap.has(key)) {
        productMap.set(key, {
          id: key,
          name:
            item.product_name ||
            "Unnamed Product",
          units: 0,
          revenue: 0,
        });
      }

      const product = productMap.get(key);

      const quantity =
        Number(item.quantity) || 0;

      const unitPrice =
        Number(item.unit_price) || 0;

      product.units += quantity;
      product.revenue +=
        quantity * unitPrice;
    });

    return Array.from(productMap.values())
      .sort((a, b) => {
        if (b.units !== a.units) {
          return b.units - a.units;
        }

        return b.revenue - a.revenue;
      })
      .slice(0, 5);
  }, [orderItems, rangeOrders]);

  const lowStockProducts = useMemo(
    () =>
      products
        .filter(
          (product) =>
            Number(product.stock) <= 5 &&
            String(product.status || "").toUpperCase() !==
              "ARCHIVED"
        )
        .sort(
          (a, b) =>
            Number(a.stock) - Number(b.stock)
        )
        .slice(0, 6),
    [products]
  );

  const recentOrders = useMemo(
    () => validOrders.slice(0, 6),
    [validOrders]
  );

  if (loading) {
    return (
      <section className="admin-dashboard">
        <div className="dashboard-loading">
          <RefreshCw
            size={20}
            className="dashboard-spin"
          />

          <span>Loading dashboard...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            PENCILBOY / OVERVIEW
          </span>

          <h1>Dashboard</h1>

          <p>
            A live overview of your store performance,
            sales and inventory.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-refresh"
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={15}
            className={
              refreshing
                ? "dashboard-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing"
            : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="dashboard-error">
          <AlertTriangle size={17} />

          <div>
            <strong>
              Dashboard data could not be loaded
            </strong>

            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="dashboard-range-row">
        <div className="dashboard-range">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              className={
                range === option.key
                  ? "active"
                  : ""
              }
              onClick={() =>
                setRange(option.key)
              }
            >
              {option.label}
            </button>
          ))}
        </div>

        <span className="dashboard-live">
          <span />
          LIVE DATA
        </span>
      </div>

      <div className="dashboard-stats">
        <StatCard
          label="Revenue"
          value={formatNaira(revenue)}
          icon={Wallet}
          detail={`${rangeOrders.length} order${
            rangeOrders.length === 1
              ? ""
              : "s"
          }`}
          trend={revenueChange}
        />

        <StatCard
          label="Orders"
          value={formatNumber(
            rangeOrders.length
          )}
          icon={ShoppingBag}
          detail="Completed store activity"
          trend={orderChange}
        />

        <StatCard
          label="Customers"
          value={formatNumber(customers)}
          icon={Users}
          detail="Unique buyers"
        />

        <StatCard
          label="Products"
          value={formatNumber(products.length)}
          icon={Package}
          detail="Products in catalogue"
        />
      </div>

      <div className="dashboard-section-heading">
        <div>
          <span>STORE ACTIVITY</span>
          <h2>What&apos;s happening</h2>
        </div>
      </div>

      <div className="dashboard-activity-grid">
        <ActivityCard
          label="Visitors"
          value="NOT TRACKED"
          icon={Users}
        />

        <ActivityCard
          label="Product Views"
          value="NOT TRACKED"
          icon={Eye}
        />

        <ActivityCard
          label="Likes"
          value="NOT TRACKED"
          icon={Heart}
        />

        <ActivityCard
          label="Cart Adds"
          value="NOT TRACKED"
          icon={ShoppingCart}
        />

        <ActivityCard
          label="Orders"
          value={formatNumber(
            rangeOrders.length
          )}
          icon={ShoppingBag}
        />
      </div>

      <div className="dashboard-main-grid">
        <section className="dashboard-panel dashboard-chart-panel">
          <div className="dashboard-panel-heading">
            <div>
              <span>SALES PERFORMANCE</span>
              <h3>Revenue</h3>
            </div>

            <BarChart3
              size={20}
              strokeWidth={1.4}
            />
          </div>

          <div className="dashboard-chart">
            <div className="dashboard-chart-y">
              <span>
                {formatNaira(chartMax)}
              </span>

              <span>
                {formatNaira(chartMax / 2)}
              </span>

              <span>₦0</span>
            </div>

            <div className="dashboard-chart-area">
              <div className="dashboard-chart-lines">
                <span />
                <span />
                <span />
              </div>

              <div className="dashboard-bars">
                {chartData.map(
                  (item, index) => {
                    const height =
                      item.revenue > 0
                        ? Math.max(
                            (item.revenue /
                              chartMax) *
                              100,
                            4
                          )
                        : 2;

                    return (
                      <div
                        className="dashboard-bar-wrap"
                        key={
                          item.dateKey ||
                          item.monthKey ||
                          index
                        }
                        title={`${item.label}: ${formatNaira(
                          item.revenue
                        )}`}
                      >
                        <div
                          className="dashboard-bar"
                          style={{
                            height: `${height}%`,
                          }}
                        />

                        <span>
                          {item.label}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-panel dashboard-top-products">
          <div className="dashboard-panel-heading">
            <div>
              <span>PERFORMANCE</span>
              <h3>Top Products</h3>
            </div>

            <Package
              size={20}
              strokeWidth={1.4}
            />
          </div>

          {topProducts.length === 0 ? (
            <div className="dashboard-empty">
              <Package size={22} />
              <p>No sales data yet.</p>
            </div>
          ) : (
            <div className="dashboard-product-list">
              {topProducts.map(
                (product, index) => (
                  <div
                    className="dashboard-product-row"
                    key={product.id}
                  >
                    <span className="dashboard-product-rank">
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <div className="dashboard-product-info">
                      <strong>
                        {product.name}
                      </strong>

                      <small>
                        {product.units}{" "}
                        {product.units === 1
                          ? "UNIT"
                          : "UNITS"}{" "}
                        SOLD
                      </small>
                    </div>

                    <strong>
                      {formatNaira(
                        product.revenue
                      )}
                    </strong>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>

      <div className="dashboard-bottom-grid">
        <section className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <span>INVENTORY</span>
              <h3>Low Stock</h3>
            </div>

            <AlertTriangle
              size={20}
              strokeWidth={1.4}
            />
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="dashboard-empty">
              <Package size={22} />

              <p>
                No low-stock products.
              </p>
            </div>
          ) : (
            <div className="dashboard-stock-list">
              {lowStockProducts.map(
                (product) => (
                  <div
                    className="dashboard-stock-row"
                    key={product.id}
                  >
                    <div>
                      <strong>
                        {product.name}
                      </strong>

                      <small>
                        {product.categories?.name ||
                          product.category ||
                          "Uncategorised"}
                      </small>
                    </div>

                    <span
                      className={
                        Number(product.stock) ===
                        0
                          ? "out"
                          : "low"
                      }
                    >
                      {Number(product.stock) ===
                      0
                        ? "OUT OF STOCK"
                        : `${product.stock} LEFT`}
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <span>STORE ACTIVITY</span>
              <h3>Recent Orders</h3>
            </div>

            <Clock3
              size={20}
              strokeWidth={1.4}
            />
          </div>

          {recentOrders.length === 0 ? (
            <div className="dashboard-empty">
              <ShoppingBag size={22} />

              <p>
                No orders have been placed yet.
              </p>
            </div>
          ) : (
            <div className="dashboard-orders-list">
              {recentOrders.map((order) => (
                <div
                  className="dashboard-order-row"
                  key={order.id}
                >
                  <div>
                    <strong>
                      {order.customer_name ||
                        order.email ||
                        "Guest Customer"}
                    </strong>

                    <small>
                      {formatDate(
                        order.created_at
                      )}
                    </small>
                  </div>

                  <div className="dashboard-order-right">
                    <strong>
                      {formatNaira(
                        order.total
                      )}
                    </strong>

                    <span
                      className={`dashboard-order-status ${String(
                        order.status ||
                          "PENDING"
                      ).toLowerCase()}`}
                    >
                      {order.status ||
                        "PENDING"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="dashboard-footer-note">
        <span>PENCILBOY ADMIN</span>

        <span>
          Data shown above comes directly from
          your Supabase store.
        </span>
      </div>
    </section>
  );
}