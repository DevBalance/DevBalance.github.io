import fs from "node:fs";
import { load } from "cheerio";
const $ = load(
  fs
    .readFileSync("src/original-home.html", "utf8")
    .replace(/<!--[\s\S]*?-->/g, ""),
);
const clean = (el) => {
  const copy = $(el).clone();
  copy.find("br").replaceWith(" ");
  return copy.text().replace(/\s+/g, " ").trim();
};
const paragraphs = (el) =>
  $(el)
    .find("p")
    .map((_, p) => ({
      text: clean($(p).clone().find("em").remove().end()),
      english: clean($(p).find("em")),
    }))
    .get()
    .filter((p) => p.text || p.english);
const content = {
  hero: paragraphs($("#hero")),
  services: $(".service-item")
    .map((_, el) => ({
      title: clean($(el).find("h3").clone().find("em").remove().end()),
      english: clean($(el).find("h3 em")),
      paragraphs: paragraphs(el),
    }))
    .get(),
  portfolio: $(".portfolio-item")
    .map((_, el) => ({
      title: clean($(el).find("h4")),
      image: $(el).find("img").attr("src"),
      category: ($(el)
        .attr("class")
        .match(/filter-(\w+)/) || [])[1],
      paragraphs: paragraphs(el),
    }))
    .get(),
  testimonials: $(".testimonial-item")
    .map((_, el) => ({
      name: clean($(el).find("h4")),
      role: clean($(el).find(".profile p")),
      image: $(el).find("img").attr("src"),
      paragraphs: paragraphs($(el).children("p").parent()).slice(0, 1),
    }))
    .get(),
  team: $(".team-member")
    .map((_, el) => ({
      name: clean($(el).find("h4")),
      role: clean($(el).find(".member-info span")),
      image: $(el).find("img").attr("src"),
      linkedin: $(el).find("a").attr("href"),
      paragraphs: paragraphs(el),
    }))
    .get(),
};
fs.writeFileSync("src/content.json", JSON.stringify(content, null, 2));
console.log(
  Object.fromEntries(Object.entries(content).map(([k, v]) => [k, v.length])),
);
