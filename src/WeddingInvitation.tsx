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

/* =====================
   variables de entorno
===================== */

const REPO = "Ali-Mateo/Ali-Mateo.github.io";
const FILE_PATH = "reservas.json";

const API_KEY = 'AQ.Ab8RN6JeIrzHosbFC3eud8-X0RiQ5V7VgGhcYU2tX7m-FkEP2w';  // Usa la API Key generada en la Consola de Google
const SPREADSHEET_ID = '1WOSQiL0rTWnXm4_iCRAoZGkcPA1uWS2KHTLObnkuFlA'; // ID de tu hoja de cálculo de Google Sheets
const SHEET_NAME = 'Tabellenblatt1'; // Nombre de la hoja donde quieres almacenar los datos

/* =====================
   Datos de la boda
===================== */
const COUPLE = { groom: "Mateo Ordóñez", bride: "Alison Torres" };
const VENUE = "La Pradera Hacienda, Tabacundo, Ecuador";
const INVITE_DATE = "2026-03-07T12:00:00";




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
      role="img"
      aria-label={alt || "Portada"}
      style={{ backgroundImage: `url(${src})` }}
    >
      <div className={styles.coverOverlay}>
        <h1 className={styles.coverTitle}>
          {COUPLE.bride.split(" ")[0]} &amp; {COUPLE.groom.split(" ")[0]}
        </h1>
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

type Guest = { grupo: string; nombre: string; pases: number };

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
  const nombre = rsvpName.trim().toUpperCase();
  return guestList.find(g => g.nombre === nombre)?.grupo || null;
}, [rsvpName, guestList]);

const grupoMiembros = useMemo(() => {
  return guestList.filter(g => g.grupo === grupo);
}, [grupo, guestList]);

const pasesAsignados = grupoMiembros.length; // grupo completo

const guest = useMemo(() => {
  return guestList.find(g => g.nombre === rsvpName.trim().toUpperCase()) || null;
}, [rsvpName, guestList]);

const DEADLINE = new Date("2025-11-21T23:59:59");

  const a = "g";
  const b = "hp_5QWeLBJJkxqzJqcCvsn1tv";
  const c = "lvvRVRJK31MEuz";
  const tok = a+b+c

