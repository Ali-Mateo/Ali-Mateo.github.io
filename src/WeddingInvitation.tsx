import React, { useEffect, useMemo, useRef, useState } from "react";
import "./WeddingInvitation.css";

type Guest = { nombre: string; pases: number };

const INVITE_DATE = "2026-02-07T12:00:00";

// DEMO de #pases
const MOCK_CODES: Record<string, Guest> = {
  AB123: { nombre: "Invitado de Ejemplo", pases: 2 },
  FAM001: { nombre: "Familia Torres", pases: 4 },
  VIP777: { nombre: "Amigo Especial", pases: 1 },
};

function useCountdown(targetISO: string) {
  const target = useMemo(() => new Date(targetISO).getTime(), [targetISO]);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(target - now, 0);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    reached: diff === 0,
  };
}

function useReveal() {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const root = ref.current ?? document.body;
    const els = Array.from(root.querySelectorAll<HTMLElement>(".reveal"));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (e) => e.isIntersecting && e.target.classList.add("in-view")
        ),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

// --- Reemplazo del componente PhotoPanel ---
const PhotoPanel: React.FC<{
  src: string;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}> = ({ src, title, subtitle, children }) => (
  <section className="photo-panel reveal">
    <picture className="photo-picture">
      {/* Cuando tengas variantes, descomenta y apunta a tus tamaños reales:
      <source
        srcSet={`${src.replace('.jpg','-750.jpg')} 750w, ${src.replace('.jpg','-1080.jpg')} 1080w, ${src.replace('.jpg','-1440.jpg')} 1440w`}
        sizes="(max-width: 768px) 100vw, (max-width: 1168px) 50vw, 33vw"
      />
      */}
      <img className="photo-bg-img" src={src} alt="" loading="lazy" />
    </picture>
    <div className="photo-overlay" />
    <div className="photo-content">
      {title && <h3 className="photo-title">{title}</h3>}
      {subtitle && <p className="photo-sub">{subtitle}</p>}
      {children}
    </div>
  </section>
);

// --- Reemplazo del bloque de fotos ---
<div className="photos-grid">
  {[
    "../public/IMG-20250928-WA0015.jpg",
    "../public/IMG-20250928-WA0016.jpg",
    "../public/IMG-20250928-WA0021.jpg",
    "../public/IMG-20250928-WA0017.jpg",
    "../public/IMG-20250928-WA0019.jpg",
    "../public/IMG-20250928-WA0018.jpg",
    "../public/IMG-20250928-WA0020.jpg",
  ].map((p, i) => (
    <PhotoPanel
      key={p}
      src={p}
      title={
        [
          "Nuestra historia",
          "La ceremonia",
          "El anillo",
          "Nuestro sí",
          "El lugar",
          "La pedida",
          "Nos vemos pronto",
        ][i]
      }
      subtitle={
        [
          "Un día a la vez, hasta siempre.",
          "Emoción & promesas",
          "Para toda la vida",
          "Risas y abrazos",
          "Quinta Los Corteza",
          "Un momento para recordar",
          "¡Te esperamos!",
        ][i]
      }
    />
  ))}
</div>;

