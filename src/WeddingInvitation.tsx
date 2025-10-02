import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./WeddingInvitation.module.css";

/* ==== Imports de imágenes desde src/photos ==== */
import heroImg from "./photos/TomadosDeLaManoAnillo.jpg";
import inviteImg from "./photos/SillasFoto1.jpg"; // HORIZONTAL
import juntosAbrazo from "./photos/JuntosAbrazo.jpg"; // VERTICAL
import mostrandoAnillo from "./photos/MostrandoAnillo.jpg"; // VERTICAL
import arrodillado from "./photos/ArrodilladoDandoAnillo.jpg"; // VERTICAL
import poniendo from "./photos/PoniendoElAnillo.jpg"; // VERTICAL
import abrazoTierno from "./photos/AbrazoTierno.jpg"; // VERTICAL
import papelTexture from "./photos/papel.png";
import invitacion from "./photos/Invitacion1.png";
import qrExample from "./photos/QRlol.png"; // ejemplo QR//

/* =====================
   Datos de la boda
===================== */
const COUPLE = { groom: "Mateo Ordóñez", bride: "Alisson Torres" };
const VENUE = "Quinta Los Corteza";
const INVITE_DATE = "2026-02-07T12:00:00";

/* DEMO de #pases (reemplazar por API/Sheets real) */
type Guest = { nombre: string; pases: number };
const MOCK_CODES: Record<string, Guest> = {
  AB123: { nombre: "Invitado de Ejemplo", pases: 2 },
  FAM001: { nombre: "Familia Torres", pases: 4 },
  VIP777: { nombre: "Amigo Especial", pases: 1 },
};

/* =====================
   Hooks
===================== */
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
    const els = Array.from(
      root.querySelectorAll<HTMLElement>(`.${styles.reveal}`)
    );
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (e) => e.isIntersecting && e.target.classList.add(styles.inView)
        ),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

function useHideOnScroll() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastY.current && y > 80); // ocultar si bajo rápido y no estoy arriba del todo
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
}

/* =====================
   UI Helpers
===================== */
const TimeBox: React.FC<{ label: string; value: number }> = ({
  label,
  value,
}) => (
  <div className={styles.timeBox} aria-label={`${label} restantes`}>
    <span>{String(value).padStart(2, "0")}</span>
    <small>{label}</small>
  </div>
);

const Icon: React.FC<{ name: "welcome" | "ring" | "toast" | "dinner" }> = ({
  name,
}) => {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    strokeWidth: 1.5,
  } as const;
  switch (name) {
    case "welcome":
      return (
        <svg {...common} aria-hidden="true" className={styles.rgStroke}>
          <path d="M4 10h16M6 10V6h12v4m-3 4v6m-6-6v6" />
        </svg>
      );
    case "ring":
      return (
        <svg {...common} aria-hidden="true" className={styles.rgStroke}>
          <circle cx="12" cy="14" r="6" />
          <path d="M10 5l2-2 2 2" />
        </svg>
      );
    case "toast":
      return (
        <svg {...common} aria-hidden="true" className={styles.rgStroke}>
          <path d="M7 8l5 2 5-2M12 10v8" />
          <path d="M7 8v4a5 5 0 0010 0V8" />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden="true" className={styles.rgStroke}>
          <path d="M4 6h16M6 6v10a4 4 0 004 4h4a4 4 0 004-4V6" />
        </svg>
      );
  }
};

