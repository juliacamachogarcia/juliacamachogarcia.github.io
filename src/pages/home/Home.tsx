
import React from "react";
import "./styles.css";
import Puzzle from "./puzzle";
import { useNavigate } from "react-router-dom";

export const Home: React.FC = () => {
  const navigate = useNavigate();

  // ✅ Usa la ruta real de tu router: "/projects"
  const goProjects = () => navigate("/projects");

  // (Opcional) accesibilidad: Enter/Espacio también navegan
  const onKeyDownSeparator = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goProjects();
    }
  };

  return (
    <div className="home">
      <section className="intro">
        {/* Bloque de texto */}
        <div className="intro-text">
          <h1>
            ¡Hola! <span>Soy Julia </span>
          </h1>
          <p className="subtitle">
            una diseñadora, ilustradora y creadora digital de Valencia, España.{" "}
            <span className="arrows">↓↓↓</span>
          </p>
        </div>

        {/* Puzzle 2x2 */}
        <div className="intro-puzzle">
          <Puzzle basePath="/images/home" tileSize={200} snapRadius={50} />
        </div>

        {/* === Separador (borde a borde, sin redondeos, bucle perfecto) === */}
        <div
          className="section-separator"
          role="separator"
          aria-orientation="horizontal"
          aria-label="Separador de secciones"
        >
          <div className="sep-line" aria-hidden="false">
            <button
              className="sep-marquee"
              aria-label="Ver más proyectos"
              onClick={goProjects}
              onKeyDown={onKeyDownSeparator}
              type="button"
            >
              {/* Track animado: contiene DOS bloques idénticos */}
              <div className="marquee-track">
                {/* Bloque A */}
                <div className="marquee-inner">
                  <span className="marquee-item">¡MIRA MIS PROYECTOS!</span>
                  <span className="marquee-item">¡MIRA MIS PROYECTOS!</span>
                  <span className="marquee-item">¡MIRA MIS PROYECTOS!</span>
                  <span className="marquee-item">¡MIRA MIS PROYECTOS!</span>
                  <span className="marquee-item">¡MIRA MIS PROYECTOS!</span>
                  <span className="marquee-item">¡MIRA MIS PROYECTOS!</span>
                  <span className="marquee-item">¡MIRA MIS PROYECTOS!</span>
                  <span className="marquee-item">¡MIRA MIS PROYECTOS!</span>
                </div>
                {/* Bloque B (duplicado) */}
                <div className="marquee-inner" aria-hidden="true">
                  <span className="marquee-item">¡MIRA MIS PROYECTOS!</span>
                  <span className="marquee-item">¡MIRA MIS PROYECTOS!</span>
                  <span className="marquee-item">¡MIRA MIS PROYECTOS!</span>
                  <span className="marquee-item">¡MIRA MIS PROYECTOS!</span>
                  <span className="marquee-item">¡MIRA MIS PROYECTOS!</span>
                  <span className="marquee-item">¡MIRA MIS PROYECTOS!</span>
                  <span className="marquee-item">¡MIRA MIS PROYECTOS!</span>
                  <span className="marquee-item">¡MIRA MIS PROYECTOS!</span>
                </div>
              </div>
            </button>
          </div>
        </div>
        {/* === Fin separador === */}

        {/* Tu GIF */}
        <div className="gif-container">
          <img className="intro-gif" src="/images/home/tortu.gif" alt="Tortu" />
        </div>

        {/* Texto de bienvenida */}
        <div className="intro-text">
          <p className="welcome-text">
            ¡Siéntete bienvenidx a mi web! Espero que te guste lo que hay por aquí :)
          </p>
        </div>
      </section>
       </div>
  );
}