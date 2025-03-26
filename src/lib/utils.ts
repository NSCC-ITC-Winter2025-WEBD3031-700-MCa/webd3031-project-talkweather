import { type ClassValue, clsx } from "clsx";
import { formatDistanceToNow, formatDate } from "date-fns";
import { twMerge } from "tailwind-merge";
import { Stripe, loadStripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

export default getStripe;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formateRelativeDate = (from: Date) => {
  const currentDate = new Date();
  if (currentDate.getTime() - from.getTime() < 24 * 60 * 60 * 1000) {
    return formatDistanceToNow(from, {
      addSuffix: true,
    });
  } else {
    if (currentDate.getFullYear() === from.getFullYear()) {
      return formatDate(from, "MMM dd");
    } else {
      return formatDate(from, "MMM dd, yyyy");
    }
  }
};

export const formatNumber = (number: number) => {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(number);
};
