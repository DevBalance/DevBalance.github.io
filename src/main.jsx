import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { EnvelopeSimpleIcon } from "@phosphor-icons/react/dist/csr/EnvelopeSimple";
import { DatabaseIcon } from "@phosphor-icons/react/dist/csr/Database";
import { CodeIcon } from "@phosphor-icons/react/dist/csr/Code";
import { SquaresFourIcon } from "@phosphor-icons/react/dist/csr/SquaresFour";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { PauseIcon } from "@phosphor-icons/react/dist/csr/Pause";
import { PlayIcon } from "@phosphor-icons/react/dist/csr/Play";
import "@fontsource/manrope/latin-400.css";
import "@fontsource/manrope/latin-500.css";
import "@fontsource/manrope/latin-600.css";
import "@fontsource/manrope/latin-ext-400.css";
import "@fontsource/manrope/latin-ext-500.css";
import "@fontsource/manrope/latin-ext-600.css";
import content from "./content.json";
import "./style.css";
import { useScrollMotion } from "./useScrollMotion";

const sales = "mailto:support@devbal.com?subject=Sales%20demand";
const demo = "mailto:support@devbal.com?subject=omniDoc%20Demo%20Request";
const product = "https://omnidoc.devbal.com";
const shots = [
  {
    src: "workspace",
    title: "Pracovní prostor",
    en: "Your workspace",
    description: "Přestaňte hledat. Začněte se ptát.",
  },
  {
    src: "answers",
    title: "Odpovědi se zdroji",
    en: "Answers with sources",
    description: "Odpovědi z vašich dokumentů. Zdroje, které si můžete ověřit.",
  },
  {
    src: "search",
    title: "Hledání v dokumentech",
    en: "Document search",
    description: "Hledat v dokumentech",
  },
];
function Copy({ paragraphs }) {
  return paragraphs.map((p, i) => (
    <div className="copy" key={i}>
      {p.text && <p>{p.text}</p>}
      {p.english && (
        <p lang="en" className="english">
          {p.english}
        </p>
      )}
    </div>
  ));
}
function Label({ children }) {
  return <p className="eyebrow caption-1">{children}</p>;
}
function OmniDocSymbol() {
  return (
    <img
      className="omnidoc-symbol"
      src="/assets/img/omnidoc-symbol.png"
      width="144"
      height="138"
      alt=""
      aria-hidden="true"
    />
  );
}
function App() {
  const [menu, setMenu] = useState(false);
  const [shot, setShot] = useState(0);
  const [autoPlay, setAutoPlay] = useState(
    () => !matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [productVisible, setProductVisible] = useState(false);
  const [filter, setFilter] = useState("all");
  const [zoom, setZoom] = useState(null);
  const dialog = useRef(null);
  const menuButton = useRef(null);
  const mobileNav = useRef(null);
  const productSection = useRef(null);
  const teamGrid = useRef(null);
  const portfolioGrid = useRef(null);
  const referencesGrid = useRef(null);
  const aboutSection = useRef(null);
  const servicesGrid = useRef(null);
  useScrollMotion(
    productSection,
    teamGrid,
    portfolioGrid,
    referencesGrid,
    aboutSection,
    servicesGrid,
  );
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setProductVisible(entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(productSection.current.querySelector(".product-stage"));
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const stopForReducedMotion = () => {
      if (reduced.matches) setAutoPlay(false);
    };
    reduced.addEventListener("change", stopForReducedMotion);
    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", stopForReducedMotion);
    };
  }, []);
  const slideshowRunning = autoPlay && productVisible && zoom === null;
  useEffect(() => {
    if (!slideshowRunning) return;
    const timer = setInterval(
      () => setShot((current) => (current + 1) % shots.length),
      9000,
    );
    return () => clearInterval(timer);
  }, [slideshowRunning]);
  useEffect(() => {
    if (menu) mobileNav.current?.querySelector("a")?.focus();
  }, [menu]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    document
      .querySelectorAll(".reveal, .word")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (zoom !== null) dialog.current.showModal();
  }, [zoom]);
  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu]);
  const nav = [
    ["omnidoc", "omniDoc"],
    ["services", "Services"],
    ["portfolio", "Portfolio"],
    ["team", "Team"],
  ];
  return (
    <>
      <a className="skip" href="#main">
        Přejít na obsah
      </a>
      <header className="header">
        <a href="#home" aria-label="DevBalance home" className="brand">
          <img
            src="/assets/img/DB_logotyp_pozitiv_RGB.png"
            width="220"
            height="70"
            alt="DevBalance"
          />
        </a>
        <nav aria-label="Main navigation" className="desktop-nav">
          {nav.map(([id, name]) => (
            <a key={id} href={"#" + id}>
              {name}
            </a>
          ))}
        </nav>
        <a className="button sales" href={sales}>
          <EnvelopeSimpleIcon size={24} aria-hidden="true" />
          <span>Contact sales</span>
        </a>
        <button
          ref={menuButton}
          className={"menu-toggle " + (menu ? "open" : "")}
          aria-label={menu ? "Close navigation" : "Open navigation"}
          aria-expanded={menu}
          aria-controls="mobile-nav"
          onClick={() => setMenu(!menu)}
        >
          <span />
          <span />
        </button>
      </header>
      {menu && (
        <nav
          ref={mobileNav}
          id="mobile-nav"
          aria-label="Mobile navigation"
          className="mobile-nav"
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              const items = [...e.currentTarget.querySelectorAll("a,button")];
              const first = items[0],
                last = items.at(-1);
              if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
              } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
              }
            }
            if (e.key === "Escape") {
              setMenu(false);
              menuButton.current.focus();
            }
          }}
        >
          {nav.map(([id, name], i) => (
            <a
              style={{ animationDelay: `${i * 60}ms` }}
              key={id}
              href={"#" + id}
              onClick={() => setMenu(false)}
            >
              {name}
            </a>
          ))}
          <a href={demo}>Request DEMO</a>
          <button
            className="button"
            onClick={() => {
              setMenu(false);
              menuButton.current.focus();
            }}
          >
            Close menu
          </button>
        </nav>
      )}
      <main id="main" inert={menu || undefined}>
        <section id="home" className="hero shell">
          <h1 className="heading-1">
            Vývoj s citem
            <br />
            pro <span>rovnováhu.</span>
          </h1>
          <p className="hero-translation title-1" lang="en">
            Development with a sense of Balance
          </p>
          <p className="hero-description body-3">
            Jsme analytické a vývojářské studio.
            <br />
            We are a studio combining analytics and software development.
          </p>
          <a className="product-pill caption-1" href="#omnidoc">
            <span className="product-pill-brand" lang="en">
              <OmniDocSymbol />
              Meet omniDoc
            </span>
            <span className="pill-divider" aria-hidden="true">
              /
            </span>
            <span>Přestaňte hledat, začněte se ptát.</span>
          </a>
          <p className="hero-note caption-2">
            Data Analytics <span>·</span> Custom Apps <span>·</span> Microsoft
            365
          </p>
        </section>
        <section ref={productSection} className="shell product-section">
          <div className="section-head">
            <div>
              <h2 className="product-title">
                omniDoc<span>.</span>
              </h2>
            </div>
            <div className="product-intro">
              <p className="title-1">
                Proměňte své dokumenty
                <br />v inteligentní dotazovací vrstvu.
              </p>
              <div className="actions">
                <a href={demo} className="button primary">
                  Request DEMO
                </a>
                <a href={product} className="text-link">
                  omnidoc.devbal.com
                </a>
              </div>
            </div>
          </div>
          <div
            id="omnidoc"
            data-slideshow-running={slideshowRunning}
            className="product-stage origin-top motion-safe:[transform:scale(var(--product-scale,1))]"
          >
            <div className="stage-bar">
              <span className="caption-1">
                <OmniDocSymbol />
                omniDoc / {shots[shot].title}
              </span>
              <div className="flex items-center gap-2">
                <button
                  className="icon-button"
                  aria-label={
                    autoPlay
                      ? "Pause screenshot slideshow"
                      : "Play screenshot slideshow"
                  }
                  onClick={() => setAutoPlay((playing) => !playing)}
                >
                  {autoPlay ? (
                    <PauseIcon size={22} aria-hidden="true" />
                  ) : (
                    <PlayIcon size={22} aria-hidden="true" />
                  )}
                </button>
                <button
                  className="icon-button"
                  aria-label="Enlarge product screenshot"
                  onClick={() => setZoom(shot)}
                >
                  <PlusIcon size={22} />
                </button>
              </div>
            </div>
            <button
              className="screenshot-button"
              onClick={() => setZoom(shot)}
              aria-label={`Enlarge ${shots[shot].en}`}
            >
              <img
                key={shot}
                src={"/screenshots/" + shots[shot].src + ".png"}
                alt={shots[shot].description}
                width="2557"
                height="1340"
                fetchPriority="high"
              />
            </button>
          </div>
          <div
            className="shot-tabs"
            role="group"
            aria-label="Product screenshots"
          >
            {shots.map((s, i) => (
              <button
                key={s.src}
                aria-pressed={shot === i}
                className={shot === i ? "selected" : ""}
                onClick={() => {
                  setShot(i);
                  setAutoPlay(false);
                }}
              >
                <span className="title-3">{s.title}</span>
                <span className="caption-2" lang="en">
                  {s.en}
                </span>
              </button>
            ))}
          </div>
          <div className="product-links">
            <a href="/omniDoc.html">Více o omniDoc</a>
            <a href="/omniDoc-how-to-FE-CZ.html">Průvodce CZ</a>
            <a href="/omniDoc-how-to-FE-EN.html">Guide EN</a>
          </div>
        </section>
        <section className="shell section">
          <Label>Naše služby / Our services</Label>
          <h2 className="heading-2">
            Co přinášíme
            <br />
            našim zákazníkům
          </h2>
          <div
            id="services"
            ref={servicesGrid}
            className="services-grid relative"
          >
            {content.services.map((s, i) => {
              const Icon = [DatabaseIcon, CodeIcon, SquaresFourIcon][i];
              return (
                <article
                  key={s.title}
                  className="service origin-center motion-safe:[transform:scale(var(--service-scale,1))]"
                >
                  <Icon size={40} weight="light" aria-hidden="true" />
                  <h3 className="heading-5">{s.title}</h3>
                  <p lang="en" className="caption-2">
                    {s.english}
                  </p>
                  <Copy paragraphs={s.paragraphs} />
                </article>
              );
            })}
          </div>
        </section>
        <section className="philosophy overflow-x-clip">
          <div ref={aboutSection} className="shell relative">
            <div className="about-heading motion-safe:[transform:translate3d(var(--about-x,0px),0,0)]">
              <Label>DevBalance / balanced development</Label>
              <h2 className="heading-2 tagline">
                {"Rovnováha mezi pohybem vpřed a stabilitou toho, co už funguje."
                  .split(" ")
                  .map((w, i) => (
                    <React.Fragment key={i}>
                      <span className="word">{w}</span>{" "}
                    </React.Fragment>
                  ))}
              </h2>
            </div>
            <div className="philosophy-copy motion-safe:[transform:translate3d(var(--about-x,0px),0,0)]">
              <Copy paragraphs={content.hero} />
            </div>
          </div>
        </section>
        <section className="shell section">
          <div className="section-head">
            <div>
              <Label>Naše typické zakázky / Portfolio</Label>
              <h2 className="heading-2">
                Podívejte se, co jsme
                <br />
                naposledy dělali
              </h2>
            </div>
            <div
              className="filters"
              role="group"
              aria-label="Portfolio category"
            >
              {["all", "apps", "consulting", "lectures"].map((f) => (
                <button
                  key={f}
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  className={f === filter ? "selected" : ""}
                >
                  {f === "all" ? "All" : f[0].toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div
            id="portfolio"
            ref={portfolioGrid}
            className="portfolio-grid relative"
          >
            {content.portfolio
              .filter((p) => filter === "all" || p.category === filter)
              .map((p) => (
                <article
                  className="project origin-top motion-safe:[transform:translate3d(0,var(--project-y,0px),0)_scale(var(--project-scale,1))]"
                  key={p.title}
                >
                  <div className="project-image">
                    <img
                      src={"/" + p.image}
                      width="800"
                      height="500"
                      loading="lazy"
                      alt={p.title}
                    />
                  </div>
                  <div className="project-copy">
                    <Label>{p.category}</Label>
                    <h3 className="heading-5">{p.title}</h3>
                    <Copy paragraphs={p.paragraphs} />
                  </div>
                </article>
              ))}
          </div>
        </section>
        <section className="testimonials section">
          <div className="shell">
            <Label>Reference / Testimonials</Label>
            <h2 className="heading-2">
              Co našim zákazníkům
              <br />
              přinesla spolupráce s námi
            </h2>
            <div ref={referencesGrid} className="quote-grid relative isolate">
              {content.testimonials.map((t, index) => (
                <figure
                  key={t.name}
                  style={{ "--quote-layer": index === 1 ? 3 : 1 }}
                  className="relative z-[var(--quote-layer)] bg-[var(--quote-surface)] motion-safe:[transform:translate3d(var(--quote-x,0px),var(--quote-y,0px),0)]"
                >
                  <span className="quote-mark" aria-hidden="true">
                    “
                  </span>
                  <blockquote>
                    <Copy paragraphs={t.paragraphs} />
                  </blockquote>
                  <figcaption>
                    <img
                      src={"/" + t.image}
                      width="84"
                      height="84"
                      loading="lazy"
                      alt=""
                    />
                    <div>
                      <p className="title-3">{t.name}</p>
                      <p className="caption-2">{t.role}</p>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
        <section className="shell section">
          <Label>Náš tým / Team</Label>
          <h2 className="heading-2">
            Naši lidé,
            <br />
            kteří pro vás pracují
          </h2>
          <div id="team" ref={teamGrid} className="team-grid relative isolate">
            {content.team.map((t, index) => (
              <article
                key={t.name}
                style={{ "--card-layer": content.team.length - index }}
                className="relative z-[var(--card-layer)] bg-white motion-safe:[transform:translate3d(var(--team-x,0px),var(--team-y,0px),0)] focus-within:z-10"
              >
                <img
                  src={"/" + t.image}
                  width="600"
                  height="600"
                  loading="lazy"
                  alt={t.name}
                />
                <div className="team-title">
                  <h3 className="heading-5">{t.name}</h3>
                  {t.linkedin && (
                    <a
                      href={t.linkedin}
                      aria-label={`${t.name} on LinkedIn`}
                      className="linkedin"
                    >
                      in
                    </a>
                  )}
                </div>
                <p className="caption-1 role">{t.role}</p>
                <Copy paragraphs={t.paragraphs} />
              </article>
            ))}
          </div>
        </section>
        <section id="contact" className="contact shell">
          <EnvelopeSimpleIcon size={64} weight="light" aria-hidden="true" />
          <Label>Kontakt / Contact</Label>
          <h2 className="heading-2">
            Vývoj s citem
            <br />
            pro rovnováhu.
          </h2>
          <div className="actions">
            <a href={sales} className="button primary">
              <EnvelopeSimpleIcon size={24} aria-hidden="true" />
              Contact sales
            </a>
            <a href={demo} className="button secondary">
              Request DEMO
            </a>
          </div>
          <a className="text-link" href={sales}>
            support@devbal.com
          </a>
        </section>
      </main>
      <footer className="shell" inert={menu || undefined}>
        <div className="footer-grid">
          <div>
            <img
              src="/assets/img/DB_logotyp_pozitiv_RGB.png"
              width="200"
              height="64"
              alt="DevBalance"
            />
            <p>
              DevBalance s.r.o.
              <br />
              Dukelská 45, 34401 Domažlice
              <br />
              IČ: 22445960 · DIČ: CZ22445960
            </p>
          </div>
          <div>
            <p className="title-3">Content</p>
            <a href="#home">Home</a>
            <a href="#portfolio">Portfolio</a>
            <a href="#contact">Contact</a>
          </div>
          <div>
            <p className="title-3">omniDoc</p>
            <a href={product}>Open omniDoc</a>
            <a href={demo}>Request DEMO</a>
            <a href="/omniDoc-how-to-FE-CZ.html">Průvodce</a>
          </div>
          <div>
            <p className="title-3">Follow us</p>
            <a href="https://www.linkedin.com/company/devbalance/">LinkedIn</a>
            <a href="https://github.com/DevBalance/">GitHub</a>
          </div>
        </div>
        <div className="footer-bottom caption-2">
          <span>© DevBalance s.r.o. All rights reserved.</span>
          <span>Balanced development.</span>
        </div>
      </footer>
      <dialog
        aria-label="omniDoc screenshot preview"
        ref={dialog}
        className="image-dialog"
        onClose={() => setZoom(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current.close();
        }}
      >
        <button
          autoFocus
          className="button close-dialog"
          onClick={() => dialog.current.close()}
        >
          <XIcon size={24} />
          Close
        </button>
        {zoom !== null && (
          <img
            src={"/screenshots/" + shots[zoom].src + ".png"}
            alt={shots[zoom].description}
          />
        )}
      </dialog>
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
