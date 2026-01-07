
// Footer.tsx
import "./styles.css";

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-left">
          Copyright © | Julia Camacho
        </div>

        <div className="footer-right">
          <a
            href="https://www.instagram.com/luliet.ta?igsh=MXNyem5zdTFjY2xzYQ%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <img src="/icons/instagram.svg" alt="" className="footer-icon" />
          </a>

          <a
            href="https://www.linkedin.com/in/julia-camacho-51b1222a8/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <img src="/icons/linkedin.svg" alt="" className="footer-icon" />
          </a>

          <span className="footer-email">juliacamachogarcia@gmail.com</span>
        </div>

      </div>
    </footer>
  );
};
``
