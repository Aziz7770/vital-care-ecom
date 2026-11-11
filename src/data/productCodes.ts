// Neutral product codes for ad/analytics tracking.
// Real product IDs contain medicine names (which reveal health conditions),
// so tracking only ever sees these opaque codes. Add a new code for every new product.
export const PRODUCT_CODES: Record<string, string> = {
  "arnica-montana-30": "BHC-001",
  "china-q": "BHC-002",
  "calc-phos-6x": "BHC-003",
  "sulphur-200": "BHC-004",
  "graphites-30": "BHC-005",
  "thuja-200": "BHC-006",
  "berberis-aquifolium-q": "BHC-007",
  "jaborandi-q": "BHC-008",
  "acid-phos-q": "BHC-009",
  "nux-vomica-30": "BHC-010",
  "carbo-veg-30": "BHC-011",
  "chelidonium-q": "BHC-012",
  "phosphorus-30": "BHC-013",
  "bryonia-30": "BHC-014",
  "justicia-adhatoda-q": "BHC-015",
  "hamamelis-q": "BHC-016",
  "pulsatilla-30": "BHC-017",
  "calc-flour-6x": "BHC-018",
  "lycopodium-q": "BHC-019",
  "damiana-1x": "BHC-020",
  "cydonia-vulgaris-q": "BHC-021",
  "gynecomastia-combo": "BHC-022",
  "hip-thigh-combo": "BHC-023",
  "varicocele-combo": "BHC-024",
};

/** Opaque code for tracking; unknown products still get a neutral code so Purchase always fires. */
export function productCode(productId: string): string {
  return PRODUCT_CODES[productId] ?? "BHC-000";
}
