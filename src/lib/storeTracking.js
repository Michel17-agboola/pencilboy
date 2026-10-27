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
    let sessionId =
      localStorage.getItem(SESSION_KEY);

    if (!sessionId) {
      sessionId = createSessionId();

      localStorage.setItem(
        SESSION_KEY,
        sessionId
      );
    }

    return sessionId;
  } catch {
    return null;
  }
}

async function getCurrentUserId() {
  try {
    const { data } =
      await supabase.auth.getUser();

    return data?.user?.id || null;
  } catch {
    return null;
  }
}

export async function trackEvent(
  eventType,
  options = {}
) {
  try {
    const sessionId = getSessionId();
    const userId =
      await getCurrentUserId();

    const payload = {
      event_type: eventType,
      product_id:
        options.productId || null,
      session_id: sessionId,
      user_id: userId,
      metadata:
        options.metadata || {},
    };

    const { error } =
      await supabase
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

export async function trackVisitor() {
  return trackEvent("VISITOR");
}

export async function trackProductView(
  productId
) {
  if (!productId) {
    return false;
  }

  return trackEvent(
    "PRODUCT_VIEW",
    {
      productId,
    }
  );
}

export async function trackCartAdd(
  productId,
  quantity = 1
) {
  if (!productId) {
    return false;
  }

  return trackEvent(
    "CART_ADD",
    {
      productId,
      metadata: {
        quantity:
          Number(quantity) || 1,
      },
    }
  );
}

/*
 * -------------------------------------------------------
 * PERSISTENT PRODUCT LIKES
 * -------------------------------------------------------
 *
 * Likes are stored in Supabase so the Admin Dashboard
 * can see the real number of active likes.
 */

export async function saveProductLike(productId) {
  if (!productId) {
    return false;
  }

  try {
    const userId = await getCurrentUserId();

    /*
     * Guests keep saved products locally.
     * Do not persist guest likes to Supabase because
     * client-generated session IDs are not a trusted
     * security boundary.
     */
    if (!userId) {
      await trackEvent("LIKE", {
        productId,
      });

      return true;
    }

    const payload = {
      product_id: productId,
      user_id: userId,
    };

    const { error } = await supabase
      .from("product_likes")
      .insert(payload);

    /*
     * If the like already exists, don't treat it
     * as a fatal error.
     */
    if (
      error &&
      !String(error.message || "")
        .toLowerCase()
        .includes("duplicate")
    ) {
      console.warn(
        "PENCILBOY like save:",
        error.message
      );

      return false;
    }

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

export async function removeProductLike(productId) {
  if (!productId) {
    return false;
  }

  try {
    const userId = await getCurrentUserId();

    /*
     * Guests keep saved products locally.
     * There is no Supabase row to remove.
     */
    if (!userId) {
      await trackEvent("UNLIKE", {
        productId,
      });

      return true;
    }

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
 * Backwards-compatible tracking helpers.
 */

export async function trackLike(
  productId
) {
  return trackEvent(
    "LIKE",
    {
      productId,
    }
  );
}

export async function trackUnlike(
  productId
) {
  return trackEvent(
    "UNLIKE",
    {
      productId,
    }
  );
}