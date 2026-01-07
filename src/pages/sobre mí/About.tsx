
import React from "react";
import "./styles.css";
import { useNavigate } from "react-router-dom";

export const About: React.FC = () => {
  const navigate = useNavigate();
  const goContact = () => navigate("/contacto");

  return (
    <div className="about-container fade-in">
      {/* Pantalla entre header fixed y footer fixed */}
      <section className="about-screen">
        {/* IZQUIERDA: imagen fija, siempre completa */}
        <aside className="about-left" aria-label="Retrato">
          <div className="about-left-frame">
            <img
              src="/images/about/yoo.png"
              alt="Retrato de Julia"
              className="about-image-fixed"
            />
            {/* Stickers opcionales dentro del frame */}
          </div>
        </aside>

        {/* DERECHA: contenido con scroll propio */}
        <main className="about-right">
          {/* HERO */}
          <section className="about-text">
            <h1 className="about-title">
              Hola, soy <span className="highlight">Julia Camacho</span>
              <br />
              <span className="subtitle">Creadora digital, ilustradora y diseñadora.</span>
            </h1>

            <p className="lede">
              Como creativa, siempre estoy buscando nuevas herramientas y desafíos para crecer profesional
              y personalmente. Mis intereses actuales se centran en
              <strong> ilustración</strong>, <strong> diseño digital</strong> y
              <strong> proyectos multimedia</strong> en general.
            </p>
            <p>
              Desde que era pequeña he tenido un lápiz en la mano, así que hoy en día, sigo comenzando con métodos tradicionales antes de pasar a lo digital.
              ¡Me encanta el proceso de crear, especialmente cuando viene de diferentes perspectivas, porque siempre aprendo algo nuevo!
            </p>

            <div className="about-cta">
              {/* Botón que navega a /contacto */}
              <button type="button" className="btn ghost" onClick={goContact} aria-label="Ir a Contacto">
                Contactar
              </button>
            </div>
          </section>

          {/* SECCIONES */}
          <section className="about-sections">
            <div className="section-block">
              <h2 className="section-title">EDUCACIÓN</h2>
              <div className="timeline" role="list">
                <article className="card" role="listitem">
                  <h3>2023 — Actualidad</h3>
                  <p>
                    Grado en Diseño y Tecnologías Creativas<br />
                    Universitat Politècnica de València (España)
                  </p>
                </article>
                <article className="card" role="listitem">
                  <h3>Septiembre 2025 — Enero 2026 </h3>
                  <p>
                    Grado en Diseño<br />
                    Intercambio académico. Universidad Complutense de Madrid (España)
                  </p>
                </article>
              </div>
            </div>

            <div className="section-block">
              <h2 className="section-title">HABILIDADES</h2>
              <ul className="skills" aria-label="Lista de habilidades">
                <li className="skill">Illustrator</li>
                <li className="skill">InDesign</li>
                <li className="skill">Photoshop</li>
                <li className="skill">Premiere</li>
                <li className="skill">After Effects</li>
                <li className="skill">Diseño 3D (Blender)</li>
              </ul>
            </div>
          </section>
        </main>
      </section>
       </div>
  );
}