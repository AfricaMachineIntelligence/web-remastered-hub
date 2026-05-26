import { useEffect } from "react";

/**
 * Snap-scrolls between top-level sections on wheel / arrow keys / PageUp/Down / Space.
 * - Skips snapping when the current section is taller than the viewport AND the user
 *   hasn't yet reached its top/bottom edge — letting them scroll its inner content first.
 * - Respects an offset (e.g. fixed nav height).
 */
export function useSectionSnap(
  selector: string,
  options: { offset?: number; cooldownMs?: number; edgeThreshold?: number } = {}
) {
  const { offset = 64, cooldownMs = 700, edgeThreshold = 4 } = options;

  useEffect(() => {
    let lockedUntil = 0;
    let rafId: number | null = null;

    const getSections = () =>
      Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(
        (el) => el.offsetParent !== null
      );

    const currentIndex = (sections: HTMLElement[]) => {
      const probe = window.scrollY + offset + 8;
      let idx = 0;
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].offsetTop <= probe) idx = i;
        else break;
      }
      return idx;
    };

    const scrollToIndex = (sections: HTMLElement[], idx: number) => {
      const clamped = Math.max(0, Math.min(sections.length - 1, idx));
      const target = sections[clamped].offsetTop - offset;
      lockedUntil = performance.now() + cooldownMs;
      window.scrollTo({ top: target, behavior: "smooth" });
    };

    const tryAdvance = (direction: 1 | -1) => {
      if (performance.now() < lockedUntil) return true;
      const sections = getSections();
      if (sections.length === 0) return false;
      const idx = currentIndex(sections);
      const section = sections[idx];
      const sectionTop = section.offsetTop - offset;
      const sectionBottom = sectionTop + section.offsetHeight;
      const viewportBottom = window.scrollY + window.innerHeight;
      const sectionTallerThanViewport =
        section.offsetHeight > window.innerHeight - offset;

      if (sectionTallerThanViewport) {
        if (direction === 1) {
          // Only snap to next when we're at/near the bottom of this section
          if (viewportBottom < sectionBottom - edgeThreshold) return false;
        } else {
          // Only snap to previous when we're at/near the top of this section
          if (window.scrollY > sectionTop + edgeThreshold) return false;
        }
      }

      scrollToIndex(sections, idx + direction);
      return true;
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch-zoom
      const dy = e.deltaY;
      if (Math.abs(dy) < 4) return;
      const direction: 1 | -1 = dy > 0 ? 1 : -1;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const handled = tryAdvance(direction);
        if (handled) e.preventDefault();
      });
      // Try synchronous prevent so the browser doesn't also scroll on snap
      const sections = getSections();
      if (sections.length > 0 && performance.now() >= lockedUntil) {
        const idx = currentIndex(sections);
        const section = sections[idx];
        const sectionTop = section.offsetTop - offset;
        const sectionBottom = sectionTop + section.offsetHeight;
        const viewportBottom = window.scrollY + window.innerHeight;
        const tall = section.offsetHeight > window.innerHeight - offset;
        const willSnap = !tall ||
          (direction === 1
            ? viewportBottom >= sectionBottom - edgeThreshold
            : window.scrollY <= sectionTop + edgeThreshold);
        if (willSnap) e.preventDefault();
      }
    };

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      )
        return;

      let direction: 1 | -1 | 0 = 0;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") direction = 1;
      else if (e.key === "ArrowUp" || e.key === "PageUp") direction = -1;
      else if (e.key === "Home") {
        e.preventDefault();
        const sections = getSections();
        if (sections.length) scrollToIndex(sections, 0);
        return;
      } else if (e.key === "End") {
        e.preventDefault();
        const sections = getSections();
        if (sections.length) scrollToIndex(sections, sections.length - 1);
        return;
      } else return;

      const handled = tryAdvance(direction);
      if (handled) e.preventDefault();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [selector, offset, cooldownMs, edgeThreshold]);
}
