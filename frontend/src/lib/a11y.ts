export function announce(message: string) {
  if (typeof window === "undefined") return;

  let node = document.getElementById("setu-live-region");
  if (!node) {
    node = document.createElement("div");
    node.id = "setu-live-region";
    node.setAttribute("aria-live", "polite");
    node.setAttribute("aria-atomic", "true");
    node.style.position = "absolute";
    node.style.width = "1px";
    node.style.height = "1px";
    node.style.overflow = "hidden";
    node.style.clip = "rect(0 0 0 0)";
    document.body.appendChild(node);
  }

  node.textContent = "";
  window.setTimeout(() => {
    if (node) node.textContent = message;
  }, 20);
}

export function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}
