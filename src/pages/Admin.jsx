import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Package, Tags, LogOut, Pencil, Trash2, X, Save, ArrowLeft, RefreshCw, Activity } from "lucide-react";
import { supabase } from "../lib/supabase";
import AdminDashboard from "./AdminDashboard";
import { formatNaira, slugify } from "../lib/format";
import "../admin.css";

const EMPTY_PRODUCT = {
  name: "",
  slug: "",
  description: "",
  category_id: "",
  price: "",
  compare_at_price: "",
  images: "",
  sizes: "",
  colors: "",
  stock: 0,
  featured: false,
  new_in: false,
  status: "DRAFT",
  sort_order: 0
};

const EMPTY_CATEGORY = {
  name: "",
  slug: "",
  description: "",
  image_url: "",
  sort_order: 0,
  status: "PUBLISHED"
};

function splitValues(value) {
  return String(value || "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}


function PasswordReset({ onComplete }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] =
    useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;

      if (!data.session) {
        setError(
          "This password reset link is invalid or has expired. Please request a new one."
        );
      }

      setCheckingSession(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const submit = async event => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: updateError } =
      await supabase.auth.updateUser({
        password
      });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();

    setLoading(false);
    onComplete();
  };

  return (
    <main className="admin-auth">
      <div className="admin-auth-card">
        <div className="admin-mark">
          PENCILBOY.
        </div>

        <div className="admin-auth-label">
          PRIVATE ADMIN
        </div>

        <h1>Set new password</h1>

        <p>
          Create a new password for your
          PENCILBOY admin account.
        </p>

        {checkingSession ? (
          <div className="admin-empty">
            Checking password reset link...
          </div>
        ) : (
          <form onSubmit={submit}>
            <label>
              NEW PASSWORD

              <input
                type="password"
                value={password}
                onChange={event =>
                  setPassword(event.target.value)
                }
                placeholder="••••••••"
                minLength={8}
                required
                disabled={Boolean(error)}
              />
            </label>

            <label>
              CONFIRM PASSWORD

              <input
                type="password"
                value={confirmPassword}
                onChange={event =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                placeholder="••••••••"
                minLength={8}
                required
                disabled={Boolean(error)}
              />
            </label>

            {error && (
              <div className="admin-error">
                {error}
              </div>
            )}

            {!error && (
              <button
                className="admin-primary-button"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "UPDATING..."
                  : "SET NEW PASSWORD"}
              </button>
            )}

            {error && (
              <button
                className="admin-secondary-button"
                type="button"
                onClick={() => {
                  window.location.href = "/admin/#/admin";
                }}
              >
                BACK TO SIGN IN
              </button>
            )}
          </form>
        )}
      </div>
    </main>
  );
}

