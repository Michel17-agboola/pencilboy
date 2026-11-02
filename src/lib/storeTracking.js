import { supabase } from "./supabase";

const SESSION_KEY = "pencilboy_session_id";

function createSessionId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `session_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}

export function getSessionId() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    let sessionId = localStorage.getItem(SESSION_KEY);

    if (!sessionId) {
      sessionId = createSessionId();
      localStorage.setItem(SESSION_KEY, sessionId);
    }

    return sessionId;
  } catch {
    return null;
  }
}

async function getCurrentUserId() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user?.id || null;
  } catch {
    return null;
  }
}

/**
 * Generic storefront event tracker.
 *
 * Supported events currently include:
 * VISITOR
 * PRODUCT_VIEW
 * CART_ADD
 * LIKE
 * UNLIKE
 */
export async function trackEvent(eventType, options = {}) {
  if (!eventType) {
    return false;
  }

  try {
    const sessionId = getSessionId();
    const userId = await getCurrentUserId();

    const payload = {
      event_type: eventType,
      product_id: options.productId || null,
      session_id: sessionId,
      user_id: userId,
      metadata: options.metadata || {},
    };

    const { error } = await supabase
      .from("store_events")
      .insert(payload);

    if (error) {
      console.warn(
        `PENCILBOY tracking (${eventType}):`,
        error.message
      );

      return false;
    }

    return true;
  } catch (error) {
    console.warn(
      `PENCILBOY tracking (${eventType}):`,
      error
    );

    return false;
  }
}

/**
 * Track a storefront visitor.
 */
export async function trackVisitor() {
  return trackEvent("VISITOR");
}

/**
 * Track a product page view.
 */
export async function trackProductView(productId) {
  if (!productId) {
    return false;
  }

  return trackEvent("PRODUCT_VIEW", {
    productId,
  });
}

/**
 * Track an item being added to cart.
 */
export async function trackCartAdd(
  productId,
  quantity = 1
) {
  if (!productId) {
    return false;
  }

  return trackEvent("CART_ADD", {
    productId,
    metadata: {
      quantity: Number(quantity) || 1,
    },
  });
}

/*
 * -------------------------------------------------------
 * PRODUCT LIKES
 * -------------------------------------------------------
 *
 * Authenticated users:
 *   - Likes are persisted in product_likes.
 *
 * Guests:
 *   - The actual saved/liked state remains localStorage
 *     controlled by the storefront.
 *   - Analytics events may still be recorded in
 *     store_events when Supabase permits the insert.
 *
 * IMPORTANT:
 * The function only returns true when the actual
 * requested operation succeeds.
 */

/**
 * Save/like a product.
 */
export async function saveProductLike(productId) {
  if (!productId) {
    return false;
  }

  try {
    const userId = await getCurrentUserId();

    /*
     * Guest users:
     *
     * The App/localStorage controls the actual saved
     * product state. We only record the analytics event
     * here.
     */
    if (!userId) {
      await trackEvent("LIKE", {
        productId,
      });

      return true;
    }

    /*
     * Authenticated users:
     * Persist the like in Supabase.
     */
    const { error } = await supabase
      .from("product_likes")
      .upsert(
        {
          product_id: productId,
          user_id: userId,
        },
        {
          onConflict: "user_id,product_id",
          ignoreDuplicates: true,
        }
      );

    if (error) {
      console.warn(
        "PENCILBOY like save:",
        error.message
      );

      return false;
    }

    /*
     * Record analytics separately.
     * Failure here should not undo an already successful
     * persistent like.
     */
    await trackEvent("LIKE", {
      productId,
    });

    return true;
  } catch (error) {
    console.warn(
      "PENCILBOY like save:",
      error
    );

    return false;
  }
}

/**
 * Remove/unlike a product.
 */
export async function removeProductLike(productId) {
  if (!productId) {
    return false;
  }

  try {
    const userId = await getCurrentUserId();

    /*
     * Guest users:
     *
     * The actual saved state is controlled by the
     * storefront/localStorage.
     */
    if (!userId) {
      await trackEvent("UNLIKE", {
        productId,
      });

      return true;
    }

    /*
     * Authenticated users:
     * Remove the persistent Supabase like.
     */
    const { error } = await supabase
      .from("product_likes")
      .delete()
      .eq("product_id", productId)
      .eq("user_id", userId);

    if (error) {
      console.warn(
        "PENCILBOY like removal:",
        error.message
      );

      return false;
    }

    /*
     * Record the unlike event.
     */
    await trackEvent("UNLIKE", {
      productId,
    });

    return true;
  } catch (error) {
    console.warn(
      "PENCILBOY like removal:",
      error
    );

    return false;
  }
}

/*
 * -------------------------------------------------------
 * BACKWARDS-COMPATIBLE HELPERS
 * -------------------------------------------------------
 */

export async function trackLike(productId) {
  if (!productId) {
    return false;
  }

  return trackEvent("LIKE", {
    productId,
  });
}

export async function trackUnlike(productId) {
  if (!productId) {
    return false;
  }

  return trackEvent("UNLIKE", {
    productId,
  });
}