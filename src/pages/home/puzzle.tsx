
import React, { useMemo, useState, useRef, useEffect } from "react";

type PuzzleProps = {
  /** Carpeta donde están 1.png, 2.png, 3.png, 4.png */
  basePath?: string;
  /** Tamaño uniforme de cada celda en px */
  tileSize?: number;
  /** Separación visual entre celdas (normalmente 0) */
  gap?: number;
  /** Solape para “cerrar” la junta interna y evitar líneas (1–3 px suele bastar) */
  overlap?: number;
  /** (Ignorado en cuadrícula estática) sólo para mantener la firma de props */
  snapRadius?: number;
  /** escala aplicada a la pieza `2.png` */
  scale2?: number;
  /** escala aplicada a la pieza `4.png` */
  scale4?: number;
};

const SIZE = 2;
const IDS = [1, 2, 3, 4] as const;
const CELL: Record<number, { col: 0 | 1; row: 0 | 1 }> = {
  1: { col: 0, row: 0 }, // arriba-izq
  2: { col: 1, row: 0 }, // arriba-der
  3: { col: 0, row: 1 }, // abajo-izq
  4: { col: 1, row: 1 }, // abajo-der
};

const makeSources = (basePath: string) =>
  IDS.map((id) => ({ id, src: `${basePath}/${id}.png` }));

const Puzzle: React.FC<PuzzleProps> = ({
  basePath = "/images/home",
  tileSize = 200,
  gap = 0,
  overlap = 2, // sube a 3 si ves una línea fina en la cruz central
  snapRadius = 24,
  scale2 = 1.05,
  scale4 = 1.2,
}) => {
  const sources = useMemo(() => makeSources(basePath), [basePath]);

  const boardW = SIZE * tileSize + gap; // 2 columnas + 1 junta
  const boardH = SIZE * tileSize + gap; // 2 filas + 1 junta

  const boardRef = useRef<HTMLDivElement | null>(null);

  // posiciones objetivo basadas en la cuadrícula (incluye overlap)
  const targets = useMemo(() => {
    const m: Record<number, { x: number; y: number }> = {};
    for (const id of IDS) {
      const { col, row } = CELL[id];
      const tx = col * tileSize + (col === 1 ? -overlap : 0);
      const ty = row * tileSize + (row === 1 ? -overlap : 0);
      m[id] = { x: tx, y: ty };
    }
    return m;
  }, [tileSize, overlap]);

  // inicial: mezclar las piezas entre las celdas para que no empiecen ya colocadas
  const initialPositions = useMemo(() => {
    const ids = [...IDS];
    // crear arreglo de posiciones objetivo
    const posArr = ids.map((id) => ({ id, ...targets[id] }));
    // mezclar posiciones
    for (let i = posArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [posArr[i], posArr[j]] = [posArr[j], posArr[i]];
    }
    // si alguna pieza quedó en su sitio, rotamos las posiciones para evitar coincidencias
    let allGood = false;
    for (let attempt = 0; attempt < 5 && !allGood; attempt++) {
      allGood = true;
      for (let k = 0; k < ids.length; k++) {
        if (ids[k] === posArr[k].id) {
          // rotar una posición
          posArr.push(posArr.shift()!);
          allGood = false;
          break;
        }
      }
    }

    const map: Record<number, { x: number; y: number; placed: boolean; z: number }> = {};
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      map[id] = { x: posArr[i].x, y: posArr[i].y, placed: false, z: 1 };
    }
    return map;
  }, [targets]);

  const [pieces, setPieces] = useState(initialPositions);
  const dragState = useRef<{
    id: number | null;
    offsetX: number;
    offsetY: number;
    startX: number;
    startY: number;
  }>({ id: null, offsetX: 0, offsetY: 0, startX: 0, startY: 0 });

  // Z-index manager simple
  const topZ = useRef(2);

  useEffect(() => {
    // si cambia el tamaño o props, resetear posiciones a una mezcla nueva
    setPieces(initialPositions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPositions]);

  const onPointerDown = (e: React.PointerEvent, id: number) => {
    const br = boardRef.current?.getBoundingClientRect();
    if (!br) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    const p = pieces[id];
    const clientX = e.clientX;
    const clientY = e.clientY;
    dragState.current = {
      id,
      offsetX: clientX - (br.left + p.x),
      offsetY: clientY - (br.top + p.y),
      startX: p.x,
      startY: p.y,
    };
    // elevar z
    topZ.current += 1;
    setPieces((prev) => ({ ...prev, [id]: { ...prev[id], z: topZ.current } }));
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const cur = dragState.current;
    if (cur.id == null) return;
    const br = boardRef.current?.getBoundingClientRect();
    if (!br) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    const nx = clientX - br.left - cur.offsetX;
    const ny = clientY - br.top - cur.offsetY;
    setPieces((prev) => ({ ...prev, [cur.id!]: { ...prev[cur.id!], x: nx, y: ny } }));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const cur = dragState.current;
    if (cur.id == null) return;
    const id = cur.id;
    const target = targets[id];
    const p = pieces[id];
    const dx = p.x - target.x;
    const dy = p.y - target.y;
    const dist = Math.hypot(dx, dy);
    const placed = dist <= snapRadius;
    setPieces((prev) => ({ ...prev, [id]: { ...prev[id], x: placed ? target.x : prev[id].x, y: placed ? target.y : prev[id].y, placed, z: placed ? 1 : prev[id].z } }));
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {}
    dragState.current = { id: null, offsetX: 0, offsetY: 0, startX: 0, startY: 0 };
  };

  return (
    <section className="puzzle-section">
      <div
        ref={boardRef}
        className="puzzle-gridboard"
        aria-label="Puzzle 2x2 (arrastrable)"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          width: boardW,
          height: boardH,
          position: "relative",
          gap: `${gap}px`,
          overflow: "visible",
          background: "transparent",
        }}
      >
        {sources.map(({ id, src }) => {
          const piece = pieces[id];
          const z = piece?.z ?? 1;
          const x = piece?.x ?? targets[id].x;
          const y = piece?.y ?? targets[id].y;
          const isLarge = id === 4;
          const isSlightLarge = id === 2;
          const scaleVal = isLarge ? scale4 : isSlightLarge ? scale2 : undefined;

          return (
            <div
              key={id}
              className={`puzzle-piece piece-${id}`}
              onPointerDown={(e) => onPointerDown(e, id)}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: tileSize,
                height: tileSize,
                transform: `translate(${x}px, ${y}px)`,
                transition: "transform 200ms cubic-bezier(.2,.9,.2,1)",
                touchAction: "none",
                zIndex: z,
                overflow: "visible",
                cursor: piece?.placed ? "default" : "grab",
                pointerEvents: piece?.placed ? "none" : undefined,
              }}
            >
              <img
                src={src}
                alt={`Ficha ${id}`}
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: "top left",
                  display: "block",
                  pointerEvents: "none",
                  transform: scaleVal ? `scale(${scaleVal})` : undefined,
                  transformOrigin: scaleVal ? "top left" : undefined,
                  transition: "transform 200ms cubic-bezier(.2,.9,.2,1)",
                }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Puzzle;
