export interface GuestTier {
  guests: number;
  price: number | null; // null = custom pricing
  label: string;
  priceLabel: string;
}

export const GUEST_TIERS: GuestTier[] = [
  { guests: 10, price: 0, label: "Up to 10 guests", priceLabel: "Free" },
  { guests: 25, price: 500, label: "Up to 25 guests", priceLabel: "500 Birr" },
  { guests: 50, price: 1000, label: "Up to 50 guests", priceLabel: "1,000 Birr" },
  { guests: 100, price: 1500, label: "Up to 100 guests", priceLabel: "1,500 Birr" },
  { guests: 150, price: 2000, label: "Up to 150 guests", priceLabel: "2,000 Birr" },
  { guests: 200, price: 3000, label: "Up to 200 guests", priceLabel: "3,000 Birr" },
  { guests: 201, price: null, label: "More than 200 guests", priceLabel: "Custom price" },
];

export const tierFor = (guests: number): GuestTier =>
  GUEST_TIERS.find((t) => t.guests === guests) ?? GUEST_TIERS[0];

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
