import { supabase } from "./supabase";

export async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("status", "PUBLISHED")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchPublishedProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("status", "PUBLISHED")
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data || []).map((product) => ({
    ...product,
    category: product.categories?.name || product.category || "",
    category_slug: product.categories?.slug || "",
  }));
}
