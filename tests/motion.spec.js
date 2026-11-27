import { test, expect } from "@playwright/test";

test("scroll coordinates product, services, centered testimonials and Roman-led team motion", async ({
  page,
}, info) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    window.motionSamples = [];
    window.motionFinished = false;
    const start = performance.now();
    const sample = () => {
      const stage = document.querySelector(".product-stage");
      window.motionSamples.push({
        y: scrollY,
        scale: new DOMMatrix(getComputedStyle(stage).transform).a,
      });
      if (performance.now() - start < 1600) requestAnimationFrame(sample);
      else window.motionFinished = true;
    };
    requestAnimationFrame(sample);
  });
  await page.getByRole("link", { name: /Meet omniDoc/ }).click();
  await expect
    .poll(() => page.evaluate(() => window.motionFinished))
    .toBe(true);
  const samples = await page.evaluate(() => window.motionSamples);
  expect(samples[0].scale).toBeCloseTo(0.602, 2);
  expect(samples.at(-1).y).toBeGreaterThan(samples[0].y);
  expect(samples.at(-1).scale).toBeGreaterThan(samples[0].scale);
  expect(
    samples.filter((s) => s.scale > samples[0].scale && s.scale < 0.999).length,
  ).toBeGreaterThan(2);
  expect(samples.at(-1).scale).toBeCloseTo(1, 2);
  await expect(page).toHaveURL(/#omnidoc$/);
  await page.screenshot({
    path: `test-results/${info.project.name}-product-motion.png`,
  });
  for (const [selector, direction] of [
    [".about-heading", -1],
    [".philosophy-copy", 1],
  ]) {
    const part = page.locator(selector);
    const top = await part.evaluate(
      (el) =>
        el.parentElement.getBoundingClientRect().top + scrollY + el.offsetTop,
    );
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "instant" }),
      top - innerHeightFor(info),
    );
    await expect
      .poll(() =>
        part
          .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41)
          .then((x) => x * direction),
      )
      .toBeGreaterThan(0);
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "instant" }),
      top - 150,
    );
    await expect
      .poll(() =>
        part.evaluate(
          (el) => new DOMMatrix(getComputedStyle(el).transform).m41,
        ),
      )
      .toBe(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  const team = page.locator(".team-grid");
  const top = await team.evaluate(
    (el) => el.getBoundingClientRect().top + scrollY,
  );
  if (info.project.name === "desktop") {
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "instant" }),
      top - innerHeightFor(info),
    );
    await expect
      .poll(() =>
        team.locator("article").evaluateAll((cards) => {
          const xs = cards.map((card) => card.getBoundingClientRect().left);
          return Math.max(...xs) - Math.min(...xs);
        }),
      )
      .toBeLessThan(2);
  }
  await page.evaluate(
    (y) => window.scrollTo({ top: y, behavior: "instant" }),
    top - 700,
  );
  const first = team.locator("article").first();
  if (info.project.name === "desktop") {
    await expect
      .poll(() =>
        team
          .locator("article")
          .nth(1)
          .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41),
      )
      .toBeLessThan(0);
    const offsets = await team
      .locator("article")
      .evaluateAll((cards) =>
        cards.map(
          (card) => new DOMMatrix(getComputedStyle(card).transform).m41,
        ),
      );
    expect(offsets[0]).toBeGreaterThan(offsets[1]);
    expect(offsets[1]).toBeGreaterThan(offsets[2]);
  }
  await page.evaluate(
    (y) => window.scrollTo({ top: y, behavior: "instant" }),
    top - 150,
  );
  await expect
    .poll(() =>
      team
        .locator("article")
        .last()
        .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41),
    )
    .toBe(0);
  await page.screenshot({
    path: `test-results/${info.project.name}-team-motion.png`,
  });
  const quotes = page.locator(".quote-grid");
  const quotesTop = await quotes.evaluate(
    (el) => el.getBoundingClientRect().top + scrollY,
  );
  await page.evaluate(
    (y) => window.scrollTo({ top: y, behavior: "instant" }),
    quotesTop - innerHeightFor(info),
  );
  if (info.project.name === "desktop") {
    await expect
      .poll(() =>
        quotes.locator("figure").evaluateAll((cards) =>
          Math.max(
            ...cards.map((card) => {
              const box = card.getBoundingClientRect();
              return Math.abs(box.left + box.width / 2 - innerWidth / 2);
            }),
          ),
        ),
      )
      .toBeLessThan(2);
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "instant" }),
      quotesTop - 700,
    );
    await expect
      .poll(() =>
        quotes
          .locator("figure")
          .first()
          .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41),
      )
      .toBeGreaterThan(0);
    await expect
      .poll(() =>
        quotes
          .locator("figure")
          .last()
          .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41),
      )
      .toBeLessThan(0);
  } else {
    await expect
      .poll(() =>
        quotes
          .locator("figure")
          .first()
          .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42),
      )
      .toBeGreaterThan(0);
  }
  await page.evaluate(
    (y) => window.scrollTo({ top: y, behavior: "instant" }),
    quotesTop - 150,
  );
  await expect
    .poll(() =>
      quotes
        .locator("figure")
        .first()
        .evaluate((el) => {
          const transform = new DOMMatrix(getComputedStyle(el).transform);
          return Math.abs(transform.m41) + Math.abs(transform.m42);
        }),
    )
    .toBeLessThan(1);
  for (const selector of [".portfolio-grid"]) {
    const grid = page.locator(selector);
    const card = grid.locator(":scope > *").first();
    const top = await grid.evaluate(
      (el) => el.getBoundingClientRect().top + scrollY,
    );
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "instant" }),
      top - 700,
    );
    await expect
      .poll(() =>
        card.evaluate(
          (el) => new DOMMatrix(getComputedStyle(el).transform).m42,
        ),
      )
      .toBeGreaterThan(0);
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "instant" }),
      top - 150,
    );
    await expect
      .poll(() =>
        card.evaluate(
          (el) => new DOMMatrix(getComputedStyle(el).transform).m42,
        ),
      )
      .toBe(0);
  }
  const services = page.locator(".services-grid");
  for (const service of await services.locator(".service").all()) {
    const top = await service.evaluate(
      (el) =>
        el.parentElement.getBoundingClientRect().top + scrollY + el.offsetTop,
    );
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "instant" }),
      top - innerHeightFor(info),
    );
    await expect
      .poll(() =>
        service.evaluate(
          (el) => new DOMMatrix(getComputedStyle(el).transform).a,
        ),
      )
      .toBeCloseTo(0.7, 2);
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "instant" }),
      top - 150,
    );
    await expect
      .poll(() =>
        service.evaluate(
          (el) => new DOMMatrix(getComputedStyle(el).transform).a,
        ),
      )
      .toBeCloseTo(1, 2);
  }
  if (info.project.name === "desktop") {
    const top = await services.evaluate(
      (el) => el.getBoundingClientRect().top + scrollY,
    );
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "instant" }),
      top - 700,
    );
    await expect
      .poll(() =>
        services.locator(".service").evaluateAll((cards) => {
          const scales = cards.map(
            (card) => new DOMMatrix(getComputedStyle(card).transform).a,
          );
          return scales[0] > scales[1] && scales[1] > scales[2];
        }),
      )
      .toBe(true);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".product-stage")).toHaveCSS("transform", "none");
  await expect(first).toHaveCSS("transform", "none");
  await expect(page.locator(".about-heading")).toHaveCSS("transform", "none");
  await expect(page.locator(".philosophy-copy")).toHaveCSS("transform", "none");
  await expect(page.locator(".project").first()).toHaveCSS("transform", "none");
  await expect(page.locator(".service").first()).toHaveCSS("transform", "none");
  await expect(page.locator(".quote-grid figure").first()).toHaveCSS(
    "transform",
    "none",
  );
});

function innerHeightFor(info) {
  return info.project.use.viewport.height;
}
