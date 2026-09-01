export interface GuestTier {
  guests: number;
  price: number | null; // null = custom pricing
  label: string;
  priceLabel: string;
}

export const GUEST_TIERS: GuestTier[] = [
  { guests: 10, price: 0, label: "Up to 10 guests", priceLabel: "Free" },
  { guests: 25, price: 2500, label: "Up to 25 guests", priceLabel: "2,500 Birr" },
  { guests: 50, price: 3000, label: "Up to 50 guests", priceLabel: "3,000 Birr" },
  { guests: 100, price: 3500, label: "Up to 100 guests", priceLabel: "3,500 Birr" },
  { guests: 150, price: 4000, label: "Up to 150 guests", priceLabel: "4,000 Birr" },
  { guests: 200, price: 5000, label: "Up to 200 guests", priceLabel: "5,000 Birr" },
  { guests: 201, price: null, label: "More than 200 guests", priceLabel: "Custom price" },
];

export const tierFor = (guests: number): GuestTier =>
  GUEST_TIERS.find((t) => t.guests === guests) ?? GUEST_TIERS[0];

export interface PhotoTier {
  photos: number;
  price: number;
  label: string;
}

/** Photos/videos each guest may upload. 30 means unlimited (30+). */
export const PHOTO_TIERS: PhotoTier[] = [
  { photos: 5, price: 0, label: "5" },
  { photos: 10, price: 300, label: "10" },
  { photos: 20, price: 500, label: "20" },
  { photos: 30, price: 800, label: "30+" },
];

export const photoTierFor = (photos: number): PhotoTier =>
  PHOTO_TIERS.find((t) => t.photos === photos) ?? PHOTO_TIERS[0];

export const UNLIMITED_PHOTOS = 30;

/** Total plan price; null when the guest tier requires a custom quote. */
export const totalPrice = (guests: number, photos: number): number | null => {
  const g = tierFor(guests);
  if (g.price === null) return null;
  return g.price + photoTierFor(photos).price;
};


export const SALES_PHONE = "+251944010908";

export const PAYMENT_METHODS = [
  {
    key: "telebirr",
    name: "Telebirr",
    fields: [
      { label: "Phone number", value: "+251944010908" },
      { label: "Account name", value: "Amanuel Ayalkebet" },
    ],
  },
  {
    key: "abyssinia",
    name: "Bank of Abyssinia",
    fields: [
      { label: "Account number", value: "247628398" },
      { label: "Account name", value: "VION Events" },
    ],
  },
] as const;