function AdminLogin({ onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async event => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const {
      data,
      error: signInError
    } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const {
      data: admin
    } = await supabase
      .from("admin_users")
      .select("user_id, role")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (!admin) {
      await supabase.auth.signOut();
      setError("This account does not have admin access.");
      setLoading(false);
      return;
    }

    onLoggedIn(data.user);
    setLoading(false);
  };

  const sendPasswordReset = async event => {
    event.preventDefault();

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Enter your email address first.");
      return;
    }

    setForgotLoading(true);
    setError("");
    setForgotSent(false);

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(
        cleanEmail,
        {
          redirectTo:
            "https://pencilboy.vercel.app/admin/#/admin?reset=true"
        }
      );

    if (resetError) {
      setError(resetError.message);
      setForgotLoading(false);
      return;
    }

    setForgotSent(true);
    setForgotLoading(false);
  };

  if (forgotMode) {
    return (
      <main className="admin-auth">
        <div className="admin-auth-card">
          <div className="admin-mark">
            PENCILBOY.
          </div>

          <div className="admin-auth-label">
            PRIVATE ADMIN
          </div>

          <h1>Reset password</h1>

          <p>
            Enter your admin email and we'll send
            you a link to create a new password.
          </p>

          {forgotSent ? (
            <>
              <div className="admin-help">
                Password reset email sent. Check your
                inbox and follow the link to create a
                new password.
              </div>

              <button
                className="admin-secondary-button"
                type="button"
                onClick={() => {
                  setForgotMode(false);
                  setForgotSent(false);
                  setError("");
                }}
              >
                BACK TO SIGN IN
              </button>
            </>
          ) : (
            <form onSubmit={sendPasswordReset}>
              <label>
                EMAIL

                <input
                  type="email"
                  value={email}
                  onChange={event =>
                    setEmail(event.target.value)
                  }
                  placeholder="admin@email.com"
                  required
                />
              </label>

              {error && (
                <div className="admin-error">
                  {error}
                </div>
              )}

              <button
                className="admin-primary-button"
                type="submit"
                disabled={forgotLoading}
              >
                {forgotLoading
                  ? "SENDING..."
                  : "SEND RESET LINK"}
              </button>

              <button
                className="admin-secondary-button"
                type="button"
                onClick={() => {
                  setForgotMode(false);
                  setError("");
                }}
              >
                BACK TO SIGN IN
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="admin-auth">
      <div className="admin-auth-card">
        <div className="admin-mark">
          PENCILBOY.
        </div>

        <div className="admin-auth-label">
          PRIVATE ADMIN
        </div>

        <h1>Sign in</h1>

        <p>
          Manage the PENCILBOY catalogue,
          products and categories.
        </p>

        <form onSubmit={submit}>
          <label>
            EMAIL
            <input
              type="email"
              value={email}
              onChange={event =>
                setEmail(event.target.value)
              }
              placeholder="admin@email.com"
              required
            />
          </label>

          <label>
            PASSWORD
            <input
              type="password"
              value={password}
              onChange={event =>
                setPassword(event.target.value)
              }
              placeholder="••••••••"
              required
            />
          </label>

          {error && (
            <div className="admin-error">
              {error}
            </div>
          )}

          <button
            className="admin-primary-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "SIGNING IN..."
              : "SIGN IN"}
          </button>

          <button
            type="button"
            className="admin-secondary-button"
            onClick={() => {
              setForgotMode(true);
              setError("");
            }}
          >
            FORGOT PASSWORD?
          </button>
        </form>
      </div>
    </main>
  );
}

function ProductForm({
  product,
  categories,
  onSave,
  onCancel
}) {
  const [form, setForm] =
    useState(product || EMPTY_PRODUCT);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [uploadingImages, setUploadingImages] =
    useState(false);

  const [sizeInput, setSizeInput] =
    useState("");

  const [colorInput, setColorInput] =
    useState("");

  useEffect(() => {
    setForm(product || EMPTY_PRODUCT);
    setError("");
    setSizeInput("");
    setColorInput("");
  }, [product]);

  const update = (key, value) => {
    setForm(current => ({
      ...current,
      [key]: value
    }));
  };

  const addListValue = (
    key,
    value,
    clear
  ) => {
    const cleanValue =
      String(value || "").trim();

    if (!cleanValue) return;

    const currentValues =
      splitValues(form[key]);

    const exists = currentValues.some(
      item =>
        item.toLowerCase() ===
        cleanValue.toLowerCase()
    );

    if (!exists) {
      update(key, [
        ...currentValues,
        cleanValue
      ]);
    }

    clear("");
  };

  const removeListValue = (
    key,
    index
  ) => {
    update(
      key,
      splitValues(form[key]).filter(
        (_, valueIndex) =>
          valueIndex !== index
      )
    );
  };

  const handleListKeyDown = (
    event,
    key,
    value,
    clear
  ) => {
    if (
      event.key === "Enter" ||
      event.key === ","
    ) {
      event.preventDefault();

      addListValue(
        key,
        value,
        clear
      );
    }
  };

  const uploadImages = async event => {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) return;

    setError("");
    setUploadingImages(true);

    try {
      const uploadedUrls = [];

      for (const file of files) {
        if (
          !file.type.startsWith("image/")
        ) {
          throw new Error(
            `${file.name} is not an image file.`
          );
        }

        if (
          file.size >
          8 * 1024 * 1024
        ) {
          throw new Error(
            `${file.name} is larger than 8MB.`
          );
        }

        const safeName =
          file.name
            .replace(
              /[^a-zA-Z0-9._-]/g,
              "-"
            )
            .toLowerCase();

        const path =
          `${crypto.randomUUID()}-${safeName}`;

        const {
          error: uploadError
        } =
          await supabase.storage
            .from("product-images")
            .upload(
              path,
              file,
              {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type
              }
            );

        if (uploadError)
          throw uploadError;

        const {
          data
        } =
          supabase.storage
            .from("product-images")
            .getPublicUrl(path);

        if (data?.publicUrl) {
          uploadedUrls.push(
            data.publicUrl
          );
        }
      }

      update("images", [
        ...splitValues(form.images),
        ...uploadedUrls
      ]);
    } catch (uploadError) {
      setError(
        uploadError.message ||
          "Unable to upload image."
      );
    } finally {
      setUploadingImages(false);
      event.target.value = "";
    }
  };

  const removeImage = index => {
    update(
      "images",
      splitValues(form.images).filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
    );
  };

  const makePrimary = index => {
    const images =
      splitValues(form.images);

    if (index <= 0) return;

    update("images", [
      images[index],
      ...images.filter(
        (_, i) => i !== index
      )
    ]);
  };

  const submit = async event => {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const productName = String(
        form.name || ""
      ).trim();

      if (!productName) {
        setError("Product name is required.");
        return;
      }

      /*
       * Slug rules:
       *
       * CREATE:
       *   Omo Ogbon -> omo-ogbon
       *   Omo Ogbon -> omo-ogbon-2
       *   Omo Ogbon -> omo-ogbon-3
       *
       * EDIT:
       *   Keep the existing product slug when
       *   the slug field is left empty.
       *
       * MANUAL SLUG:
       *   If the requested slug already exists,
       *   automatically add -2, -3, etc.
       */

      const requestedSlug = String(
        form.slug || ""
      ).trim();

      const existingSlug = String(
        product?.slug || ""
      ).trim();

      let baseSlug = slugify(
        requestedSlug ||
          (product?.id && existingSlug
            ? existingSlug
            : productName)
      );

      if (!baseSlug) {
        baseSlug = slugify(productName);
      }

      if (!baseSlug) {
        setError(
          "A valid product name or slug is required."
        );
        return;
      }

      /*
       * Find all products using this slug pattern.
       * We exclude the current product when editing.
       */
      const {
        data: existingProducts,
        error: slugLookupError
      } = await supabase
        .from("products")
        .select("id, slug")
        .ilike(
          "slug",
          `${baseSlug}%`
        );

      if (slugLookupError) {
        throw slugLookupError;
      }

      const usedSlugs = new Set(
        (existingProducts || [])
          .filter(
            item =>
              !product?.id ||
              item.id !== product.id
          )
          .map(item =>
            String(item.slug || "")
              .trim()
              .toLowerCase()
          )
      );

      /*
       * Find the first available slug.
       */
      let finalSlug = baseSlug;
      let suffix = 2;

      while (
        usedSlugs.has(
          finalSlug.toLowerCase()
        )
      ) {
        finalSlug = `${baseSlug}-${suffix}`;
        suffix += 1;
      }

      const payload = {
        name: productName,

        slug: finalSlug,

        description:
          String(
            form.description || ""
          ).trim() || null,

        category_id:
          form.category_id || null,

        price:
          Number(form.price) || 0,

        compare_at_price:
          form.compare_at_price !==
            "" &&
          form.compare_at_price !==
            null &&
          form.compare_at_price !==
            undefined
            ? Number(
                form.compare_at_price
              )
            : null,

        images:
          splitValues(form.images),

        sizes:
          splitValues(form.sizes),

        colors:
          splitValues(form.colors),

        stock:
          Number(form.stock) || 0,

        featured:
          Boolean(form.featured),

        new_in:
          Boolean(form.new_in),

        status:
          form.status || "DRAFT",

        sort_order:
          Number(form.sort_order) || 0,

        updated_at:
          new Date().toISOString()
      };

      let result;

      if (product?.id) {
        result =
          await supabase
            .from("products")
            .update(payload)
            .eq(
              "id",
              product.id
            )
            .select()
            .single();
      } else {
        result =
          await supabase
            .from("products")
            .insert(payload)
            .select()
            .single();
      }

      /*
       * If another product was created with the same
       * slug between our lookup and save, retry with
       * the next available suffix instead of freezing.
       */
      if (
        result.error &&
        result.error.code === "23505" &&
        result.error.message
          ?.toLowerCase()
          .includes("slug")
      ) {
        let retrySuffix =
          suffix;

        let retrySlug =
          `${baseSlug}-${retrySuffix}`;

        while (true) {
          const {
            data: conflictingProduct,
            error: conflictLookupError
          } = await supabase
            .from("products")
            .select("id")
            .eq(
              "slug",
              retrySlug
            )
            .maybeSingle();

          if (conflictLookupError) {
            throw conflictLookupError;
          }

          if (!conflictingProduct) {
            break;
          }

          retrySuffix += 1;

          retrySlug =
            `${baseSlug}-${retrySuffix}`;
        }

        const retryPayload = {
          ...payload,
          slug: retrySlug
        };

        if (product?.id) {
          result =
            await supabase
              .from("products")
              .update(
                retryPayload
              )
              .eq(
                "id",
                product.id
              )
              .select()
              .single();
        } else {
          result =
            await supabase
              .from("products")
              .insert(
                retryPayload
              )
              .select()
              .single();
        }
      }

      if (result.error) {
        throw result.error;
      }

      onSave(result.data);
    } catch (error) {
      console.error(
        "PENCILBOY product save error:",
        error
      );

      setError(
        error?.message ||
          "Unable to save product. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-form-shell">
      <div className="admin-form-heading">
        <button
          className="admin-icon-button"
          onClick={onCancel}
          type="button"
        >
          <ArrowLeft size={17} />
        </button>

        <div>
          <span>
            {product
              ? "EDIT PRODUCT"
              : "NEW PRODUCT"}
          </span>

          <h2>
            {product
              ? product.name
              : "Add a product"}
          </h2>
        </div>
      </div>

      <form
        className="admin-form"
        onSubmit={submit}
      >
        <section className="admin-form-section">
          <div className="admin-section-label">
            PRODUCT INFORMATION
          </div>

          <div className="admin-two-column">
            <label>
              PRODUCT NAME

              <input
                value={form.name}
                onChange={event =>
                  update(
                    "name",
                    event.target.value
                  )
                }
                required
              />
            </label>

            <label>
              SLUG

              <input
                value={form.slug}
                onChange={event =>
                  update(
                    "slug",
                    event.target.value
                  )
                }
                placeholder={slugify(
                  form.name
                )}
              />
            </label>
          </div>

          <label>
            DESCRIPTION

            <textarea
              value={form.description}
              onChange={event =>
                update(
                  "description",
                  event.target.value
                )
              }
              rows={5}
            />
          </label>
        </section>

        <section className="admin-form-section">
          <div className="admin-section-label">
            CATALOGUE
          </div>

          <div className="admin-two-column">
            <label>
              CATEGORY

              <select
                value={form.category_id}
                onChange={event =>
                  update(
                    "category_id",
                    event.target.value
                  )
                }
              >
                <option value="">
                  No category
                </option>

                {categories.map(
                  category => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              STATUS

              <select
                value={form.status}
                onChange={event =>
                  update(
                    "status",
                    event.target.value
                  )
                }
              >
                <option value="DRAFT">
                  Draft
                </option>

                <option value="PUBLISHED">
                  Published
                </option>

                <option value="SOLD_OUT">
                  Sold out
                </option>

                <option value="ARCHIVED">
                  Archived
                </option>
              </select>
            </label>
          </div>

          <div className="admin-check-row">
            <label className="admin-check">
              <input
                type="checkbox"
                checked={
                  form.featured
                }
                onChange={event =>
                  update(
                    "featured",
                    event.target.checked
                  )
                }
              />

              Featured
            </label>

            <label className="admin-check">
              <input
                type="checkbox"
                checked={
                  form.new_in
                }
                onChange={event =>
                  update(
                    "new_in",
                    event.target.checked
                  )
                }
              />

              New In
            </label>
          </div>
        </section>

        <section className="admin-form-section">
          <div className="admin-section-label">
            PRICING & STOCK
          </div>

          <div className="admin-three-column">
            <label>
              PRICE

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={event =>
                  update(
                    "price",
                    event.target.value
                  )
                }
                required
              />
            </label>

            <label>
              COMPARE PRICE

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  form.compare_at_price
                }
                onChange={event =>
                  update(
                    "compare_at_price",
                    event.target.value
                  )
                }
              />
            </label>

            <label>
              STOCK

              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={event =>
                  update(
                    "stock",
                    event.target.value
                  )
                }
              />
            </label>
          </div>

          <div className="admin-two-column">
            <div
              className="admin-tag-field"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10
              }}
            >
              <label>
                SIZES
              </label>

              <div
                className="admin-tag-list"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  minHeight: 4
                }}
              >
                {splitValues(
                  form.sizes
                ).map(
                  (
                    size,
                    index
                  ) => (
                    <span
                      className="admin-tag"
                      key={`${size}-${index}`}
                      style={{
                        display:
                          "inline-flex",
                        alignItems:
                          "center",
                        gap: 7,
                        padding:
                          "7px 9px",
                        border:
                          "1px solid #d8d8d3",
                        background:
                          "#fff",
                        fontSize: 10,
                        letterSpacing:
                          ".04em"
                      }}
                    >
                      {size}

                      <button
                        type="button"
                        onClick={() =>
                          removeListValue(
                            "sizes",
                            index
                          )
                        }
                        aria-label={`Remove size ${size}`}
                        style={{
                          display:
                            "grid",
                          placeItems:
                            "center",
                          padding: 0,
                          border: 0,
                          background:
                            "transparent",
                          color:
                            "#777",
                          cursor:
                            "pointer"
                        }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )
                )}
              </div>

              <div
                className="admin-tag-input-row"
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems:
                    "stretch"
                }}
              >
                <input
                  value={
                    sizeInput
                  }
                  onChange={event =>
                    setSizeInput(
                      event.target.value
                    )
                  }
                  onKeyDown={event =>
                    handleListKeyDown(
                      event,
                      "sizes",
                      sizeInput,
                      setSizeInput
                    )
                  }
                  placeholder="Type a size, e.g. M"
                />

                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() =>
                    addListValue(
                      "sizes",
                      sizeInput,
                      setSizeInput
                    )
                  }
                >
                  ADD
                </button>
              </div>

              <div
                className="admin-quick-values"
                style={{
                  display: "flex",
                  flexWrap:
                    "wrap",
                  gap: 6
                }}
              >
                {[
                  "XS",
                  "S",
                  "M",
                  "L",
                  "XL",
                  "XXL"
                ].map(size => (
                  <button
                    type="button"
                    key={size}
                    onClick={() =>
                      addListValue(
                        "sizes",
                        size,
                        setSizeInput
                      )
                    }
                    style={{
                      border:
                        "1px solid #deded9",
                      background:
                        "#f8f8f6",
                      color:
                        "#555",
                      padding:
                        "6px 9px",
                      cursor:
                        "pointer",
                      fontSize: 9
                    }}
                  >
                    + {size}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="admin-tag-field"
              style={{
                display: "flex",
                flexDirection:
                  "column",
                gap: 10
              }}
            >
              <label>
                COLOURS
              </label>

              <div
                className="admin-tag-list"
                style={{
                  display: "flex",
                  flexWrap:
                    "wrap",
                  gap: 8,
                  minHeight: 4
                }}
              >
                {splitValues(
                  form.colors
                ).map(
                  (
                    color,
                    index
                  ) => (
                    <span
                      className="admin-tag"
                      key={`${color}-${index}`}
                      style={{
                        display:
                          "inline-flex",
                        alignItems:
                          "center",
                        gap: 7,
                        padding:
                          "7px 9px",
                        border:
                          "1px solid #d8d8d3",
                        background:
                          "#fff",
                        fontSize: 10,
                        letterSpacing:
                          ".04em"
                      }}
                    >
                      {color}

                      <button
                        type="button"
                        onClick={() =>
                          removeListValue(
                            "colors",
                            index
                          )
                        }
                        aria-label={`Remove colour ${color}`}
                        style={{
                          display:
                            "grid",
                          placeItems:
                            "center",
                          padding: 0,
                          border: 0,
                          background:
                            "transparent",
                          color:
                            "#777",
                          cursor:
                            "pointer"
                        }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )
                )}
              </div>

              <div
                className="admin-tag-input-row"
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems:
                    "stretch"
                }}
              >
                <input
                  value={
                    colorInput
                  }
                  onChange={event =>
                    setColorInput(
                      event.target.value
                    )
                  }
                  onKeyDown={event =>
                    handleListKeyDown(
                      event,
                      "colors",
                      colorInput,
                      setColorInput
                    )
                  }
                  placeholder="Type a colour, e.g. Black"
                />

                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() =>
                    addListValue(
                      "colors",
                      colorInput,
                      setColorInput
                    )
                  }
                >
                  ADD
                </button>
              </div>

              <div
                className="admin-quick-values"
                style={{
                  display: "flex",
                  flexWrap:
                    "wrap",
                  gap: 6
                }}
              >
                {[
                  "Black",
                  "White",
                  "Grey",
                  "Navy",
                  "Cream",
                  "Brown"
                ].map(color => (
                  <button
                    type="button"
                    key={color}
                    onClick={() =>
                      addListValue(
                        "colors",
                        color,
                        setColorInput
                      )
                    }
                    style={{
                      border:
                        "1px solid #deded9",
                      background:
                        "#f8f8f6",
                      color:
                        "#555",
                      padding:
                        "6px 9px",
                      cursor:
                        "pointer",
                      fontSize: 9
                    }}
                  >
                    + {color}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="admin-form-section">
          <div className="admin-section-label">
            IMAGES
          </div>

          <div className="admin-upload-box">
            <input
              id="product-image-upload"
              className="admin-file-input"
              type="file"
              accept="image/*"
              multiple
              onChange={uploadImages}
              disabled={
                uploadingImages ||
                saving
              }
            />

            <label
              htmlFor="product-image-upload"
              className="admin-upload-button"
            >
              {uploadingImages
                ? "UPLOADING..."
                : "UPLOAD PRODUCT IMAGES"}
            </label>

            <p className="admin-help">
              Choose one or more
              images from your
              computer. JPG, PNG
              and WEBP are
              supported. Maximum
              8MB per image. The
              first image is the
              primary product image.
            </p>
          </div>

          {splitValues(
            form.images
          ).length > 0 && (
            <div className="admin-image-grid">
              {splitValues(
                form.images
              ).map(
                (
                  image,
                  index
                ) => (
                  <div
                    className="admin-image-item"
                    key={`${image}-${index}`}
                  >
                    <img
                      src={image}
                      alt={`Product preview ${
                        index + 1
                      }`}
                    />

                    <div className="admin-image-overlay">
                      {index ===
                      0 ? (
                        <span className="admin-image-primary">
                          PRIMARY
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="admin-image-action"
                          onClick={() =>
                            makePrimary(
                              index
                            )
                          }
                        >
                          MAKE PRIMARY
                        </button>
                      )}

                      <button
                        type="button"
                        className="admin-image-remove"
                        onClick={() =>
                          removeImage(
                            index
                          )
                        }
                        aria-label={`Remove image ${
                          index + 1
                        }`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          <details className="admin-image-url-details">
            <summary>
              Use an image URL
              instead
            </summary>

            <label>
              IMAGE URLS

              <textarea
                value={form.images}
                onChange={event =>
                  update(
                    "images",
                    event.target.value
                  )
                }
                placeholder="https://... , https://..."
                rows={3}
              />
            </label>
          </details>
        </section>

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        <div className="admin-form-actions">
          <button
            type="button"
            className="admin-secondary-button"
            onClick={onCancel}
          >
            CANCEL
          </button>

          <button
            type="submit"
            className="admin-primary-button"
            disabled={saving}
          >
            <Save size={16} />

            {saving
              ? "SAVING..."
              : "SAVE PRODUCT"}
          </button>
        </div>
      </form>
    </div>
  );
}

function CategoryManager({
  categories,
  refresh
}) {
  const [form, setForm] =
    useState(EMPTY_CATEGORY);

  const [editing, setEditing] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const reset = () => {
    setForm(EMPTY_CATEGORY);
    setEditing(null);
    setError("");
  };

  const edit = category => {
    setEditing(category);

    setForm({
      name:
        category.name || "",

      slug:
        category.slug || "",

      description:
        category.description || "",

      image_url:
        category.image_url || "",

      sort_order:
        category.sort_order || 0,

      status:
        category.status ||
        "PUBLISHED"
    });
  };

  const submit = async event => {
    event.preventDefault();

    setSaving(true);
    setError("");

    const payload = {
      name:
        form.name.trim(),

      slug:
        form.slug.trim() ||
        slugify(form.name),

      description:
        form.description.trim() ||
        null,

      image_url:
        form.image_url.trim() ||
        null,

      sort_order:
        Number(form.sort_order) ||
        0,

      status:
        form.status,

      updated_at:
        new Date().toISOString()
    };

    let result;

    if (editing) {
      result =
        await supabase
          .from("categories")
          .update(payload)
          .eq(
            "id",
            editing.id
          );
    } else {
      result =
        await supabase
          .from("categories")
          .insert(payload);
    }

    if (result.error) {
      setError(
        result.error.message
      );
      setSaving(false);
      return;
    }

    reset();
    await refresh();

    setSaving(false);
  };

  const remove = async category => {
    const confirmed =
      window.confirm(
        `Delete "${category.name}"?`
      );

    if (!confirmed) return;

    const {
      error: deleteError
    } =
      await supabase
        .from("categories")
        .delete()
        .eq(
          "id",
          category.id
        );

    if (deleteError) {
      setError(
        deleteError.message
      );
      return;
    }

    await refresh();
  };

  return (
    <div className="admin-category-layout">
      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <span>
              CATALOGUE
            </span>

            <h2>
              Categories
            </h2>
          </div>
        </div>

        <div className="admin-list">
          {categories.map(
            category => (
              <div
                className="admin-list-row"
                key={category.id}
              >
                <div>
                  <strong>
                    {category.name}
                  </strong>

                  <small>
                    {category.slug}
                  </small>
                </div>

                <div className="admin-row-actions">
                  <button
                    onClick={() =>
                      edit(category)
                    }
                    className="admin-icon-button"
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    onClick={() =>
                      remove(category)
                    }
                    className="admin-icon-button danger"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <span>
              {editing
                ? "EDIT CATEGORY"
                : "NEW CATEGORY"}
            </span>

            <h2>
              {editing
                ? editing.name
                : "Add category"}
            </h2>
          </div>

          {editing && (
            <button
              className="admin-icon-button"
              onClick={reset}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <form
          className="admin-form"
          onSubmit={submit}
        >
          <label>
            NAME

            <input
              value={form.name}
              onChange={event =>
                setForm({
                  ...form,
                  name:
                    event.target.value
                })
              }
              required
            />
          </label>

          <label>
            SLUG

            <input
              value={form.slug}
              onChange={event =>
                setForm({
                  ...form,
                  slug:
                    event.target.value
                })
              }
              placeholder={slugify(
                form.name
              )}
            />
          </label>

          <label>
            DESCRIPTION

            <textarea
              value={
                form.description
              }
              onChange={event =>
                setForm({
                  ...form,
                  description:
                    event.target.value
                })
              }
              rows={4}
            />
          </label>

          <label>
            STATUS

            <select
              value={form.status}
              onChange={event =>
                setForm({
                  ...form,
                  status:
                    event.target.value
                })
              }
            >
              <option value="PUBLISHED">
                Published
              </option>

              <option value="DRAFT">
                Draft
              </option>

              <option value="ARCHIVED">
                Archived
              </option>
            </select>
          </label>

          {error && (
            <div className="admin-error">
              {error}
            </div>
          )}

          <button
            className="admin-primary-button"
            disabled={saving}
          >
            {saving
              ? "SAVING..."
              : editing
              ? "UPDATE CATEGORY"
              : "ADD CATEGORY"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default function Admin({
  user,
  navigate
}) {
  const [sessionUser, setSessionUser] =
    useState(user);

  const [checking, setChecking] =
    useState(true);

  const [isAdmin, setIsAdmin] =
    useState(false);

  const [products, setProducts] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [view, setView] =
    useState("dashboard");

  const [search, setSearch] =
    useState("");

  const [
    editingProduct,
    setEditingProduct
  ] = useState(null);

  const [resetMode, setResetMode] = useState(
    () => {
      const searchReset =
        new URLSearchParams(window.location.search).get("reset");

      const hashQuery =
        window.location.hash.includes("?")
          ? window.location.hash.split("?")[1]
          : "";

      const hashReset =
        new URLSearchParams(hashQuery).get("reset");

      return searchReset === "true" || hashReset === "true";
    }
  );

  const checkAdmin = async () => {
    setChecking(true);

    const {
      data: sessionData
    } =
      await supabase.auth.getSession();

    const currentUser =
      sessionData.session?.user ||
      null;

    setSessionUser(
      currentUser
    );

    if (!currentUser) {
      setIsAdmin(false);
      setChecking(false);
      return;
    }

    const {
      data: admin
    } =
      await supabase
        .from("admin_users")
        .select(
          "user_id, role"
        )
        .eq(
          "user_id",
          currentUser.id
        )
        .maybeSingle();

    setIsAdmin(
      Boolean(admin)
    );

    setChecking(false);
  };

  const loadData = async () => {
    setLoading(true);

    const [
      productsResult,
      categoriesResult
    ] =
      await Promise.all([
        supabase
          .from("products")
          .select(
            "*, categories(id, name, slug)"
          )
          .order(
            "created_at",
            {
              ascending: false
            }
          ),

        supabase
          .from("categories")
          .select("*")
          .order(
            "sort_order",
            {
              ascending: true
            }
          )
      ]);

    if (!productsResult.error) {
      setProducts(
        productsResult.data || []
      );
    }

    if (!categoriesResult.error) {
      setCategories(
        categoriesResult.data || []
      );
    }

    setLoading(false);
  };

 useEffect(() => {
  checkAdmin();

  const {
    data: { subscription }
  } = supabase.auth.onAuthStateChange(() => {
    checkAdmin();
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const filteredProducts =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      if (!term)
        return products;

      return products.filter(
        product =>
          product.name
            ?.toLowerCase()
            .includes(term) ||
          product.slug
            ?.toLowerCase()
            .includes(term) ||
          product.categories?.name
            ?.toLowerCase()
            .includes(term)
      );
    }, [
      products,
      search
    ]);

  const handleProductSaved =
    async () => {
      setEditingProduct(null);
      await loadData();
    };

  const deleteProduct =
    async product => {
      const confirmed =
        window.confirm(
          `Delete "${product.name}"? This cannot be undone.`
        );

      if (!confirmed)
        return;

      const {
        error
      } =
        await supabase
          .from("products")
          .delete()
          .eq(
            "id",
            product.id
          );

      if (error) {
        window.alert(
          error.message
        );
        return;
      }

      await loadData();
    };

  const signOut = async () => {
    await supabase.auth.signOut();

    setSessionUser(null);
    setIsAdmin(false);

    navigate("/");
  };

  if (resetMode) {
    return (
      <PasswordReset
        onComplete={() => {
          window.history.replaceState(
            {},
            "",
            "/admin/#/admin"
          );

          setResetMode(false);
        }}
      />
    );
  }

  if (checking) {
    return (
      <main className="admin-loading">
        <RefreshCw size={18} />

        Checking admin
        access...
      </main>
    );
  }

  if (
    !sessionUser ||
    !isAdmin
  ) {
    return (
      <AdminLogin
        onLoggedIn={loggedUser => {
          setSessionUser(
            loggedUser
          );

          setIsAdmin(true);
        }}
      />
    );
  }

  if (editingProduct) {
    return (
      <main className="admin-app">
        <ProductForm
          product={
            editingProduct
          }
          categories={
            categories
          }
          onSave={
            handleProductSaved
          }
          onCancel={() =>
            setEditingProduct(
              null
            )
          }
        />
      </main>
    );
  }

  return (
    <main className="admin-app">
      <header className="admin-header">
        <div className="admin-brand">
          <strong>
            PENCILBOY.
          </strong>

          <span>
            ADMIN
          </span>
        </div>

        <div className="admin-header-actions">
          <span>
            {sessionUser.email}
          </span>

          <button
            className="admin-secondary-button"
            onClick={signOut}
          >
            <LogOut size={15} />

            SIGN OUT
          </button>
        </div>
      </header>

      <div className="admin-body">
        <aside className="admin-sidebar">
          <button
            className={
              view ===
              "dashboard"
                ? "active"
                : ""
            }
            onClick={() =>
              setView(
                "dashboard"
              )
            }
          >
            <Activity size={17} />

            Dashboard
          </button>

          <button
            className={
              view ===
              "products"
                ? "active"
                : ""
            }
            onClick={() =>
              setView(
                "products"
              )
            }
          >
            <Package size={17} />

            Products
          </button>

          <button
            className={
              view ===
              "categories"
                ? "active"
                : ""
            }
            onClick={() =>
              setView(
                "categories"
              )
            }
          >
            <Tags size={17} />

            Categories
          </button>
        </aside>

        <section className="admin-content">
          {view ===
            "dashboard" && (
            <AdminDashboard />
          )}

          {view ===
            "products" && (
            <>
              <div className="admin-page-heading">
                <div>
                  <span>
                    CATALOGUE
                  </span>

                  <h1>
                    Products
                  </h1>

                  <p>
                    Manage
                    everything
                    customers
                    see in the
                    PENCILBOY
                    store.
                  </p>
                </div>

                <button
                  className="admin-primary-button"
                  onClick={() =>
                    setEditingProduct(
                      EMPTY_PRODUCT
                    )
                  }
                >
                  <Plus size={16} />

                  ADD PRODUCT
                </button>
              </div>

              <div className="admin-toolbar">
                <div className="admin-search">
                  <Search size={16} />

                  <input
                    placeholder="Search products..."
                    value={search}
                    onChange={event =>
                      setSearch(
                        event.target.value
                      )
                    }
                  />
                </div>

                <button
                  className="admin-icon-button"
                  onClick={loadData}
                  title="Refresh"
                >
                  <RefreshCw size={16} />
                </button>
              </div>

              {loading ? (
                <div className="admin-empty">
                  Loading
                  products...
                </div>
              ) : filteredProducts.length ===
                0 ? (
                <div className="admin-empty">
                  <Package size={24} />

                  <h3>
                    No products
                    found
                  </h3>

                  <p>
                    Add your
                    first
                    PENCILBOY
                    product.
                  </p>
                </div>
              ) : (
                <div className="admin-product-table">
                  <div className="admin-table-head">
                    <span>
                      PRODUCT
                    </span>

                    <span>
                      CATEGORY
                    </span>

                    <span>
                      PRICE
                    </span>

                    <span>
                      STOCK
                    </span>

                    <span>
                      STATUS
                    </span>

                    <span />
                  </div>

                  {filteredProducts.map(
                    product => (
                      <div
                        className="admin-table-row"
                        key={
                          product.id
                        }
                      >
                        <div className="admin-product-name">
                          {product.images?.[0] ? (
                            <img
                              src={
                                product.images[0]
                              }
                              alt=""
                            />
                          ) : (
                            <div className="admin-product-placeholder">
                              <Package size={16} />
                            </div>
                          )}

                          <div>
                            <strong>
                              {product.name}
                            </strong>

                            <small>
                              {product.slug}
                            </small>
                          </div>
                        </div>

                        <div>
                          {product.categories?.name ||
                            "—"}
                        </div>

                        <div>
                          {formatNaira(
                            product.price
                          )}
                        </div>

                        <div>
                          {product.stock}
                        </div>

                        <div>
                          <span
                            className={`admin-status admin-status-${String(
                              product.status ||
                                ""
                            ).toLowerCase()}`}
                          >
                            {product.status}
                          </span>
                        </div>

                        <div className="admin-row-actions">
                          <button
                            className="admin-icon-button"
                            onClick={() =>
                              setEditingProduct(
                                product
                              )
                            }
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            className="admin-icon-button danger"
                            onClick={() =>
                              deleteProduct(
                                product
                              )
                            }
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </>
          )}

          {view ===
            "categories" && (
            <CategoryManager
              categories={
                categories
              }
              refresh={
                loadData
              }
            />
          )}
        </section>
      </div>
    </main>
  );
}