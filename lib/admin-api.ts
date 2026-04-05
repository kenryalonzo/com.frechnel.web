"use client";

/** En-têtes Authorization pour les appels API réservés à l’admin (client uniquement). */
export function getAdminAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("admin_token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
