/** Local payment options for a Bangladeshi rider. Stored as plain text. */
export const PAYMENT_METHODS = ['Cash', 'bKash', 'Nagad', 'Card', 'Bank'] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export function paymentMethodFromStored(value: string | null): PaymentMethod | null {
  if (value && (PAYMENT_METHODS as readonly string[]).includes(value)) {
    return value as PaymentMethod;
  }
  return null;
}
