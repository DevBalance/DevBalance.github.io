import { test, expect } from "@playwright/test";

test("navigation lands on expanded content below the header", async ({
  page,
}, info) => {
  await page.goto("/");
  for (const [id, label] of [
    ["services", "Services"],
    ["team", "Team"],
    ["portfolio", "Portfolio"],
    ["omnidoc", "omniDoc"],
  ]) {
    if (info.project.name === "mobile")
      await page.getByRole("button", { name: "Open navigation" }).click();
    const nav = page.getByRole("navigation", {
      name:
        info.project.name === "mobile"
          ? "Mobile navigation"
          : "Main navigation",
      exact: true,
    });
    await nav.getByRole("link", { name: label, exact: true }).click();
    await expect
      .poll(() =>
        page
          .locator("#" + id)
          .evaluate((el) => Math.abs(el.getBoundingClientRect().top - 120)),
      )
      .toBeLessThan(3);
    const content = page
      .locator(id === "omnidoc" ? ".product-stage" : `#${id} > article`)
      .first();
    await expect
      .poll(() =>
        content.evaluate(
          (el) => new DOMMatrix(getComputedStyle(el).transform).a,
        ),
      )
      .toBeCloseTo(1, 2);
    await expect
      .poll(() =>
        content.evaluate(
          (el) => new DOMMatrix(getComputedStyle(el).transform).m41,
        ),
      )
      .toBe(0);
  }
});

test("screenshots loop slowly, pause, stop on manual selection and respect reduced motion", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("link", { name: /Meet omniDoc/ }).click();
  const stage = page.locator(".product-stage");
  const image = page.locator(".screenshot-button img");
  await expect(stage).toHaveAttribute("data-slideshow-running", "true");
  await expect
    .poll(() =>
      stage.evaluate((el) => Math.abs(el.getBoundingClientRect().top - 120)),
    )
    .toBeLessThan(3);
  for (const file of ["answers", "search", "workspace"]) {
    await page.clock.fastForward(9100);
    await expect(image).toHaveAttribute("src", `/screenshots/${file}.png`);
  }
  await page
    .getByRole("button", { name: "Pause screenshot slideshow" })
    .click();
  await page.clock.fastForward(18000);
  await expect(image).toHaveAttribute("src", "/screenshots/workspace.png");
  await page.getByRole("button", { name: "Play screenshot slideshow" }).click();
  await page.getByRole("button", { name: /Hledání v dokumentech/ }).click();
  await expect(stage).toHaveAttribute("data-slideshow-running", "false");
  await page.clock.fastForward(18000);
  await expect(image).toHaveAttribute("src", "/screenshots/search.png");
  await page.getByRole("button", { name: "Play screenshot slideshow" }).click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(stage).toHaveAttribute("data-slideshow-running", "false");
});
