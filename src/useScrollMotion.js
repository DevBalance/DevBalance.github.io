import { useEffect } from "react";

const clamp = (value) => Math.max(0, Math.min(1, value));

// Read stable layout containers, then write only transform variables.
// No React renders on scroll; native anchor scrolling drives the same progress.
export function useScrollMotion(
  productRef,
  teamRef,
  portfolioRef,
  referencesRef,
  aboutRef,
  servicesRef,
) {
  useEffect(() => {
    const product = productRef.current;
    const team = teamRef.current;
    const portfolio = portfolioRef.current;
    const references = referencesRef.current;
    const about = aboutRef.current;
    const services = servicesRef.current;
    const stage = product.querySelector(".product-stage");
    const cards = [...team.children];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const height = innerHeight;
      const productTop = stage.getBoundingClientRect().top;
      const teamBox = team.getBoundingClientRect();
      const portfolioBox = portfolio.getBoundingClientRect();
      const referencesBox = references.getBoundingClientRect();
      const aboutBox = about.getBoundingClientRect();
      const servicesBox = services.getBoundingClientRect();
      const aboutParts = [...about.children].map((part, index) => ({
        part,
        top: part.offsetTop,
        distance:
          index === 0
            ? -(aboutBox.left + part.offsetLeft + part.offsetWidth)
            : innerWidth - aboutBox.left - part.offsetLeft,
      }));
      const mobile = innerWidth <= 760;
      const positions = cards.map((card) => card.offsetTop);
      const columns = cards.map((card) => card.offsetLeft);
      const projects = [...portfolio.children].map((card) => ({
        card,
        top: card.offsetTop,
      }));
      const quotes = [...references.children].map((card) => ({
        card,
        top: card.offsetTop,
        centerOffset:
          (referencesBox.width - card.offsetWidth) / 2 - card.offsetLeft,
      }));
      const offerings = [...services.children].map((card) => ({
        card,
        top: card.offsetTop,
      }));
      // Begin at 70% of the previous .86 starting scale; reach full size at
      // the native anchor destination. Scroll and enlargement share progress.
      const productStartScale = 0.86 * 0.7;
      const productProgress = clamp(
        scrollY / Math.max(1, productTop + scrollY - 120),
      );
      stage.style.setProperty(
        "--product-scale",
        reduced.matches
          ? 1
          : productStartScale + (1 - productStartScale) * productProgress,
      );
      cards.forEach((card, index) => {
        // Roman anchors the stack; his colleagues slide out into their columns.
        const progress = clamp(
          (height * 0.95 - teamBox.top - positions[index]) / (height * 0.5) -
            (mobile ? 0 : index * 0.06),
        );
        const remaining = reduced.matches ? 0 : 1 - progress;
        const offset = mobile ? 0 : (columns[0] - columns[index]) * remaining;
        card.style.setProperty("--team-x", `${offset}px`);
        card.style.setProperty("--team-y", `${mobile ? 32 * remaining : 0}px`);
      });
      projects.forEach(({ card, top }, index) => {
        const progress = clamp(
          (height * 0.95 - portfolioBox.top - top) / (height * 0.5) -
            (mobile ? 0 : (index % 2) * 0.12),
        );
        const remaining = reduced.matches ? 0 : 1 - progress;
        card.style.setProperty("--project-y", `${48 * remaining}px`);
        card.style.setProperty("--project-scale", 1 - 0.04 * remaining);
      });
      quotes.forEach(({ card, top, centerOffset }) => {
        const progress = clamp(
          (height * 0.95 - referencesBox.top - top) / (height * 0.5),
        );
        const remaining = reduced.matches ? 0 : 1 - progress;
        card.style.setProperty(
          "--quote-x",
          `${mobile ? 0 : centerOffset * remaining}px`,
        );
        card.style.setProperty("--quote-y", `${mobile ? 32 * remaining : 0}px`);
      });
      offerings.forEach(({ card, top }, index) => {
        const progress = clamp(
          (height * 0.95 - servicesBox.top - top) / (height * 0.5) -
            (mobile ? 0 : index * 0.1),
        );
        card.style.setProperty(
          "--service-scale",
          reduced.matches ? 1 : 0.7 + 0.3 * progress,
        );
      });
      aboutParts.forEach(({ part, top, distance }) => {
        const progress = clamp(
          (height * 0.95 - aboutBox.top - top) / (height * 0.6),
        );
        // Ease out in scroll space: responsive to wheel/touch in either direction.
        const remaining = reduced.matches ? 0 : Math.pow(1 - progress, 3);
        part.style.setProperty("--about-x", `${distance * remaining}px`);
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);
    resize.observe(portfolio);
    const changes = new MutationObserver(schedule);
    changes.observe(portfolio, { childList: true });
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    reduced.addEventListener("change", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      changes.disconnect();
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      reduced.removeEventListener("change", schedule);
    };
  }, [productRef, teamRef, portfolioRef, referencesRef, aboutRef, servicesRef]);
}
