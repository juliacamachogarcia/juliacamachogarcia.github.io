"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import "./dino.css";

type Status = "idle" | "running" | "gameover";
type Obstacle = { x: number; w: number; h: number; speedBoost?: number };
type Cloud = { x: number; y: number; w: number; h: number; speed: number; type?: "cloud" | "bird" };

const skatePng = "/images/contact/skate.png"; // asegúrate de que existe

export const DinoGame = () => {
  /** ====== Física ====== */
  const GRAVITY = -1.10;
  const JUMP_VY = 20;
  const BASE_SPEED = 360;
  const SPEED_INC = 0.008;

  /** ====== Estado ====== */
  const [status, setStatus] = useState<Status>("idle");
  const statusRef = useRef<Status>("idle");
  useEffect(() => { statusRef.current = status; }, [status]);

  const [score, setScore] = useState(0);

  /** ====== Geometría ====== */
  const gameWRef = useRef(410);
  const gameHRef = useRef(410);
  const groundHRef = useRef(55);
  const playerXRef = useRef(30);

  /** ====== Animación ====== */
  const reqRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const speedRef = useRef(BASE_SPEED);
  const scoreRef = useRef(0);
  const playerYRef = useRef(0);
  const playerVyRef = useRef(0);
  const jumpingRef = useRef(false);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const spawnTimerRef = useRef(0);
  const spawnIntervalRef = useRef(1350);
  const cloudsRef = useRef<Cloud[]>([]);
  const cloudTimerRef = useRef(0);
  const invincibleUntilRef = useRef(0);
  const now = () => performance.now();

  /** ====== Pre‑carga PNG ====== */
  const [imgReady, setImgReady] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.src = skatePng;
    img.onload = () => setImgReady(true);
    img.onerror = () => setImgReady(false);
  }, []);

  /** ====== Helpers ====== */
  const getSide = () => gameWRef.current;
  const getGroundH = () => groundHRef.current;
  const getPlayerW = () => Math.round(getSide() * 0.20);
  const getPlayerH = () => Math.round(getSide() * 0.16);
  const getPlayerX = () => playerXRef.current;

  const makeCloud = (): Cloud => {
    const side = getSide();
    const w = 0.14 * side + Math.random() * 0.08 * side;
    const h = 0.04 * side + Math.random() * 0.02 * side;
    const y = 0.12 * side + Math.random() * 0.30 * side;
    const speed = 20 + Math.random() * 18;
    const type = Math.random() < 0.3 ? "bird" : "cloud";
    return { x: side + 14, y, w, h, speed, type };
  };

  /** ====== Reset ====== */
  const resetGame = () => {
    speedRef.current = BASE_SPEED;
    scoreRef.current = 0;
    setScore(0);

    obstaclesRef.current = [];
    spawnTimerRef.current = 0;
    spawnIntervalRef.current = 1300 + Math.random() * 600;

    const side = getSide();
    cloudsRef.current = [
      { x: 0.25 * side, y: 0.26 * side, w: 0.18 * side, h: 0.045 * side, speed: 20 },
      { x: 0.62 * side, y: 0.34 * side, w: 0.14 * side, h: 0.04 * side, speed: 18 },
    ];
    cloudTimerRef.current = 0;

    playerYRef.current = 0;
    playerVyRef.current = 0;
    jumpingRef.current = false;

    invincibleUntilRef.current = now() + 1200;

    setStatus("running");
    statusRef.current = "running";
    lastTimeRef.current = null;
    startLoop();
  };

  const startLoop = () => {
    cancelLoop();
    reqRef.current = requestAnimationFrame(loop);
  };
  const cancelLoop = () => {
    if (reqRef.current != null) {
      cancelAnimationFrame(reqRef.current);
      reqRef.current = null;
    }
  };

  /** ====== Input ====== */
  const jump = () => {
    if (statusRef.current !== "running") return;
    if (!jumpingRef.current && playerYRef.current <= 10) {
      jumpingRef.current = true;
      playerVyRef.current = JUMP_VY;
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (k === " " || k === "arrowup" || k === "w") {
        e.preventDefault();
        if (statusRef.current === "idle") resetGame();
        else jump();
      }
      if ((k === "r" || k === "enter") && statusRef.current === "gameover") {
        e.preventDefault();
        resetGame();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      cancelLoop();
    };
  }, []);

  /** ====== Colisión ====== */
  const collides = (
    ax: number, ay: number, aw: number, ah: number,
    bx: number, by: number, bw: number, bh: number,
    margin = 12
  ) => {
    const axm = ax + margin, aym = ay + margin;
    const awm = aw - margin * 2, ahm = ah - margin * 2;
    return axm < bx + bw && axm + awm > bx && aym < by + bh && aym + ahm > by;
  };

  /** ====== Loop ====== */
  const loop = (t: number) => {
    reqRef.current = requestAnimationFrame(loop);

    if (lastTimeRef.current == null) lastTimeRef.current = t;
    const dtMsRaw = t - lastTimeRef.current;
    const dtMs = Math.min(dtMsRaw, 16);
    const dt = dtMs / 1000;
    lastTimeRef.current = t;

    if (statusRef.current !== "running") return;

    speedRef.current += SPEED_INC;
    const speed = speedRef.current;

    const GROUND = getGroundH();
    const side = getSide();
    const pW = getPlayerW();
    const pH = getPlayerH();

    // Física
    playerVyRef.current += GRAVITY;
    playerYRef.current += playerVyRef.current;
    const maxY = Math.max(0, side - GROUND - pH);
    if (playerYRef.current < 0) {
      playerYRef.current = 0;
      playerVyRef.current = 0;
      jumpingRef.current = false;
    }
    if (playerYRef.current > maxY) {
      playerYRef.current = maxY;
      playerVyRef.current = 0;
    }

    // Obstáculos
    spawnTimerRef.current += dtMs;
    if (spawnTimerRef.current >= spawnIntervalRef.current) {
      spawnTimerRef.current = 0;
      spawnIntervalRef.current = 1300 + Math.random() * 600;

      const w = 0.045 * side + Math.random() * 0.055 * side;
      const h = 0.065 * side + Math.random() * 0.075 * side;
      const speedBoost = Math.random() < 0.15 ? 1.5 : 1;
      obstaclesRef.current.push({ x: side + 14, w, h, speedBoost });

      if (Math.random() < 0.25) {
        const w2 = 0.03 * side + Math.random() * 0.04 * side;
        const h2 = 0.05 * side + Math.random() * 0.07 * side;
        obstaclesRef.current.push({ x: side + 14 + w + 12, w: w2, h: h2 });
      }
    }

    for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
      const o = obstaclesRef.current[i];
      o.x -= speed * dt * (o.speedBoost ?? 1);
      if (o.x + o.w < 0) obstaclesRef.current.splice(i, 1);
    }

    // Nubes / pájaros
    cloudTimerRef.current += dtMs;
    if (cloudTimerRef.current >= 700) {
      cloudTimerRef.current = 0;
      cloudsRef.current.push(makeCloud());
    }
    for (let i = cloudsRef.current.length - 1; i >= 0; i--) {
      const c = cloudsRef.current[i];
      c.x -= c.speed * dt;
      if (c.x + c.w < -14) cloudsRef.current.splice(i, 1);
    }

    // Puntuación
    scoreRef.current += dt * (speed / 8);
    setScore(Math.floor(scoreRef.current));

    // Colisiones
    if (now() > invincibleUntilRef.current) {
      const ax = getPlayerX();
      const ay = side - GROUND - pH - playerYRef.current;
      for (const o of obstaclesRef.current) {
        const bx = o.x;
        const by = side - GROUND - o.h;
        if (collides(ax, ay, pW, pH, bx, by, o.w, o.h, 12)) {
          setStatus("gameover");
          statusRef.current = "gameover";
          break;
        }
      }
    }
  };

  /** ====== Render ====== */
  const side = getSide();
  const pW = getPlayerW();
  const pH = getPlayerH();
  const GROUND = getGroundH();
  const baselineFix = 45;
  const playerTop = Math.round(side - GROUND - pH - playerYRef.current + baselineFix);
  const playerLeft = Math.round(getPlayerX());

  const tilt = Math.min(Math.max(playerVyRef.current * 2, -15), 15);
  const playerStyle: CSSProperties = {
    position: "absolute",
    left: playerLeft,
    top: playerTop,
    width: pW,
    height: pH,
    backgroundImage: imgReady ? `url(${skatePng})` : "none",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    imageRendering: "pixelated",
    transform: `rotate(${tilt}deg)`,
  };

  const obstacles = obstaclesRef.current;
  const clouds = cloudsRef.current;

  return (
    <div className="contact-game-container" style={{ display: "block", width: "100%" }}>
      <div
        className="dino-game-area align-right"
        style={{ width: `${gameWRef.current}px`, height: `${gameHRef.current}px` }}
        onPointerDown={() => {
          if (statusRef.current === "idle") resetGame();
          else if (statusRef.current === "running") jump();
        }}
      >
        {clouds.map((c, i) => (
          <div
            key={`cloud-${i}`}
            className={`dino-cloud white-drawing ${c.type === "bird" ? "bird" : ""}`}
            style={{
              position: "absolute",
              left: Math.round(c.x),
              top: Math.round(c.y),
              width: Math.round(c.w),
              height: Math.round(c.h),
              borderRadius: Math.round(c.h / 2),
            }}
          />
        ))}

        {obstacles.map((o, i) => (
          <div
            key={`cactus-${i}`}
            className="dino-cactus white-drawing"
            style={{
              position: "absolute",
              left: Math.round(o.x),
              top: Math.round(side - GROUND - o.h),
              width: Math.round(o.w),
              height: Math.round(o.h),
              borderRadius: 6,
            }}
          />
        ))}

        <div className="dino-player skate" style={playerStyle} aria-label="skate" />

        <div
          className="dino-ground"
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100%",
            height: `${GROUND}px`,
            background: "transparent",
          }}
        >
          <div className="dino-ground-line" />
        </div>

        <div
          style={{
            position: "absolute",
            right: 6,
            top: 4,
            color: "#fff",
            font: "700 12px/1.2 system-ui, -apple-system, Segoe UI, Roboto, Arial",
            letterSpacing: 1,
            textShadow: "0 1px 0 rgba(0,0,0,.35)",
          }}
        >
          {String(score).padStart(5, "0")}
        </div>

        {status !== "running" && (
          <div className="gameover-overlay">
            <div>
              <div className="gameover-text">
                {status === "idle" ? "Pulsa para empezar" : "Game Over"}
              </div>
              <div className="gameover-sub">
                {status === "idle" ? "Click / Space / ↑" : "Pulsa R o Enter para reiniciar"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
