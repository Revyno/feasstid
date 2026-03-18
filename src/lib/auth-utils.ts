
export function getCustomerSession() {
  if (typeof window === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("customer="));
  
  if (!cookie) return null;
  
  try {
    const value = decodeURIComponent(cookie.split("=")[1]);
    return JSON.parse(value);
  } catch (e) {
    console.error("Failed to parse customer session", e);
    return null;
  }
}
