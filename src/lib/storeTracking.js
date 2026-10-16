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

export async function trackEvent(
  eventType,
  options = {}
) {
  try {
    const sessionId = getSessionId();

    let userId = null;

    try {
      const { data } =
        await supabase.auth.getUser();

      userId = data?.user?.id || null;
    } catch {
      userId = null;
    }

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

export async function trackVisitor() {
  return trackEvent("VISITOR");
}

export async function trackProductView(
  productId
) {
  if (!productId) return false;

  return trackEvent("PRODUCT_VIEW", {
    productId,
  });
}

export async function trackCartAdd(
  productId,
  quantity = 1
) {
  if (!productId) return false;

  return trackEvent("CART_ADD", {
    productId,
    metadata: {
      quantity: Number(quantity) || 1,
    },
  });
}

export async function trackLike(productId) {
  if (!productId) return false;

  return trackEvent("LIKE", {
    productId,
  });
}

export async function trackUnlike(productId) {
  if (!productId) return false;

  return trackEvent("UNLIKE", {
    productId,
  });
}