import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function hariIniWIB() {
  const date = new Date();
  const wibOffset = 7 * 60; // UTC+7
  const localOffset = date.getTimezoneOffset();
  const wibTime = new Date(date.getTime() + (wibOffset + localOffset) * 60000);
  return wibTime.toISOString().split('T')[0];
}
