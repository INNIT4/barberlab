export function buildWhatsAppUrl(
  phone: string | null | undefined,
  message: string
): string | null {
  if (!phone) return null;
  const clean = phone.replace(/\D/g, "");
  if (clean.length < 8) return null;
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function formatPhoneForDisplay(
  phone: string | null | undefined
): string | null {
  if (!phone) return null;
  return phone.trim();
}
