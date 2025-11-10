import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./WeddingInvitation.module.css";
/* ==== Imports de imágenes desde src/photos ==== */
import heroImg from "./photos/TomadosDeLaManoAnillo.jpg";
import inviteImg from "./photos/SillasFoto1.jpg"; // HORIZONTAL
import juntosAbrazo from "./photos/JuntosAbrazo.jpg";
import mostrandoAnillo from "./photos/MostrandoAnillo.jpg";
import arrodillado from "./photos/ArrodilladoDandoAnillo.jpg";
import poniendo from "./photos/PoniendoElAnillo.jpg";
import abrazoTierno from "./photos/AbrazoTierno.jpg";
import abrazoAire from "./photos/abrazoAire.jpg";
import abrazoAlegre from "./photos/abrazoAlegre.jpeg";
import manosAnillo from "./photos/manosAnillo.jpg";
import mesas from "./photos/mesas.jpeg";

import chandelier from "./icons/chandelier.png";
import church from "./icons/church.png";
import wine from "./icons/cheers.png";
import tray from "./icons/tray.png";

import papelTexture from "./photos/papel.png";
import qrExample from "./photos/QRlol.png"; // ejemplo QR//

import musicaBoda from "./audio/boda.mp4";

/* =====================
   variables de entorno
===================== */

// const REPO = "Ali-Mateo/Ali-Mateo.github.io";
// const FILE_PATH = "reservas.json";
/* =====================
   RSVP via Google Forms
===================== */
const FORM_ID = import.meta.env.REACT_APP_GOOGLE_FORM_ID || "1FAIpQLSfHoW_-1fOtXHwSDc1L-qNrGr36uK1OfHk-Lr4Q_74ankd38Q";
const ENTRY_NAME = import.meta.env.REACT_APP_ENTRY_NAME || "entry.1312194361"
const ENTRY_PASES = import.meta.env.REACT_APP_ENTRY_PASES || "entry.726965031";
const ENTRY_ESTADO = import.meta.env.REACT_APP_ENTRY_ESTADO || "entry.1991669548";
const PUBLIC_RESPONSES_CSV = `https://docs.google.com/spreadsheets/d/e/2PACX-1vQ3pD8HR6Mx1m_y-kafLgmQv-vATNlDNiIMnPDZVLd6YycVAeAxcwmlCtHbcowHoYAVKphQNZng1FA3/pub?output=csv`;
async function sendRSVP(name: string, count: number, estado: "ASISTE" | "NO_ASISTE") {
  const formData = new FormData();
  formData.append(ENTRY_NAME, name);
  formData.append(ENTRY_PASES, String(count));
  formData.append(ENTRY_ESTADO, estado === "ASISTE" ? "Asistiré" : "No podré asistir");

  await fetch(`https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`, {
    method: "POST",
    mode: "no-cors",
    body: formData,
  });
}



/* =====================
   Datos de la boda
===================== */
const COUPLE = { groom: "Mateo Ordóñez", bride: "Alison Torres" };
const VENUE = "La Pradera Hacienda, Tabacundo, Ecuador";
const INVITE_DATE = "2026-03-07T12:00:00";


function downloadICS() {
  const ics = `
BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
DTSTART:20260307T110000
DTEND:20260307T170000
SUMMARY:Boda de Alison & Mateo
LOCATION:La Pradera Hacienda, Tabacundo, Ecuador
DESCRIPTION:¡Celebramos nuestra unión! 💍
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Boda-Alison-Mateo.ics";
  a.click();
  URL.revokeObjectURL(url);
}
const openGoogleCalendar = () => {
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Boda+Alison+y+Mateo&dates=20260307T110000/20260307T170000&details=¡¡Celebramos!!&location=La+Pradera+Hacienda,+Tabacundo,+Ecuador`;
  window.open(url, "_blank");
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

function useScrollTrigger(
  ref: React.RefObject<HTMLDivElement | null>,
  offset = 0.3
) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= offset) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: Array.from({ length: 10 }, (_, i) => i / 10) }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, offset]);

  return active;
}

