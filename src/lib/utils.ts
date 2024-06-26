import { type ClassValue, clsx } from "clsx"
import type { Metadata } from "next";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPrice = (price: number, currency: 'EGP' | 'USD') => {
  const formatter = new Intl.NumberFormat(currency === 'EGP' ? 'ar-EG' : 'en-US', {
    style: "currency",
    currency: currency
  });

  return formatter.format(price);
};


export function constructMetadata({
  title = 'CobraCover',
  description = 'Create custom high-quality phone cases in seconds',
  image = '/thumbnail.jpg',
  icons = '/favicon.ico',
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@MohamedAlaa',
    },
    icons,
    metadataBase: new URL("https://cobracover.vercel.app/")
  }
}