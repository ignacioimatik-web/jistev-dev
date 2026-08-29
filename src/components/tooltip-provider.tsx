"use client";

import { useEffect } from "react";

/**
 * Tooltip flotante global que sigue al cursor.
 * Escucha por delegación cualquier elemento con [data-title], [data-body], [data-tags].
 * El DOM del tip vive en globals.css (#tip).
 */
export function TooltipProvider() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const tip = document.createElement("div");
    tip.id = "tip";
    tip.innerHTML =
      '<span class="t-title"></span><div class="t-body"></div><div class="t-tags"></div>';
    document.body.appendChild(tip);

    const moveTip = (e: MouseEvent) => {
      const pad = 18;
      const gap = 14;
      let x = e.clientX + gap;
      let y = e.clientY + gap;
      tip.style.left = x + "px";
      tip.style.top = y + "px";
      const r = tip.getBoundingClientRect();
      if (x + r.width > window.innerWidth - pad)
        x = e.clientX - r.width - gap;
      if (y + r.height > window.innerHeight - pad)
        y = e.clientY - r.height - gap;
      tip.style.left = x + "px";
      tip.style.top = y + "px";
    };

    const showTip = (el: Element) => {
      const title = el.getAttribute("data-title") || "";
      const body = el.getAttribute("data-body") || "";
      const tags = (el.getAttribute("data-tags") || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      tip.querySelector(".t-title")!.textContent = "▸ " + title;
      tip.querySelector(".t-body")!.textContent = body;
      const tagWrap = tip.querySelector(".t-tags")!;
      tagWrap.innerHTML = "";
      tags.forEach((t) => {
        const s = document.createElement("span");
        s.className = "t-tag";
        s.textContent = t;
        tagWrap.appendChild(s);
      });
      tip.classList.add("show");
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = (e.target as Element).closest?.("[data-title]");
      if (target) {
        showTip(target);
        window.addEventListener("mousemove", moveTip);
      }
    };
    const onMouseOut = (e: MouseEvent) => {
      const from = (e.target as Element);
      const to = (e.relatedTarget as Element) || null;
      // si seguimos dentro del mismo elemento sensitivo, no ocultar
      if (to && from.closest?.("[data-title]") && to.closest?.("[data-title]") === from.closest("[data-title]")) {
        return;
      }
      const target = from.closest?.("[data-title]");
      if (target) {
        tip.classList.remove("show");
        window.removeEventListener("mousemove", moveTip);
      }
    };

    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);

    return () => {
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("mousemove", moveTip);
      tip.remove();
    };
  }, []);

  return null;
}