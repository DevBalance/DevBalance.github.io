import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
const content = JSON.parse(fs.readFileSync("src/content.json", "utf8"));
test("content, links, layout, accessibility, screenshots", async ({
  page,
}, info) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("h1")).toContainText("Vývoj s citem");
  await expect(page.locator("#home a")).toHaveCount(1);
  await expect(page.locator("#home a")).toContainText("Meet omniDoc");
  await expect(page.locator("header .sales")).toHaveAttribute(
    "href",
    "mailto:support@devbal.com?subject=Sales%20demand",
  );
  await expect(
    page.getByRole("link", { name: "Request DEMO", exact: true }).first(),
  ).toHaveAttribute(
    "href",
    "mailto:support@devbal.com?subject=omniDoc%20Demo%20Request",
  );
  await expect(
    page.getByRole("link", { name: "omnidoc.devbal.com", exact: true }),
  ).toHaveAttribute("href", "https://omnidoc.devbal.com");
  for (const group of Object.values(content))
    for (const entry of group)
      for (const p of entry.paragraphs || [entry])
        for (const key of ["text", "english"])
          if (p[key])
            expect(await page.locator("body").innerText()).toContain(p[key]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const sales = await page.locator("header .sales").boundingBox();
  expect(sales.y + sales.height).toBeLessThan(info.project.use.viewport.height);
  await page.screenshot({ path: `test-results/${info.project.name}-hero.png` });
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.locator("#home").scrollIntoViewIfNeeded();
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    audit.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  for (const img of await page.locator("main img").all()) {
    await img.scrollIntoViewIfNeeded();
    await expect
      .poll(() => img.evaluate((el) => el.complete && el.naturalWidth > 0))
      .toBe(true);
  }
  await page.locator("#home").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `test-results/${info.project.name}-full.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
  for (const route of [
    "/omniDoc.html",
    "/omniDoc-how-to-FE-CZ.html",
    "/omniDoc-how-to-FE-EN.html",
    "/CNAME",
  ])
    expect((await page.request.get(route)).ok()).toBe(true);
});
test("gallery, filtering, keyboard, reduced motion and responsive widths", async ({
  page,
}, info) => {
  await page.goto("/");
  for (const [name, file] of [
    ["Odpovědi se zdroji", "answers"],
    ["Hledání v dokumentech", "search"],
    ["Pracovní prostor", "workspace"],
  ]) {
    await page.getByRole("button", { name: new RegExp(name) }).click();
    await expect(page.locator(".screenshot-button img")).toHaveAttribute(
      "src",
      `/screenshots/${file}.png`,
    );
  }
  await page
    .getByRole("button", { name: "Enlarge product screenshot", exact: true })
    .click();
  await expect(page.locator("dialog")).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Consulting", exact: true }).click();
  await expect(page.locator(".project")).toHaveCount(1);
  await page.getByRole("button", { name: "All", exact: true }).click();
  await expect(page.locator(".project")).toHaveCount(4);
  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(page.locator("#mobile-nav")).toBeVisible();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page
      .locator("#mobile-nav")
      .getByRole("link", { name: "Team", exact: true })
      .click();
    await expect(page.locator("#mobile-nav")).toHaveCount(0);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page
      .locator(".word")
      .first()
      .evaluate((el) => getComputedStyle(el).opacity),
  ).toBe("1");
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `overflow at ${width}`,
    ).toBe(true);
  }
  await page.goto("about:blank");
  await page.goto("/");
  await expect(page.locator(".skip")).toBeAttached();
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip")).toBeFocused();
  await page.keyboard.press("Enter");
  expect(await page.evaluate(() => location.hash)).toBe("#main");
});