function useReveal() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.inView);
          }
        });
      },
      { threshold: 0.15 }
    );

    function startObserving() {
      const root = ref.current ?? document.body;
      const elements = Array.from(
        root.querySelectorAll<HTMLElement>(`.${styles.reveal}`)
      );
      elements.forEach((el) => observer.observe(el));
    }

    // ✅ Espera hasta que todas las imágenes y recursos carguen
    if (document.readyState === "complete") {
      startObserving();
    } else {
      window.addEventListener("load", startObserving);
    }

    return () => {
      window.removeEventListener("load", startObserving);
      observer.disconnect();
    };
  }, []);

  return ref;
}

function useHideOnScroll(heroHeight = window.innerHeight) {
  const [state, setState] = useState<"hidden" | "visible" | "aboveHero">(
    "aboveHero"
  );
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const goingDown = y > lastY.current;
      const pastHero = y > heroHeight * 0.8;

      if (!pastHero) {
        setState("aboveHero");
      } else if (goingDown) {
        setState("hidden");
      } else {
        setState("visible");
      }

      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [heroHeight]);

  return state;
}

/* =====================
   UI Helpers
===================== */

const Carousel: React.FC<{
  items: { src: string; alt: string; caption?: string }[];
  speed?: number; // segundos por vuelta
}> = ({ items, speed = 70 }) => {
  const [paused, setPaused] = useState(false);
  const loopItems = [...items, ...items]; // duplicamos

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
        style={{
          ["--marquee-duration" as any]: `${speed}s`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {loopItems.map((it, i) => (
          <figure key={i} className={styles.carSlide}>
            <img src={it.src} alt={it.alt} loading="lazy" draggable={false} />
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

interface ScrollImageProps {
  src: string;
  alt?: string;
}

const ScrollImage: React.FC<ScrollImageProps> = ({ src, alt }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={`${styles.scrollImgSection} ${styles.reveal} ${
        inView ? styles.inView : ""
      }`}
      data-anim="left"
    >
      <figure className={styles.scrollImgFigure}>
        <img src={src} alt={alt} className={styles.scrollImgStatic} />
      </figure>
    </section>
  );
};

/* ---- CoverHero: portada que se oculta al hacer scroll ---- */
const CoverHero: React.FC<{ src: string; alt?: string }> = ({ src, alt }) => {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // progress: 0 (completamente visible) -> 1 (ya pasada una pantalla)
      const progress = Math.min(Math.max(-rect.top / vh, 0), 1);
      // translate en px (puedes ajustar el 80 para mayor movimiento)
      const translate = progress * -80;
      el.style.setProperty("--hero-progress", String(progress));
      el.style.setProperty("--hero-translate", `${translate}px`);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
<header
  ref={ref}
  className={styles.coverHero}
  style={{ backgroundImage: `url(${src})` }}
>
  <div className={styles.coverHeroContent}>
    <h1 className={styles.coverTitle}>
      {COUPLE.bride.split(" ")[0]} &amp; {COUPLE.groom.split(" ")[0]}
    </h1>

    <figure className={styles.verseBox}>
      <blockquote className={styles.verseText}>
        “Las muchas aguas no podrán apagar el amor, ni lo ahogarán los ríos”.
      </blockquote>
      <figcaption className={styles.verseRef}>Cantares 8:7</figcaption>
    </figure>
  </div>
</header>

  );
};


/* =====================
   Componente principal
===================== */
const WeddingInvitation: React.FC = () => {
  const t = useCountdown(INVITE_DATE);
  const ref = useReveal();
  const navHidden = useHideOnScroll();

    // RSVP (demo)
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpCount, setRsvpCount] = useState(1);
  const [rsvpMsg, setRsvpMsg] = useState("");
  const [showOverlay, setShowOverlay] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
const [isPlaying, setIsPlaying] = useState(false);

useEffect(() => {
  audioRef.current = new Audio(musicaBoda);
  audioRef.current.loop = true; // repetir suave
}, []);

const toggleMusic = () => {
  if (!audioRef.current) return;

  if (isPlaying) {
    audioRef.current.pause();
    setIsPlaying(false);
  } else {
    audioRef.current.play();
    setIsPlaying(true);
  }
};

useEffect(() => {
  if (rsvpMsg) setShowOverlay(true);
}, [rsvpMsg]);
const closeOverlay = () => setShowOverlay(false);



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
  // const [code, setCode] = useState("");
  /* DEMO de #pases (reemplazar por API/Sheets real) */
const [guestList, setGuestList] = useState<Guest[]>([]);
const [showChangeConfirm, setShowChangeConfirm] = useState(false);

type Guest = { grupo: string; nombre: string; pases: number };

type ConfirmRecord = {
  name: string;
  estado: string;
};

const [confirmations, setConfirmations] = useState<ConfirmRecord[]>([]);
     const normalizeName = (str: string) =>
  str
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes
    .trim()
    .toUpperCase();

    const respuestaPrev = useMemo(() => {
  if (!rsvpName) return null;
  return confirmations.find(
    (r) => normalizeName(r.name) === normalizeName(rsvpName)
  ) || null;
}, [rsvpName, confirmations]);

useEffect(() => {
  fetch(PUBLIC_RESPONSES_CSV)
    .then(res => res.text())
    .then(csv => {
      const rows = csv.split("\n").map(r => r.trim()).filter(Boolean);
      const parsed = rows.slice(1).map(r => {
        const cols = r.split(",");
   

return {
  name: normalizeName(cols[1]),
  estado: cols[3]?.trim()
};

      });
      setConfirmations(parsed);
    });
}, []);


useEffect(() => {
  fetch("https://raw.githubusercontent.com/Ali-Mateo/Ali-Mateo.github.io/main/invitados_normalizado.csv")
    .then(res => res.text())
    .then(text => {
      const rows = text.split("\n").map(r => r.trim()).filter(Boolean);
      const list = rows.map(r => {
        const [idGrupo, nombre, contacto, parentesco, pases] = r.split(",");
        // console.log({ idGrupo, nombre, contacto, parentesco, pases });
        return {
          grupo: contacto.trim() || idGrupo || parentesco, // numero = ID del grupo
          nombre: nombre.normalize("NFC").toUpperCase(),
          pases: Number(pases) || 1
        };
      });
      setGuestList(list);
    });
}, []);

const grupo = useMemo(() => {
  const nombre = normalizeName(rsvpName);
  return guestList.find(g => normalizeName(g.nombre) === nombre)?.grupo || null;
}, [rsvpName, guestList]);


const grupoMiembros = useMemo(() => {
  return guestList.filter(g => g.grupo === grupo);
}, [grupo, guestList]);

// const pasesAsignados = grupoMiembros.length; // grupo completo

const guest = useMemo(() => {
  return guestList.find(g => normalizeName(g.nombre) === normalizeName(rsvpName)) || null;
}, [rsvpName, guestList]);

const DEADLINE = new Date("2025-11-21T23:59:59");

// Estado del grupo basado en el forms
const grupoEstado = useMemo(() => {
  if (!grupo) return null;

  const miembros = grupoMiembros.map(m => m.nombre);
  const respuestasGrupo = confirmations.filter(c =>
    miembros.includes(c.name)
  );

  if (respuestasGrupo.some(r => r.estado === "Asistiré"))
    return "confirmado";

  if (respuestasGrupo.some(r => r.estado === "No podré asistir"))
    return "no_asiste";

  return "pendiente";
}, [grupo, grupoMiembros, confirmations]);

const submitRSVP = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!guest) {
    setRsvpMsg("⚠️ Ese nombre no está en la lista de invitados.");
    return;
  }

  // 🔍 Recuperar respuesta previa (si existe)
  const respuestaPrev = confirmations.find(
    (r) => normalizeName(r.name) === normalizeName(rsvpName)
  );

  const yaRespondio = Boolean(respuestaPrev);

  // ✅ Caso: antes dijo NO y ahora intenta confirmar SÍ
  if (yaRespondio && respuestaPrev?.estado === "No podré asistir") {
    setRsvpMsg("🤍 Habías indicado que no asistirías. ¿Deseas cambiar tu respuesta?");
    setShowChangeConfirm(true);
    return;
  }

  // ✅ Caso: antes dijo SÍ y ahora intenta reenviar
  if (yaRespondio && respuestaPrev?.estado === "Asistiré") {
    setRsvpMsg("🤍 Ya recibimos tu confirmación. No necesitas enviarla de nuevo.");
    setShowOverlay(true);
    return;
  }

  if (grupoEstado === "confirmado") {
    setRsvpMsg("🤍 Tu grupo ya confirmó asistencia.");
    setShowOverlay(true);
    return;
  }

  if (grupoEstado === "no_asiste") {
    setRsvpMsg("🤍 Tu grupo ya indicó que no podrá asistir.");
    setShowOverlay(true);
    return;
  }

  if (new Date() > DEADLINE) {
    setRsvpMsg("⏳ El tiempo de confirmación ha terminado.");
    setShowOverlay(true);
    return;
  }

  // 📝 Registrar confirmación por PRIMERA vez
  await sendRSVP(rsvpName.trim(), rsvpCount, "ASISTE");

  setConfirmations((prev) => [
    ...prev,
    { name: normalizeName(rsvpName), estado: "Asistiré" }
  ]);

  setRsvpMsg("💌 Gracias por confirmar. ¡Nos vemos en la boda! 🤍");
  setShowOverlay(true);
};


const handleNoAsistire = async () => {
  if (!guest) {
    setRsvpMsg("⚠️ Ese nombre no está en la lista de invitados.");
    setShowOverlay(true);

    return;
  }

  const nombre = normalizeName(rsvpName);
  const respuestaPrev = confirmations.find((r) => normalizeName(r.name) === nombre);

  // ✅ Caso: Ya dijo que SÍ antes → Mostrar overlay para confirmación de cambio
  if (respuestaPrev && respuestaPrev.estado === "Asistiré") {
    setShowChangeConfirm(true);
    return;
  }

  // ✅ Caso: Ya respondió que NO antes
  if (respuestaPrev && respuestaPrev.estado === "No podré asistir") {
    setRsvpMsg("🤍 Ya registraste que no puedes asistir.");
    setShowOverlay(true);

    return;
  }

  if (new Date() > DEADLINE) {
    setRsvpMsg("⏳ El tiempo de confirmación terminó.");
    setShowOverlay(true);

    return;
  }

  // ✅ Enviar NO por primera vez
  await sendRSVP(nombre, 0, "NO_ASISTE");
  setConfirmations((prev) => [...prev, { name: nombre, estado: "No podré asistir" }]);
  setRsvpMsg("🤍 Gracias por avisarnos ✨");
  setShowOverlay(true);

};

const confirmarCambioASiAsistir = async () => {
  const nombre = normalizeName(rsvpName);

  await sendRSVP(nombre, rsvpCount, "ASISTE");

  // actualizamos memoria
  setConfirmations((prev) =>
    prev.map(r =>
      normalizeName(r.name) === nombre ? { name: nombre, estado: "Asistiré" } : r
    )
  );

  setShowChangeConfirm(false);
  setRsvpMsg("💌 Hemos actualizado tu confirmación. ¡Te esperamos con alegría! 🤍");
  setShowOverlay(true);
};

const confirmarCambioANoAsistir = async () => {
  const nombre = normalizeName(rsvpName);

  await sendRSVP(nombre, 0, "NO_ASISTE");

  // Actualiza memoria
  setConfirmations((prev) =>
    prev.map(r =>
      normalizeName(r.name) === nombre ? { name: nombre, estado: "No podré asistir" } : r
    )
  );

  setShowChangeConfirm(false);
  setRsvpMsg("🤍 Hemos actualizado tu confirmación. Gracias por avisarnos.");
  setShowOverlay(true);

};


  // Cuenta bancaria (demo)
  const account = 
 " Banco Pichincha \n Cuenta de ahorros \n 2209176525 \n C.I  \n Mateo Ordóñez "
  const [copied, setCopied] = useState(false);
  const copyAccount = async () => {
    await navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const inviteRef = useRef<HTMLDivElement>(null);
  const showInvite = useScrollTrigger(inviteRef, 0.3);

  return (
    
    <div
      className={styles.pageTile}
      style={{ backgroundImage: `url(${papelTexture})` }}
      
    >
      <button className={styles.musicBtn} onClick={toggleMusic}>
  {isPlaying ? "⏸" : "🎶"}
</button>

      <CoverHero src={mostrandoAnillo} alt="Portada: manos y anillo" />

      <div className={styles.invRoot} ref={ref as any}>
        {/* NAV */}
        <nav
          className={`${styles.stickyNav} ${
            navHidden === "visible"
              ? styles.navVisible
              : navHidden === "hidden"
              ? styles.navHidden
              : ""
          }`}
        >
          <a href="#invitacion">Inicio</a>
          <a href="#invitacion">Invitación</a>
          <a href="#pedida">Carrusel</a>
          <a href="#padres">Padres</a>
          <a href="#itinerario">Itinerario</a>
          {/* <a href="#codigo">#pases</a> */}
          <a href="#rsvp">Confirmar</a>
          <a href="#galeria">Galería</a>
          <a href="#mapa">Mapa</a>
          <a href="#mesas">Mesas</a>
        </nav>

        <section id="invitacion" className={styles.inviteSection}>
          <div
            ref={inviteRef}
            className={`${styles.envelopeContainer} ${
              showInvite ? styles.active : ""
            }`}
          >
            <div className={styles.envelope}>
              <div className={styles.envelopeBody}></div>
              <div className={styles.foldLeft}></div>
              <div className={styles.foldRight}></div>
              <div className={styles.envelopeBottom}></div>
              <div className={styles.envelopeTop}></div>
            </div>

            {/* Tarjeta principal */}
            <div className={styles.inviteCard}>
              <p className={styles.inviteIntro}>
                Nos complace invitarte a celebrar nuestra unión
              </p>
              <h2 className={styles.goldText}>
                Alison Torres <span>&</span>  Mateo Ordóñez
              </h2>
              <p className={styles.inviteDetails}>
                Sábado, 7 de Marzo de 2026 <br />
                <strong>La Pradera Hacienda</strong> <br />a las 11:00 a.m.
              </p>
            </div>

            {/* Tarjeta oval */}
            <div className={styles.ovalCard}>
              <p>
                Bendecidos
                <br />
                en este
                <br />
                nuevo
                <br />
                camino
              </p>
            </div>

            {/* Banda y sello */}
            <div className={styles.bottomBand}>
              <div className={styles.paperStrip}></div>
              <div className={styles.waxSealWrapper}>
                <div className={styles.waxSeal}>
                  <span>MyA</span>
                </div>
              </div>
            </div>
          </div>
        </section>

 <div className={styles.calendarRow}>
  <button className={`${styles.btn} ${styles.ghost}`} onClick={downloadICS}>
    Apple / Outlook Calendar
  </button>

  <button className={`${styles.btn} ${styles.ghost}`} onClick={openGoogleCalendar}>
    Google Calendar
  </button>
</div>


        {/* CONTADOR */}
        <section className={styles.countStrip}>
          <div className={styles.countCircle}>
            <div>
              <span>{t.days}</span>
              <small>días</small>
            </div>
          </div>
          <div className={styles.countdown}>
            <div className={styles.timeBox}>
              <span>{t.hours}</span>
              <small>horas</small>
            </div>
            <div className={styles.timeBox}>
              <span>{t.minutes}</span>
              <small>minutos</small>
            </div>
            <div className={styles.timeBox}>
              <span>{t.seconds}</span>
              <small>segundos</small>
            </div>
          </div>
          <div className={styles.fecha}>
            Sábado <strong>7 de Marzo de 2026</strong>
          </div>
        </section>

        {/* ====== REORGANIZACIÓN A PARTIR DEL CARRUSEL ====== */}

        {/* 1. Carrusel */}
        <div
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
                src: abrazoAire,
                alt: "Abrazo en el aire",
                caption: "Para toda la vida.",
              },
              {
                src: heroImg,
                alt: "Tomados de la mano",
                caption: "Nos convertimos en uno.",
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
        </div>

        {/* 2. Con la bendición de nuestros padres... */}
        <section
          id="padres"
          className={`${styles.card} ${styles.reveal} ${styles.pases}`}
          aria-label="Padres de los novios"
        >
          <h2 className={styles.sectionTitle}>
            Con la bendición de nuestros padres
          </h2>
          <ul className={styles.parents}>
  <li>
    <strong>Vicente Ordóñez</strong> & <strong>Laura Córdova</strong>
  </li>
  <li>
    <strong>Fredy Torres</strong> & <strong>María Aguirre</strong>
  </li>
</ul>

        </section>

        {/* 3. Imagen sin bordes con efecto al hacer scroll */}
        <ScrollImage src={abrazoTierno} alt="Detalle del anillo" />

        {/* 4. Itinerario */}
        <section
          id="itinerario"
          className={`${styles.card} ${styles.reveal} ${styles.pases}`}
          data-anim="left"
          aria-label="Itinerario de la boda"
        >
          <h2 className={styles.sectionTitle}>Itinerario</h2>

          <div className={styles.itineraryGrid}>
            <div className={styles.itineraryItem}>
              <img
                src={chandelier}
                alt="Recepción"
                className={styles.itineraryIconImg}
              />
              <span className={styles.itineraryTime}>11:00</span>
              <p className={styles.itineraryText}>Recepción & Bienvenida</p>
            </div>

            <div className={styles.itineraryItem}>
              <img
                src={church}
                alt="Ceremonia"
                className={styles.itineraryIconImg}
              />
              <span className={styles.itineraryTime}>11:30</span>
              <p className={styles.itineraryText}>Ceremonia</p>
            </div>

            <div className={styles.itineraryItem}>
              <img
                src={wine}
                alt="Coctel y Fotos"
                className={styles.itineraryIconImg}
              />
              <span className={styles.itineraryTime}>13:00</span>
              <p className={styles.itineraryText}>Brindis & Fotos</p>
            </div>

            <div className={styles.itineraryItem}>
              <img
                src={tray}
                alt="Banquete"
                className={styles.itineraryIconImg}
              />
              <span className={styles.itineraryTime}>14:00</span>
              <p className={styles.itineraryText}>Banquete</p>
            </div>
          </div>

          {/* <p className={styles.tinyHint}>*Horarios referenciales</p> */}
        </section>

        {/* 5. Imagen como la 3 */}
        <ScrollImage src={manosAnillo} alt="Manos y anillo" />

        {/* 6. #pases
        <section
          id="codigo"
          className={`${styles.card} ${styles.reveal} ${styles.pases}`}
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
*/}
        {/* 7. Imagen */}
        <ScrollImage src={abrazoAlegre} alt="El gran momento" /> 

        {/* 8. Confirmar asistencia */}
        <section
          id="rsvp"
          className={`${styles.card} ${styles.reveal} ${styles.pases}`}
          aria-label="Confirmación de asistencia"
        >
          <h2 className={styles.sectionTitle}>Confirmar asistencia (RSVP)</h2>
          <form className={styles.form} onSubmit={submitRSVP}>
            <label>
  Nombre completo (como aparece en la invitación)
  <input
    className={styles.input}
    value={rsvpName}
    onChange={(e) => setRsvpName(e.target.value.toUpperCase())}
    required
  />
</label>

{rsvpName && !guest && (
  <p className={styles.bad}>⚠️ Ese nombre no está en la lista.</p>
)}

{guest && (
  <p className={styles.ok}>✅ Encontrado: tienes {guest.pases} pase(s).</p>
)}


            <label>
              Nº de personas
              <input
  className={styles.input}
  type="number"
  min={1}
  max={guest?.pases || 1}
  value={rsvpCount}
  onChange={(e) => {
    const val = parseInt(e.target.value || "1");
    setRsvpCount(Math.min(val, guest?.pases || 1));
  }}
  required
/>

            </label>
            
            <button className={`${styles.btn} ${styles.rg}`} type="submit">
              Enviar aceptación
            </button>

            <button
  type="button"
  className={`${styles.btn} ${styles.ghost}`}
  onClick={handleNoAsistire}
>
  No podré asistir
</button>
{showChangeConfirm && (
  <div className={styles.overlayBackdrop} onClick={() => setShowChangeConfirm(false)}>
    <div className={styles.overlayBox} onClick={(e) => e.stopPropagation()}>
      
      {respuestaPrev?.estado === "Asistiré" ? (
        <>
          <p>
            Ya habías confirmado que <strong>SÍ asistirás 🤍</strong><br />
            ¿Deseas cambiar tu respuesta a <strong>NO asistiré</strong>?
          </p>
          <button className={styles.btn} onClick={confirmarCambioANoAsistir}>
            Sí, cambiar a NO
          </button>
        </>
      ) : (
        <>
          <p>
            Habías indicado que <strong>NO asistirías 🤍</strong><br />
            ¿Deseas cambiar tu respuesta a <strong>SÍ asistiré</strong>?
          </p>
          <button className={styles.btn} onClick={confirmarCambioASiAsistir}>
            Sí, cambiar a SÍ
          </button>
        </>
      )}

      <button className={styles.btn} onClick={() => setShowChangeConfirm(false)}>
        Cancelar
      </button>
    </div>
  </div>
)}



            {showOverlay && (
  <div className={styles.overlayBackdrop} onClick={closeOverlay}>
    <div className={styles.overlayBox} onClick={(e) => e.stopPropagation()}>
      <p>{rsvpMsg}</p>
      <button className={styles.btn} onClick={closeOverlay}>Cerrar</button>
    </div>
  </div>
)}

          </form>
        </section>

        {/* 9. Imagen */}
        <ScrollImage src={poniendo} alt="Abrazo tierno" />

        {/* 10. Detalles de regalo */}
        <section
          id="cuenta"
          className={`${styles.card} ${styles.paper} ${styles.reveal} ${styles.pases}`}
          aria-label="Detalles de regalo"
        >
          <h2 className={styles.sectionTitle}>Detalles de regalo</h2>
          <p className={styles.muted}>
            “Compartir este momento con quienes queremos es valioso para nosotros. 
            Agradecemos que tu detalle sea través de transferencia bancaria”.
          </p>

          <div className={styles.accountRow}>
            <div className={styles.accountBox}>
              <p>
                {/* <strong>Banco:</strong> */}
                Banco Pichincha 
              </p>
              <p>
                {/* <strong>Tipo de cuenta:</strong>  */}
                Ahorros
              </p>
              <p>
                {/* <strong>Número de cuenta:</strong>  */}
                # 2209176525
              </p>
              <p>
                {/* <strong>Cédula:</strong> */}
                CI 1725393407
              </p>
              <p>
                {/* <strong>Correo:</strong>  */}
                aliymateo.07.02.2026@gmail.com
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

        {/* 10. Imagen */}
        <ScrollImage src={mesas} alt="Abrazo tierno" />

        {/* 11. Ubicación */}
        <section
          id="mapa"
          className={`${styles.card} ${styles.reveal}`}
          aria-label="Mapa de ubicación"
        >
          <h2 className={styles.sectionTitle}>Ubicación</h2>
          <p className={styles.place}>{VENUE}</p>
          <div className={styles.mapEmbed}>
            <iframe
              title="Mapa de la ubicación"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                VENUE
              )}&output=embed`}
              allowFullScreen
            />
          </div>
          <div>
            <a
              className={`${styles.btn} ${styles.rg} ${styles.botonMaps}`}
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                VENUE
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir en Google Maps
            </a>
          </div>
        </section>

        {/* 12. Ubica tu mesa */}
        <section
          id="mesas"
          className={`${styles.card} ${styles.reveal} ${styles.pases}`}
          aria-label="Plano de mesas"
        >
          <h2 className={styles.sectionTitle}>Ubica tu mesa</h2>
          <p className={styles.muted}>
            Próximamente ...
          </p>
          <div className={styles.inviteBox}>
            <img
              src={inviteImg}
              alt="Plano de mesas (temporal)"
              loading="lazy"
            />
          </div>
        </section>

        {/* 12. Footer */}
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
