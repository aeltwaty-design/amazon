import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// tailwind-merge so a later utility wins instead of both landing in `class`.
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
