import { useState } from "react";
import { Link } from "react-router-dom";
import "./styles.css"; // CSS del header

export const Header = () => {
  const [menuActive, setMenuActive] = useState(false);

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  return (
    <header className="header">
      {/* Logo */}
      <h1 className="logo">
        <Link to="/" className="nav-link">
          <img
            src="/images/logo.png" // Cambia la ruta si quieres usar src/assets/logo.png
            alt="Logo Julia Camacho"
            className="logo-img"
          />
        </Link>
      </h1>

      {/* Menú */}
      <nav className={`nav-menu ${menuActive ? "active" : ""}`}>
        <Link to="/projects" className="nav-link">PROYECTOS</Link>
        <Link to="/about" className="nav-link">SOBRE MÍ</Link>
        <Link to="/contacto" className="nav-link">CONTACTO</Link>
      </nav>

      {/* Icono hamburguesa */}
      <div className="menu-icon" onClick={toggleMenu}>
        ☰
      </div>
    </header>
  );
};
