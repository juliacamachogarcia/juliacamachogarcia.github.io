
import "./styles.css";
import { useNavigate } from "react-router-dom";
import { useMemo, useState, KeyboardEvent } from "react";
import { projects } from "./data";

/* ===== Tipos ===== */
type Category = {
  id: string;    // <- corrige el tipo que estaba vacío
  label: string;
};

type Project = {
  id: string;
  title: string;
  // Soportamos ambas formas sin romper data.ts:
  category?: string | string[]; // legacy o mixto
  categories?: string[];        // nuevo (multi)
  link?: string;
  images: string[];
  description?: string;
  client?: string;
  team?: string;
  topic?: string;
  year?: number;
};

/* ===== Categorías fijas para la UI (igual que tenías) ===== */
const CATEGORIES: Category[] = [
  { id: "todos",            label: "Todos" },
  { id: "ilustración",      label: "Ilustración" },
  { id: "audiovisual",      label: "Audiovisual" },
  { id: "gráfico",          label: "Gráfico" },
  { id: "identidad visual", label: "Identidad Visual" },
  { id: "editorial",        label: "Editorial" },
  { id: "fotografía",       label: "Fotografía" },
];

/* ===== Normalizador: siempre devuelve un array de categorías ===== */
const getCategories = (p: Project): string[] => {
  if (Array.isArray(p.categories)) return p.categories;
  if (Array.isArray(p.category)) return p.category;
  if (typeof p.category === "string" && p.category.trim()) return [p.category.trim()];
  return [];
};

export const Projects = () => {
  const navigate = useNavigate();

  // MISMO estado que ya tenías: una sola categoría activa
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");

  // MISMO filtrado visual, pero comprobando contra un array de categorías
  const filteredProjects = useMemo<Project[]>(() => {
    const list = projects as Project[];
    if (selectedCategory === "todos") return list;
    return list.filter((p) => getCategories(p).includes(selectedCategory));
  }, [selectedCategory]);

  const handleProjectClick = (link?: string) => {
    if (!link) return;
    navigate(link);
  };

  const handleItemKeyDown = (e: KeyboardEvent<HTMLDivElement>, link?: string) => {
    if (!link) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(link);
    }
  };

  return (
    <div className="projects-container">
      {/* Filtros por categoría (SIN CAMBIOS VISUALES) */}
      <div className="category-filters" role="tablist" aria-label="Filtrar proyectos por categoría">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`filter-button ${selectedCategory === cat.id ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat.id)}
            type="button"
            role="tab"
            aria-selected={selectedCategory === cat.id}
            aria-controls={`panel-${cat.id}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid de proyectos */}
      <div
        className="projects-list"
        id={`panel-${selectedCategory}`}
        role="tabpanel"
        aria-labelledby={selectedCategory}
      >
        {filteredProjects.map((project) => {
          const cover = project.images?.[0];
          const hasCover = Boolean(cover);
          return (
            <div
              key={project.id}
              className="project-item"
              onClick={() => handleProjectClick(project.link)}
              role="button"
              aria-label={project.title}
              tabIndex={0}
              onKeyDown={(e) => handleItemKeyDown(e, project.link)}
            >
              {/* Imagen del proyecto (portada) */}
              {hasCover ? (
                <img
                  src={cover}
                  alt={project.title}
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 720px) 100vw, (max-width: 1366px) 33vw, 420px"
                />
              ) : (
                <div
                  className="project-cover-placeholder"
                  aria-hidden="true"
                  title="Sin imagen de portada"
                />
              )}

              {/* Overlay semitransparente */}
              <div className="project-overlay" aria-hidden="true" />

              {/* Título centrado en medio */}
              <div className="project-title-center">
                <h3>{project.title}</h3>
              </div>
            </div>
          );
        })}

        {/* Mensaje cuando no hay resultados */}
        {filteredProjects.length === 0 && (
          <div className="projects-empty" role="status" aria-live="polite">
          
          </div>
        )}
      </div>
    </div>
  );
}