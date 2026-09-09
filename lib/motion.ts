// The single GSAP registration and token-reading seam. Every animation reads
// its durations, distances and easings from styles/tokens.css through these
// helpers, so design edits the tokens and the code follows.
import 'client-only';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger, Flip, CustomEase);

export { gsap, useGSAP, ScrollTrigger, Flip };

const rootStyle = (): CSSStyleDeclaration => getComputedStyle(document.documentElement);

const token = (name: string): string => rootStyle().getPropertyValue(name).trim();

// GSAP works in seconds; tokens are authored in ms or s.
export function readSeconds(name: string): number {
  const raw = token(name);
  const value = parseFloat(raw);
  if (Number.isNaN(value)) return 0;
  return raw.endsWith('ms') ? value / 1000 : value;
}

export function readPx(name: string): number {
  const value = parseFloat(token(name));
  return Number.isNaN(value) ? 0 : value;
}

export const msToSeconds = (ms: number): number => ms / 1000;

const EASE_TOKENS = {
  outCubic: '--ease-out-cubic',
  outExpo: '--ease-out-expo',
  spring: '--ease-spring',
} as const;
export type EaseKey = keyof typeof EASE_TOKENS;

const registered = new Map<EaseKey, string>();

// Turns a cubic-bezier() token into a named CustomEase once, so the CSS and
// GSAP curves cannot diverge.
export function ease(key: EaseKey): string {
  const existing = registered.get(key);
  if (existing) return existing;
  const id = `tok-${key}`;
  const numbers = token(EASE_TOKENS[key]).match(/-?\d*\.?\d+/g);
  if (numbers && numbers.length === 4) {
    CustomEase.create(id, numbers.join(','));
    registered.set(key, id);
    return id;
  }
  return 'power3.out';
}

export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
