
import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState, useCallback } from "react";
import { projects } from "../data";
import "./styles.css";

export const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  if (!projectId) return <div>Proyecto no encontrado</div>;
  const project = projects.find((p) => p.id === projectId);
  if (!project) return <div>Proyecto no encontrado</div>;

  const galleryImages = useMemo(() => (project.images ?? []).slice(0), [project.images]);
  const coverSrc = galleryImages[0];

  // Lightbox state
  const [lbOpen, setLbOpen] = useState<boolean>(false);
  const [lbIndex, setLbIndex] = useState<number>(0);

  const openLightbox = (index: number) => {
    setLbIndex(index);
    setLbOpen(true);
    document.body.style.overflow = "hidden"; // bloquea scroll del body
  };

  const closeLightbox = () => {
    setLbOpen(false);
    document.body.style.overflow = ""; // restore
  };

  const prevImage = useCallback(() => {
    setLbIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length);
  }, [galleryImages.length]);

  const nextImage = useCallback(() => {
    setLbIndex((i) => (i + 1) % galleryImages.length);
  }, [galleryImages.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!lbOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") prevImage();
      else if (e.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lbOpen, prevImage, nextImage]);

  /**
   * Medimos header y footer para calcular el área útil del lightbox.
   * Guardamos en variables CSS: --lb-top (alto del header) y --lb-bottom (alto del footer).
   * Se actualiza en resize y al abrir el lightbox.
   */
  useEffect(() => {
    const updateChromeHeights = () => {
      const header = document.querySelector<HTMLElement>("header");
      const footer = document.querySelector<HTMLElement>("footer");
      const headerH = header?.getBoundingClientRect().height ?? 0;
      const footerH = footer?.getBoundingClientRect().height ?? 0;
      const root = document.documentElement;
      root.style.setProperty("--lb-top", `${Math.ceil(headerH)}px`);
      root.style.setProperty("--lb-bottom", `${Math.ceil(footerH)}px`);
    };
    updateChromeHeights();
    window.addEventListener("resize", updateChromeHeights);
    return () => window.removeEventListener("resize", updateChromeHeights);
  }, [lbOpen]);

  return (
    <div className="project-detail-container lightbox-host">
      {/* Volver */}
      <Link to="/projects" className="back-to-projects" aria-label="Volver a proyectos">
        <span className="back-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path
              d="M15 18l-6-6 6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="back-text">Volver</span>
      </Link>

      {/* Hero (click abre lightbox) */}
      {coverSrc && (
        <img
          className="hero-image clickable-image"
          src={coverSrc}
          alt={`${project.title} — portada`}
          loading="eager"
          decoding="async"
          sizes="(max-width: 720px) 100vw, (max-width: 1366px) 100vw, 1200px"
          onClick={() => openLightbox(0)}
          draggable={false}
        />
      )}

      {/* Info */}
      <div className="project-info-container">
        <div className="project-meta">
          {project.client && (
            <span>
              <strong>Cliente:</strong> {project.client}
            </span>
          )}
          {project.team && (
            <span>
              <strong>Equipo:</strong> {project.team}
            </span>
          )}
          {project.topic && (
            <span>
              <strong>Tema:</strong> {project.topic}
            </span>
          )}
          {project.year && (
            <span className="meta-year">
              <strong>Año:</strong> {project.year}
            </span>
          )}
        </div>
        <div className="project-title-container">
          <h1>{project.title}</h1>
          {project.description && <p>{project.description}</p>}
        </div>
      </div>

      {/* Galería (click abre lightbox) */}
      {galleryImages.length > 1 && (
        <div className="project-images">
          {galleryImages.slice(1).map((src, idx) => (
            <img
              key={`${project.id}-img-${idx + 1}`}
              className="clickable-image"
              src={src}
              alt={`${project.title} — imagen ${idx + 1}`}
              loading="lazy"
              decoding="async"
              sizes="(max-width: 720px) 100vw, (max-width: 1366px) 50vw, 600px"
              onClick={() => openLightbox(idx + 1)} // +1 por la portada
              draggable={false}
            />
          ))}
        </div>
      )}

      {/* Lightbox overlay (no tapa header/footer) */}
      {lbOpen && (
        <div
          className="lightbox-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Vista ampliada de imagen"
        >
          {/* backdrop para cerrar al clicar fuera */}
          <div className="lightbox-backdrop" onClick={closeLightbox} />

          {/* Contenedor central */}
          <div className="lightbox-content" aria-live="polite">
            {/* Botón cerrar pequeño y separado */}
            <button
              type="button"
              className="lightbox-close lightbox-close--small"
              aria-label="Cerrar"
              onClick={closeLightbox}
            >
              ×
            </button>

            {/* Imagen escalada y contenida */}
            <img
              className="lightbox-img cursor-grab"
              src={galleryImages[lbIndex]}
              alt={`${project.title} — imagen ampliada ${lbIndex + 1}`}
              decoding="async"
              draggable={false}
            />
          </div>

          {/* Navegación */}
          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                className="lightbox-nav lightbox-prev"
                aria-label="Imagen anterior"
                onClick={prevImage}
              >
                ‹
              </button>
              <button
                type="button"
                className="lightbox-nav lightbox-next"
                aria-label="Imagen siguiente"
                onClick={nextImage}
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