/* Carrusel tipo cinta transbordadora (scroll continuo, sin saltos) */
const Carousel: React.FC<{
  items: { src: string; alt: string; caption?: string }[];
  /** Segundos por vuelta (más grande = más lento) */
  speed?: number;
}> = ({ items, speed = 45 }) => {
  // Duplicamos ítems para loop perfecto
  const loopItems = [...items, ...items];
  const [paused, setPaused] = useState(false);

  return (
    <div
      className={`${styles.carousel} ${styles.reveal}`}
      data-anim="left"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div
        className={styles.carMarquee}
        data-paused={paused ? "true" : "false"}
        style={{ ["--marquee-duration" as any]: `${speed}s` }}
      >
        {loopItems.map((it, i) => (
          <figure key={i} className={styles.carSlide} tabIndex={-1}>
            <img src={it.src} alt={it.alt} loading="lazy" />
            {it.caption && (
              <figcaption className={styles.carCaption}>
                {it.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
};

/** Imagen a pantalla ancha, sin bordes, con parallax al hacer scroll */
const ScrollImage: React.FC<{ src: string; alt?: string; ratio?: string }> = ({
  src,
  alt,
  ratio = "21/9",
}) => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [progress,] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const scrolled = Math.min(Math.max((0 - rect.top) / total, 0), 1);
      const scale = 1 + scrolled * 0.2;
      sectionRef.current
        .querySelector("img")
        ?.style.setProperty("transform", `scale(${scale})`);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // escala de 1 a 1.2 según progreso
  const scale = 1 + progress * 0.2;

  return (
    <section className={styles.scrollImgSection} ref={sectionRef}>
      <figure className={styles.scrollImgFigure} style={{ aspectRatio: ratio }}>
        <img
          src={src}
          alt={alt}
          className={styles.scrollImg}
          style={{ transform: `scale(${scale})` }}
        />
      </figure>
    </section>
  );
};

/* =====================
   Componente principal
===================== */
const WeddingInvitation: React.FC = () => {
  const t = useCountdown(INVITE_DATE);
  const ref = useReveal();
  const navHidden = useHideOnScroll();

  // Papel texturizado como patrón global
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--paper-tex", `url(${papelTexture})`);
    root.style.setProperty("--paper-size", "420px");
    return () => {
      root.style.removeProperty("--paper-tex");
      root.style.removeProperty("--paper-size");
    };
  }, []);

  // #pases (tipado para evitar "possibly null")
  const [code, setCode] = useState("");
  const guest: Guest | null = code.trim()
    ? MOCK_CODES[code.trim().toUpperCase()] ?? null
    : null;

  // RSVP (demo)
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpCount, setRsvpCount] = useState(1);
  const [rsvpMsg, setRsvpMsg] = useState("");
  const submitRSVP = (e: React.FormEvent) => {
    e.preventDefault();
    setRsvpMsg("¡Gracias! Tu aceptación quedó registrada. (Demo)");
  };

  // Cuenta bancaria (demo)
  const account = "000-000000-00 (Banco Ejemplo)";
  const [copied, setCopied] = useState(false);
  const copyAccount = async () => {
    await navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      className={styles.pageTile}
      style={{ backgroundImage: `url(${papelTexture})` }}
    >
      <div className={styles.invRoot} ref={ref as any}>
        {/* NAV */}
        <nav
          className={`${styles.stickyNav} ${navHidden ? styles.navHidden : ""}`}
        >
          <a href="#invitacion">Inicio</a>
          <a href="#invitacion">Invitación</a>
          <a href="#pedida">Carrusel</a>
          <a href="#padres">Padres</a>
          <a href="#itinerario">Itinerario</a>
          <a href="#codigo">#pases</a>
          <a href="#rsvp">Confirmar</a>
          <a href="#galeria">Galería</a>
          <a href="#mapa">Mapa</a>
          <a href="#mesas">Mesas</a>
        </nav>

        {/* INVITACIÓN (antes de la reorg solicitada) */}
        <section
          id="invitacion"
          className={`${styles.fullBleed} ${styles.inviteStack} ${styles.reveal}`}
          aria-label="Invitación digital"
        >
          <img
            className={styles.inviteImgShadow}
            src={invitacion}
            alt="Invitación de boda"
            loading="eager"
          />
        </section>

        {/* CONTADOR */}
        <section
          className={`${styles.countStrip} ${styles.reveal}`}
          aria-label="Cuenta regresiva"
        >
          <div className={styles.countdown}>
            {t.reached ? (
              <span className={styles.countLive}>¡Hoy celebramos! 💍</span>
            ) : (
              <>
                <TimeBox label="Días" value={t.days} />
                <TimeBox label="Horas" value={t.hours} />
                <TimeBox label="Min" value={t.minutes} />
                <TimeBox label="Seg" value={t.seconds} />
              </>
            )}
          </div>
          <p className={styles.countNote}>
            Sábado <strong>7 de febrero de 2026</strong> ·{" "}
            <strong>12:00 p.m.</strong> · {VENUE}
          </p>
        </section>

        {/* ====== REORGANIZACIÓN A PARTIR DEL CARRUSEL ====== */}

        {/* 1. Carrusel */}
        <section
          className={`${styles.card} ${styles.reveal}`}
          id="pedida"
          aria-label="La pedida de mano"
        >
          <h2 className={styles.sectionTitle}>La pedida de mano</h2>
          <Carousel
            items={[
              {
                src: juntosAbrazo,
                alt: "Juntos en un abrazo",
                caption: "Juntos, siempre.",
              },
              {
                src: mostrandoAnillo,
                alt: "Mostrando el anillo",
                caption: "Para toda la vida.",
              },
              {
                src: arrodillado,
                alt: "Arrodillado entregando el anillo",
                caption: "El inicio de todo.",
              },
              {
                src: poniendo,
                alt: "Poniendo el anillo",
                caption: "Nuestro sí.",
              },
              {
                src: abrazoTierno,
                alt: "Abrazo tierno",
                caption: "Amor que abraza.",
              },
            ]}
            speed={45}
          />
        </section>

        {/* 2. Con la bendición de nuestros padres... */}
        <section
          id="padres"
          className={`${styles.card} ${styles.reveal}`}
          aria-label="Padres de los novios"
        >
          <h2 className={styles.sectionTitle}>
            Con la bendición de nuestros padres
          </h2>
          <ul className={styles.parents}>
            <li>
              <strong>Vicente Ordóñez</strong> & <strong>Laura Córdova</strong>{" "}
              <span>(padres del novio)</span>
            </li>
            <li>
              <strong>Maria Judith Aguirre Mera</strong> &{" "}
              <strong>Jose Fredy Torres Cruz</strong>{" "}
              <span>(padres de la novia)</span>
            </li>
          </ul>
        </section>

        {/* 3. Imagen sin bordes con efecto al hacer scroll */}
        <ScrollImage
          src={mostrandoAnillo}
          alt="Detalle del anillo"
          ratio="21/9"
        />

        {/* 4. Itinerario */}
        <section
          id="itinerario"
          className={`${styles.card} ${styles.reveal}`}
          data-anim="left"
          aria-label="Itinerario de la boda"
        >
          <h2 className={styles.sectionTitle}>Itinerario</h2>
          <ul className={styles.timeline}>
            <li
              className={`${styles.timelineStep} ${styles.reveal}`}
              data-anim="left"
            >
              <Icon name="welcome" /> <time>12:00</time> Recepción & bienvenida
            </li>
            <li
              className={`${styles.timelineStep} ${styles.reveal}`}
              data-anim="left"
            >
              <Icon name="ring" /> <time>12:30</time> Ceremonia
            </li>
            <li
              className={`${styles.timelineStep} ${styles.reveal}`}
              data-anim="left"
            >
              <Icon name="toast" /> <time>13:30</time> Brindis & fotos
            </li>
            <li
              className={`${styles.timelineStep} ${styles.reveal}`}
              data-anim="left"
            >
              <Icon name="dinner" /> <time>14:00</time> Banquete & celebración
            </li>
          </ul>
          <p className={styles.tinyHint}>*Horarios referenciales</p>
        </section>

        {/* 5. Imagen como la 3 */}
        <ScrollImage src={heroImg} alt="Manos y anillo" ratio="21/9" />

        {/* 6. #pases */}
        <section
          id="codigo"
          className={`${styles.card} ${styles.reveal}`}
          aria-label="Consulta de pases"
        >
          <h2 className={styles.sectionTitle}>
            Tu código <span className={styles.hash}>#pases</span>
          </h2>
          <p className={styles.muted}>
            Ingresa tu código para ver tus pases asignados.
          </p>
          <div className={styles.codeRow}>
            <input
              className={styles.input}
              placeholder="Ej: AB123"
              value={code}
              inputMode="text"
              aria-label="Código de invitado"
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              className={`${styles.btn} ${styles.rg}`}
              onClick={() => setCode(code.trim().toUpperCase())}
            >
              Buscar
            </button>
          </div>
          <div className={styles.srOnly} aria-live="polite">
            {guest
              ? `${guest.nombre} tiene ${guest.pases} pase(s)`
              : code
              ? "Código no encontrado"
              : ""}
          </div>
          {guest ? (
            <div className={`${styles.codeResult} ${styles.ok}`}>
              ¡Hola, <strong>{guest.nombre}</strong>! Tienes{" "}
              <strong>{guest.pases}</strong> pase(s).
            </div>
          ) : code ? (
            <div className={`${styles.codeResult} ${styles.bad}`}>
              No encontramos ese código.
            </div>
          ) : null}
          <p className={styles.tinyHint}>*Ejemplos: AB123, FAM001, VIP777.</p>
        </section>

        {/* 7. Imagen */}
        <ScrollImage src={arrodillado} alt="El gran momento" ratio="21/9" />

        {/* 8. Confirmar asistencia */}
        <section
          id="rsvp"
          className={`${styles.card} ${styles.reveal}`}
          aria-label="Confirmación de asistencia"
        >
          <h2 className={styles.sectionTitle}>Confirmar asistencia (RSVP)</h2>
          <form className={styles.form} onSubmit={submitRSVP}>
            <label>
              Nombre completo
              <input
                className={styles.input}
                value={rsvpName}
                onChange={(e) => setRsvpName(e.target.value)}
                required
                autoComplete="name"
              />
            </label>
            <label>
              Nº de personas
              <input
                className={styles.input}
                type="number"
                min={1}
                max={10}
                value={rsvpCount}
                onChange={(e) => setRsvpCount(parseInt(e.target.value || "1"))}
                required
              />
            </label>
            <button className={`${styles.btn} ${styles.rg}`} type="submit">
              Enviar aceptación
            </button>
            {rsvpMsg && (
              <p className={styles.okMsg} aria-live="polite">
                {rsvpMsg}
              </p>
            )}
          </form>
        </section>

        {/* 9. Imagen */}
        <ScrollImage src={abrazoTierno} alt="Abrazo tierno" ratio="21/9" />

        {/* 10. Detalles de regalo */}
        {/* 10. Detalles de regalo */}
        <section
          id="cuenta"
          className={`${styles.card} ${styles.paper} ${styles.reveal}`}
          aria-label="Detalles de regalo"
        >
          <h2 className={styles.sectionTitle}>Detalles de regalo</h2>
          <p className={styles.muted}>
            “Tu compañía es lo más importante, pero si gustas apoyarnos en
            nuestro nuevo comienzo, aquí están los detalles para tu
            contribución”.
          </p>

          <div className={styles.accountRow}>
            <div className={styles.accountBox}>
              <p>
                <strong>Banco:</strong> Banco Pichincha
              </p>
              <p>
                <strong>Tipo de cuenta:</strong> Ahorros
              </p>
              <p>
                <strong>Número de cuenta:</strong> 1234567890
              </p>
              <p>
                <strong>Cédula:</strong> 0102030405
              </p>
              <p>
                <strong>Correo:</strong> novios@example.com
              </p>
            </div>
            <div className={styles.qrBox}>
              <img
                src={qrExample} // 👈 pon aquí tu QR real en /public o importado
                alt="Código QR para transferencia"
                className={styles.qrImg}
              />
            </div>
          </div>

          <button
            className={`${styles.btn} ${styles.ghost}`}
            onClick={copyAccount}
          >
            {copied ? "¡Copiado!" : "Copiar cuenta"}
          </button>

          <p className={styles.tinyHint}>
            *Puedes escanear el QR o copiar los datos para tu transferencia.
          </p>
        </section>

        {/* 12. Ubica tu mesa */}
        <section
          id="mesas"
          className={`${styles.card} ${styles.reveal}`}
          aria-label="Plano de mesas"
        >
          <h2 className={styles.sectionTitle}>Ubica tu mesa</h2>
          <p className={styles.muted}>
            Aquí va la imagen del plano (proporción 16/9 o 3/4, se recorta con
            cover).
          </p>
          <div className={styles.inviteBox}>
            <img
              src={inviteImg}
              alt="Plano de mesas (temporal)"
              loading="lazy"
            />
          </div>
        </section>

        {/* 14. Footer */}
        <footer
          className={`${styles.footer} ${styles.reveal}`}
          aria-label="Cierre"
        >
          <p className={styles.scriptSubtle}>
            Con amor, {COUPLE.groom.split(" ")[0]} &{" "}
            {COUPLE.bride.split(" ")[0]}
          </p>
          <p className={styles.mini}>© 2026 · ¡Nos vemos en la celebración!</p>
        </footer>
      </div>
    </div>
  );
};

export default WeddingInvitation;
