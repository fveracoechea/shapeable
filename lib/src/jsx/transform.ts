import { isFunction, isObject, isRef, isUnitlessNumber } from "./helpers";
import { RefObject, StyleInput } from "./types";

function appendChildren(node: JSX.Element, children: JSX.Children) {
  if (!children) return;

  if (children instanceof HTMLElement || children instanceof DocumentFragment) {
    node.appendChild(children);
  } else if (
    typeof children === "string" ||
    children === true ||
    typeof children === "number"
  ) {
    node.appendChild(document.createTextNode(String(children)));
    return;
  }

  const isMoreThanOne =
    Array.isArray(children) ||
    children instanceof NodeList ||
    children instanceof HTMLCollection;

  if (isMoreThanOne) {
    for (const child of children) appendChildren(node, child);
  }
}

function setStyles(node: HTMLElement, styles: StyleInput) {
  if (!styles) return;
  else if (Array.isArray(styles)) {
    for (const style of styles) {
      setStyles(node, style);
    }
  } else if (typeof styles === "string") {
    node.setAttribute("style", styles);
  } else if (isObject(styles)) {
    for (const key in styles) {
      if (!Object.prototype.hasOwnProperty.call(styles, key)) continue;
      const style = styles[key];

      if (key.indexOf("-") === 0) {
        // CSS custom properties (variables) start with `-` (e.g. `--my-variable`)
        // and must be assigned via `setProperty`.
        node.style.setProperty(key, String(style));
      } else if (typeof style === "number" && isUnitlessNumber[key]) {
        (node.style as any)[key] = style + "px";
      } else {
        (node.style as any)[key] = style;
      }
    }
  }
}

export function getClassNames(classNames: JSX.ClassNames): string {
  if (Array.isArray(classNames)) {
    let classes = "";
    for (const className of classNames) {
      const result = getClassNames(className);
      classes += ` ${result}`;
    }
    return classes.trim();
  }

  if (isObject(classNames)) {
    let classes = "";
    for (const className in classNames) {
      if (!Object.prototype.hasOwnProperty.call(classNames, className)) {
        continue;
      }
      const result = classNames[className];
      if (result) classes += ` ${className}`;
    }
    return classes.trim();
  }

  if (typeof classNames === "string") {
    return classNames.trim();
  }

  return "";
}

export const Fragment = Symbol.for("DocumentFragment");

export function createElement(
  tag: string | symbol | JSX.FunctionComponent,
  props: {
    style?: StyleInput;
    class?: JSX.ClassNames;
    children?: JSX.Children;
    ref?: RefObject<HTMLElement>;
    [x: string]: unknown;
  }
) {
  if (typeof tag === "function") return tag(props);

  const node =
    typeof tag === "symbol" && tag === Fragment
      ? document.createDocumentFragment()
      : document.createElement(tag as string);

  appendChildren(node, props.children);
  if (node instanceof DocumentFragment) return node;

  if (props.ref && isRef(props.ref)) props.ref.current = node;
  if (props.style) setStyles(node, props.style);
  if (props.class) node.setAttribute("class", getClassNames(props.class));

  for (const key in props) {
    if (
      !Object.prototype.hasOwnProperty.call(props, key) ||
      key === "children" ||
      key === "ref" ||
      key === "style" ||
      key === "class"
    ) {
      continue;
    }

    const prop = props[key];

    if (prop === true || prop === "") {
      node.setAttribute(key, "");
    } else if (isObject(prop)) {
      Object.defineProperty(node, key, {
        enumerable: true,
        writable: false,
        configurable: false,
        value: prop,
      });
    } else if (isFunction(prop) && key[0] === "o" && key[1] === "n") {
      let attribute = key.toLowerCase();
      const useCapture = attribute.endsWith("capture");

      if (attribute === "ondoubleclick") {
        attribute = "ondblclick";
      } else if (useCapture && attribute === "ondoubleclickcapture") {
        attribute = "ondblclickcapture";
      }

      if (!useCapture && (node as any)[attribute] === null) {
        // use property when possible, for DOM diffing
        (node as any)[attribute] = prop;
      } else if (useCapture) {
        node.addEventListener(
          attribute.substring(2, attribute.length - 7),
          prop,
          true
        );
      } else {
        let eventName;
        if (attribute in window) {
          // standard event
          // the JSX attribute could have been "onMouseOver" and the
          // member name "onmouseover" is on the window's prototype
          // so let's add the listener "mouseover", which is all lowercased
          const standardEventName = attribute.substring(2);
          eventName = standardEventName;
        } else {
          // custom event
          // the JSX attribute could have been "onMyCustomEvent"
          // so let's trim off the "on" prefix and lowercase the first character
          // and add the listener "myCustomEvent"
          // except for the first character, we keep the event name case
          const customEventName = attribute[2] + key.slice(3);
          eventName = customEventName;
        }
        node.addEventListener(eventName, prop);
      }
    } else if (prop) {
      node.setAttribute(key, String(prop));
    }
  }

  return node;
}

export const JSX = {
  createElement,
  Fragment,
};