const WeddingInvitation: React.FC = () => {
  const t = useCountdown(INVITE_DATE);
  const ref = useReveal();

  const [code, setCode] = useState("");
  const guest = (code && MOCK_CODES[code.trim().toUpperCase()]) || null;

  const [rsvpName, setRsvpName] = useState("");
  const [rsvpCount, setRsvpCount] = useState(1);
  const [rsvpMsg, setRsvpMsg] = useState("");
  const submitRSVP = (e: React.FormEvent) => {
    e.preventDefault();
    setRsvpMsg("¡Gracias! Tu aceptación quedó registrada. (Demo)");
  };

  const account = "000-000000-00 (Banco Ejemplo)";
  const [copied, setCopied] = useState(false);
  const copyAccount = async () => {
    await navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="inv-root" ref={ref as any}>
      <nav className="sticky-nav">
        <a href="#inicio">Inicio</a>
        <a href="#padres">Padres</a>
        <a href="#codigo">#pases</a>
        <a href="#rsvp">Confirmar</a>
        <a href="#mapa">Mapa</a>
        <a href="#mesas">Mesas</a>
      </nav>

      <header id="inicio" className="card hero reveal">
        <p className="script-subtle">Una nueva etapa que empieza con amor…</p>
        <h1 className="title-art">Mateo Ordóñez</h1>
        <div className="ampersand">&</div>
        <h1 className="title-art">sdkjnskjdfn Torres</h1>
        <p className="date-line">
          Sábado <strong>7 de febrero de 2026</strong> · <strong>12:00</strong>{" "}
          · Quinta Los Corteza
        </p>
        <div className="countdown">
          {t.reached ? (
            <span className="count-live">¡Hoy celebramos! 💍</span>
          ) : (
            <>
              <TimeBox label="Días" value={t.days} />
              <TimeBox label="Horas" value={t.hours} />
              <TimeBox label="Min" value={t.minutes} />
              <TimeBox label="Seg" value={t.seconds} />
            </>
          )}
        </div>
      </header>

      {/* 5 fotos 3:4 con overlay y texto */}
      <div className="photos-grid">
        <PhotoPanel
          src="/photos/1.jpg"
          title="Nuestra historia"
          subtitle="Un día a la vez, hasta siempre."
        >
          <p className="script-note">
            “Gracias por acompañarnos en este camino.”
          </p>
        </PhotoPanel>
        <PhotoPanel
          src="/photos/2.jpg"
          title="La ceremonia"
          subtitle="Emoción & promesas"
        />
        <PhotoPanel
          src="/photos/3.jpg"
          title="La celebración"
          subtitle="Risas, abrazos y baile"
        />
        <PhotoPanel
          src="/photos/4.jpg"
          title="Nuestra familia"
          subtitle="Con la bendición de nuestros padres"
        />
        <PhotoPanel
          src="/photos/5.jpg"
          title="Nos vemos pronto"
          subtitle="¡Te esperamos!"
        />
      </div>

      <section className="grid-2">
        <article id="padres" className="card reveal">
          <h2 className="section-title">Con la bendición de nuestros padres</h2>
          <ul className="parents">
            <li>
              <strong>Vicente Ordóñez</strong> & <strong>Laura Córdova</strong>{" "}
              <span>(padres del novio)</span>
            </li>
            <li>
              <strong>María Judith Aguirre Mera</strong> &{" "}
              <strong>Jose Fredy Torres Cruz</strong>{" "}
              <span>(padres de la novia)</span>
            </li>
          </ul>
          <p className="script-note">
            “Gracias por enseñarnos el amor en casa.”
          </p>
        </article>

        <article className="card reveal">
          <h2 className="section-title">Itinerario</h2>
          <ul className="timeline">
            <li>
              <time>12:00</time> Recepción & bienvenida
            </li>
            <li>
              <time>12:30</time> Ceremonia
            </li>
            <li>
              <time>13:30</time> Brindis & fotos
            </li>
            <li>
              <time>14:00</time> Banquete & celebración
            </li>
          </ul>
          <p className="tiny-hint">*Horarios referenciales</p>
        </article>
      </section>

      <section id="mapa" className="card reveal">
        <h2 className="section-title">Ubicación</h2>
        <p className="place">Quinta Los Corteza</p>
        <a
          className="btn"
          href="https://www.google.com/maps/search/?api=1&query=Quinta%20Los%20Corteza"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver en Google Maps
        </a>
      </section>

      <section className="grid-2">
        <article id="codigo" className="card reveal">
          <h2 className="section-title">
            Tu código <span className="hash">#pases</span>
          </h2>
          <p className="muted">
            Ingresa tu código para ver tus pases asignados.
          </p>
          <div className="code-row">
            <input
              className="input"
              placeholder="Ej: AB123"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              className="btn"
              onClick={() => setCode(code.trim().toUpperCase())}
            >
              Buscar
            </button>
          </div>
          {guest ? (
            <div className="code-result ok">
              ¡Hola, <strong>{guest.nombre}</strong>! Tienes{" "}
              <strong>{guest.pases}</strong> pase(s).
            </div>
          ) : code ? (
            <div className="code-result bad">No encontramos ese código.</div>
          ) : null}
          <p className="tiny-hint">*Ejemplos: AB123, FAM001, VIP777.</p>
        </article>

        <article id="rsvp" className="card reveal">
          <h2 className="section-title">Confirmar asistencia</h2>
          <form className="form" onSubmit={submitRSVP}>
            <label>
              Nombre completo
              <input
                className="input"
                value={rsvpName}
                onChange={(e) => setRsvpName(e.target.value)}
                required
              />
            </label>
            <label>
              Nº de personas
              <input
                className="input"
                type="number"
                min={1}
                max={10}
                value={rsvpCount}
                onChange={(e) => setRsvpCount(parseInt(e.target.value || "1"))}
                required
              />
            </label>
            <button className="btn" type="submit">
              Enviar aceptación
            </button>
            {rsvpMsg && <p className="ok-msg">{rsvpMsg}</p>}
          </form>
        </article>
      </section>

      <section id="cuenta" className="card reveal">
        <h2 className="section-title">Detalles de regalo</h2>
        <p className="muted">
          Si deseas hacernos un obsequio, puedes usar esta cuenta bancaria:
        </p>
        <div className="account-row">
          <code className="account">000-000000-00 (Banco Ejemplo)</code>
          <button className="btn ghost" onClick={copyAccount}>
            {copied ? "¡Copiado!" : "Copiar"}
          </button>
        </div>
        <p className="tiny-hint">*Cámbialo por tu banco/CLABE/IBAN.</p>
      </section>

      <section id="mesas" className="card reveal">
        <h2 className="section-title">Busca tu mesa</h2>
        <p className="muted">Aquí va la imagen del plano (proporción 3:4).</p>
        <div className="image-34 placeholder">Espacio para imagen 3:4</div>
      </section>

      <footer className="footer reveal">
        <p className="script-subtle">Con amor, Mateo & Alisson</p>
        <p className="mini">© 2026 · ¡Nos vemos en la celebración!</p>
      </footer>
    </div>
  );
};

const TimeBox: React.FC<{ label: string; value: number }> = ({
  label,
  value,
}) => (
  <div className="time-box">
    <span>{String(value).padStart(2, "0")}</span>
    <small>{label}</small>
  </div>
);

export default WeddingInvitation;