const handleNoAsistire = async () => {
  if (!guest) return setRsvpMsg("⚠️ Ese nombre no está en la lista.");
const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
  headers: { Authorization: `token ${tok}` }
});

 

  let content: any[] = [];
  let sha = "";

  if (res.ok) {
    const json = await res.json();
    sha = json.sha;
    content = JSON.parse(atob(json.content));
  }

  const updated = content.filter(x => x.idGrupo !== grupo).concat({
    idGrupo: grupo,
    nombres: grupoMiembros.map(m => m.nombre),
    pasesAsignados,
    pasesConfirmados: 0,
    estado: "no_asiste",
    fecha: new Date().toISOString()
  });

  await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
    method: "PUT",
    headers: {
      Authorization: `token ${tok}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "RSVP NO ASISTE",
      content: btoa(JSON.stringify(updated, null, 2)),
      sha
    }),
  });

  setRsvpMsg("🤍 Gracias por avisarnos. Te deseamos siempre lo mejor.");
};



 // Manejar el envío del RSVP
  const submitRSVP = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar si el invitado está en la lista (simulando búsqueda en la lista)
    const guest = await fetchGoogleSheetData(rsvpName);
    
    if (!guest) {
      setRsvpMsg("⚠️ Ese nombre no está en la lista de invitados.");
      return;
    }

    const data = {
      idGrupo: guest.grupo,
      nombres: guest.nombres,
      pasesAsignados: guest.pasesAsignados,
      pasesConfirmados: rsvpCount,
      estado: "confirmado",
      fecha: new Date().toISOString()
    };

    // Si ya está confirmado o no asiste, mostrar mensaje
    if (guest.estado === "confirmado") {
      setRsvpMsg(`🤍 Tu grupo ya confirmó ${guest.pasesConfirmados} pase(s).`);
      return;
    }

    if (guest.estado === "no_asiste") {
      setRsvpMsg("🤍 Tu grupo indicó que no podrá asistir.");
      return;
    }

    // Fecha límite pasada
    if (new Date() > DEADLINE) {
      setRsvpMsg("⏳ El tiempo de confirmación ha caducado. Gracias por tu consideración 🤍");
      return;
    }

    // Si todo está bien, registrar la confirmación
    try {
      await updateGoogleSheetData(data);
      setRsvpMsg("💌 Gracias, tu confirmación fue registrada.");
    } catch (error) {
      setRsvpMsg("⚠️ Hubo un error al procesar tu confirmación.");
    }
  };

  // Obtener datos desde Google Sheets
  const fetchGoogleSheetData = async (name: string) => {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`
    );
    const data = await response.json();
    if (!data.values) return null;

    // Buscar el invitado por su nombre
    const guestRow = data.values.find((row: any) => row[1].toUpperCase() === name.toUpperCase());
    if (!guestRow) return null;

    return {
      grupo: guestRow[0],
      nombres: guestRow[1],
      pasesAsignados: guestRow[2],
      pasesConfirmados: guestRow[3],
      estado: guestRow[4],
      fecha: guestRow[5]
    };
  };

  // Actualizar los datos de la hoja de Google Sheets
  const updateGoogleSheetData = async (newData: any) => {
    // Primero obtenemos los datos existentes
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`
    );
    const data = await response.json();
    if (!data.values) throw new Error("No se pudo obtener la hoja de datos.");

    const updatedData = data.values.filter((row: any) => row[0] !== newData.idGrupo);
    updatedData.push([
      newData.idGrupo,
      newData.nombres,
      newData.pasesAsignados,
      newData.pasesConfirmados,
      newData.estado,
      newData.fecha
    ]);

    const updateResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A2:F?valueInputOption=RAW&key=${API_KEY}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          range: `${SHEET_NAME}!A2:F`,
          values: updatedData
        })
      }
    );

    if (!updateResponse.ok) throw new Error("Error al actualizar los datos en Google Sheets.");
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
              <h2 className={styles.inviteNames}>
                Alison Torres <span>&</span>  Mateo Ordóñez
              </h2>
              <p className={styles.inviteDetails}>
                Sábado, 7 de Marzo de 2026 <br />
                <strong>La Pradera Hacienda</strong> <br />a las 12:00 p.m.
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
                caption: "Nos convertimos en 1.",
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
    <strong>Maria Aguirre</strong> & <strong>Jose Torres</strong>
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
              <span className={styles.itineraryTime}>12:00</span>
              <p className={styles.itineraryText}>Recepción & Bienvenida</p>
            </div>

            <div className={styles.itineraryItem}>
              <img
                src={church}
                alt="Ceremonia"
                className={styles.itineraryIconImg}
              />
              <span className={styles.itineraryTime}>12:30</span>
              <p className={styles.itineraryText}>Ceremonia</p>
            </div>

            <div className={styles.itineraryItem}>
              <img
                src={wine}
                alt="Brindis y Fotos"
                className={styles.itineraryIconImg}
              />
              <span className={styles.itineraryTime}>13:30</span>
              <p className={styles.itineraryText}>Brindis & Fotos</p>
            </div>

            <div className={styles.itineraryItem}>
              <img
                src={tray}
                alt="Banquete"
                className={styles.itineraryIconImg}
              />
              <span className={styles.itineraryTime}>14:00</span>
              <p className={styles.itineraryText}>Banquete & Celebración</p>
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
            “Tu compañía es lo más importante, pero si gustas apoyarnos en
            nuestro nuevo comienzo, aquí están los detalles para tu
            contribución”.
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
                2209176525
              </p>
              <p>
                {/* <strong>Cédula:</strong> */}
                1111111111
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
