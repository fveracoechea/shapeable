import { RefObject } from "./types";

export function isFunction(val: any): val is () => {} {
  return typeof val === "function";
}

export function isObject(val: any): val is Record<string, unknown> {
  return typeof val === "object" && val !== null;
}

export function isArrayLike(obj: unknown): obj is ArrayLike<any> {
  return (
    isObject(obj) &&
    "length" in obj &&
    typeof obj.length === "number" &&
    "nodeType" in obj &&
    typeof obj.nodeType !== "number"
  );
}

export function isRef<T = Node>(ref: unknown): ref is RefObject<T> {
  return isObject(ref) && "current" in ref;
}

/**
 * CSS properties which accept numbers but are not in units of "px".
 */
export const isUnitlessNumber: Record<string, true> = {
  animationIterationCount: true,
  borderImageOutset: true,
  borderImageSlice: true,
  borderImageWidth: true,
  boxFlex: true,
  boxFlexGroup: true,
  boxOrdinalGroup: true,
  columnCount: true,
  columns: true,
  flex: true,
  flexGrow: true,
  flexPositive: true,
  flexShrink: true,
  flexNegative: true,
  flexOrder: true,
  gridArea: true,
  gridRow: true,
  gridRowEnd: true,
  gridRowSpan: true,
  gridRowStart: true,
  gridColumn: true,
  gridColumnEnd: true,
  gridColumnSpan: true,
  gridColumnStart: true,
  fontWeight: true,
  lineClamp: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  tabSize: true,
  widows: true,
  zIndex: true,
  zoom: true,

  // SVG-related properties
  fillOpacity: true,
  floodOpacity: true,
  stopOpacity: true,
  strokeDasharray: true,
  strokeDashoffset: true,
  strokeMiterlimit: true,
  strokeOpacity: true,
  strokeWidth: true,
};
