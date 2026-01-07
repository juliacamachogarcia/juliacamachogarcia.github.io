
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import "./styles.css";
import { DinoGame } from "./DinoGame";
<meta name="viewport" content="width=device-width, initial-scale=1" />

/** Hook robusto: asume "pequeño" al inicio para evitar parpadeo,
 *  y luego confirma con matchMedia (umbral ajustable) */
function useIsSmallScreen(query = "(max-width: 720px)") {
  // ⚠️ Arrancamos asumiendo que es pequeño para no montar el juego hasta medir
  const [isSmall, setIsSmall] = useState<boolean>(true);

  useEffect(() => {
    // Solo en cliente hay window
    if (typeof window !== "undefined") {
      const mq = window.matchMedia(query);
      const update = () => setIsSmall(mq.matches);
      update(); // estado inicial con medida real
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }
  }, [query]);

  return isSmall;
}

export const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [botField, setBotField] = useState<string>(""); // honeypot

  // ✅ No montar minijuego si es pantalla pequeña (≤ 720px por defecto)
  const isSmallScreen = useIsSmallScreen("(max-width: 720px)");

  const FORMSPREE_JSON_ENDPOINT = "https://formspree.io/f/mvgeqrqr";

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (botField) return; // bot detectado

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg("Por favor, completa todos los campos.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch(FORMSPREE_JSON_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setErrorMsg(
          (data as any)?.errors?.[0]?.message ||
            "No se pudo enviar el mensaje. Inténtalo más tarde."
        );
      }
    } catch {
      setStatus("error");
      setErrorMsg("Error de red. Revisa tu conexión e inténtalo de nuevo.");
    }
  };

  return (
    <div className="contact-container">
      <h1 className="page-title">Vamos a conocernos :)</h1>

      {/* Layout: formulario a la izquierda + minijuego a la derecha */}
      <div className="contact-content">
        {/* Columna izquierda: formulario */}
        <div className="contact-form">
          <form onSubmit={handleSubmit} aria-label="Formulario de contacto" noValidate>
            {/* Honeypot oculto */}
            <input
              type="text"
              name="_gotcha"
              value={botField}
              onChange={(e) => setBotField(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              style={{ display: "none" }}
            />
            {/* (Opcional) Asunto en Formspree */}
            <input type="hidden" name="_subject" value="Nuevo mensaje" />

            <div className="form-group">
              <label htmlFor="name">Nombre</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Tu nombre"
                autoComplete="name"
                required
                disabled={status === "sending"}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Tu correo electrónico"
                autoComplete="email"
                required
                disabled={status === "sending"}
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Mensaje</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Tu mensaje"
                rows={6}
                required
                disabled={status === "sending"}
              />
            </div>

            {/* Mensajes justo debajo del último campo */}
            <div className="form-messages" aria-live="polite">
              {status === "error" && <p className="form-error" role="alert">{errorMsg}</p>}
              {status === "success" && (
                <p className="form-success" role="status">
                  ¡Gracias! Tu mensaje se ha enviado correctamente :)
                </p>
              )}
            </div>

            <button type="submit" className="submit-button" disabled={status === "sending"}>
              {status === "sending" ? "Enviando..." : "Enviar"}
            </button>
          </form>
        </div>

        {/* Columna derecha: Minijuego (reemplaza la imagen) */}
        <div
          className="contact-game-container"
          aria-hidden={isSmallScreen} // oculto para lectores si no se muestra
        >
          {/* ✅ No renderizamos el juego en pantallas pequeñas */}
          {!isSmallScreen && <DinoGame />}
        </div>
      </div>
    </div>
  );
};
