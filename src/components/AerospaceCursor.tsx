import { useEffect, useRef, useState } from 'react';

/**
 * AerospaceCursor
 *
 * Reference: image 2 — satellite/targeting interface cursor.
 * Elements:
 *   1. Large outer ring (80px) — thin stroke, rotating slowly, with 4 tick marks
 *   2. Inner corner brackets (32px square) — L-shaped at 4 corners
 *   3. Center crosshair — thin 16px cross lines
 *   4. Coordinate readout — live AXIS_X / AXIS_Y values to 3dp
 *   5. Small label — "TRACK" below coordinates
 *
 * All animation via requestAnimationFrame + DOM-direct writes. Zero re-renders.
 * Hidden on touch-only devices (hover: none).
 */

const OUTER_RING   = 80;   // px
const BRACKET_SIZE = 30;   // px — corner bracket square extent
const CROSS_ARM    = 10;   // px — half-length of center crosshair arm
const COORD_OFFSET = 52;   // px — coordinate block offset from cursor center

export default function AerospaceCursor() {
    const wrapRef   = useRef<HTMLDivElement>(null);
    const ringRef   = useRef<HTMLDivElement>(null);
    const crossHRef = useRef<HTMLDivElement>(null); // horizontal arm
    const crossVRef = useRef<HTMLDivElement>(null); // vertical arm
    const coordXRef = useRef<HTMLSpanElement>(null);
    const coordYRef = useRef<HTMLSpanElement>(null);

    const mousePos  = useRef({ x: -400, y: -400 });
    const ringPos   = useRef({ x: -400, y: -400 });
    const ringRot   = useRef(0);
    const isHover   = useRef(false);
    const rafId     = useRef<number>(0);

    const [show, setShow] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
        setShow(mq.matches);
    }, []);

    useEffect(() => {
        if (!show) return;

        const onMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
        };
        const onOver = (e: MouseEvent) => {
            const el = e.target as HTMLElement;
            if (el.closest('a, button, [role="button"], input, textarea')) {
                isHover.current = true;
            }
        };
        const onOut = (e: MouseEvent) => {
            const rel = e.relatedTarget as HTMLElement | null;
            if (!rel?.closest('a, button, [role="button"], input, textarea')) {
                isHover.current = false;
            }
        };

        document.addEventListener('mousemove', onMove, { passive: true });
        document.addEventListener('mouseover', onOver, { passive: true });
        document.addEventListener('mouseout',  onOut,  { passive: true });

        const LERP = 0.12;
        const W    = window.innerWidth;
        const H    = window.innerHeight;

        const animate = () => {
            const mx = mousePos.current.x;
            const my = mousePos.current.y;

            // Ring trails with lerp
            ringPos.current.x += (mx - ringPos.current.x) * LERP;
            ringPos.current.y += (my - ringPos.current.y) * LERP;
            const rx = ringPos.current.x;
            const ry = ringPos.current.y;

            // Outer ring slowly rotates
            ringRot.current += 0.15; // degrees per frame
            const hov = isHover.current;
            const ringScale = hov ? 1.25 : 1;

            if (wrapRef.current) {
                wrapRef.current.style.transform = `translate3d(${mx}px,${my}px,0)`;
                wrapRef.current.style.opacity   = mx < -100 ? '0' : '1';
            }
            if (ringRef.current) {
                const off = (OUTER_RING * ringScale) / 2;
                ringRef.current.style.transform =
                    `translate3d(${rx - mx - off}px,${ry - my - off}px,0) rotate(${ringRot.current}deg)`;
                ringRef.current.style.width  = `${OUTER_RING * ringScale}px`;
                ringRef.current.style.height = `${OUTER_RING * ringScale}px`;
                ringRef.current.style.borderColor = hov
                    ? 'rgba(34,211,238,0.85)'
                    : 'rgba(34,211,238,0.50)';
            }

            // Live coordinates (normalised -1…1, 4dp)
            const nx = ((mx / W - 0.5) * 2).toFixed(4);
            const ny = (-(my / H - 0.5) * 2).toFixed(4);
            if (coordXRef.current) coordXRef.current.textContent = nx;
            if (coordYRef.current) coordYRef.current.textContent = ny;

            rafId.current = requestAnimationFrame(animate);
        };
        rafId.current = requestAnimationFrame(animate);

        return () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseover', onOver);
            document.removeEventListener('mouseout',  onOut);
            cancelAnimationFrame(rafId.current);
        };
    }, [show]);

    if (!show) return null;

    const cyan50  = 'rgba(34,211,238,0.50)';
    const cyan80  = 'rgba(34,211,238,0.80)';
    const white60 = 'rgba(255,255,255,0.60)';

    // Shared style for cursor elements: fixed to 0,0 with transform applied
    const base: React.CSSProperties = {
        position:     'fixed',
        top:          0,
        left:         0,
        pointerEvents: 'none',
        zIndex:       99999,
    };

    return (
        <>
            {/* ── Master wrapper — follows cursor exactly ── */}
            <div ref={wrapRef} aria-hidden style={{ ...base, willChange: 'transform', transition: 'opacity 0.2s' }}>

                {/* 1 ── Center precision dot */}
                <div style={{
                    position:     'absolute',
                    width:        4,
                    height:       4,
                    borderRadius: '50%',
                    background:   white60,
                    transform:    'translate(-50%,-50%)',
                }} />

                {/* 2 ── Center crosshair arms */}
                {/* Horizontal */}
                <div ref={crossHRef} style={{
                    position:  'absolute',
                    width:     CROSS_ARM * 2,
                    height:    1,
                    background: cyan50,
                    transform: `translate(${-CROSS_ARM}px,-0.5px)`,
                }} />
                {/* Vertical */}
                <div ref={crossVRef} style={{
                    position:  'absolute',
                    width:     1,
                    height:    CROSS_ARM * 2,
                    background: cyan50,
                    transform: `translate(-0.5px,${-CROSS_ARM}px)`,
                }} />

                {/* 3 ── Corner brackets — 4 L-shapes */}
                {([
                    { t: -BRACKET_SIZE, l: -BRACKET_SIZE, rb: 'top-left'     },
                    { t: -BRACKET_SIZE, l:  BRACKET_SIZE - 6, rb: 'top-right'    },
                    { t:  BRACKET_SIZE - 6, l: -BRACKET_SIZE, rb: 'bottom-left'  },
                    { t:  BRACKET_SIZE - 6, l:  BRACKET_SIZE - 6, rb: 'bottom-right' },
                ] as Array<{ t: number; l: number; rb: string }>).map(({ t, l, rb }) => {
                    const isTop    = t < 0;
                    const isLeft   = l < 0;
                    const LEN      = 8; // px arm length
                    const TK       = 1.2; // px thickness
                    return (
                        <div key={rb} style={{ position: 'absolute', top: t, left: l, width: LEN, height: LEN }}>
                            {/* Vertical arm */}
                            <div style={{
                                position:   'absolute',
                                width:      TK,
                                height:     LEN,
                                background: cyan80,
                                left:       isLeft ? 0 : LEN - TK,
                                top:        0,
                            }} />
                            {/* Horizontal arm */}
                            <div style={{
                                position:   'absolute',
                                height:     TK,
                                width:      LEN,
                                background: cyan80,
                                top:        isTop ? 0 : LEN - TK,
                                left:       0,
                            }} />
                        </div>
                    );
                })}

                {/* 4 ── Coordinate readout — offset below-right of cursor */}
                <div style={{
                    position:   'absolute',
                    top:        COORD_OFFSET,
                    left:       COORD_OFFSET,
                    fontFamily: "'Barlow Condensed', 'JetBrains Mono', monospace",
                    fontSize:   9,
                    fontWeight: 500,
                    lineHeight: 1.6,
                    color:      'rgba(34,211,238,0.70)',
                    letterSpacing: '0.05em',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                }}>
                    <div>AXIS_X <span ref={coordXRef} style={{ color: white60 }}>0.0000</span></div>
                    <div>AXIS_Y <span ref={coordYRef} style={{ color: white60 }}>0.0000</span></div>
                    <div style={{ color: 'rgba(34,211,238,0.35)', marginTop: 4, fontSize: 7, letterSpacing: '0.12em' }}>
                        TRACK
                    </div>
                </div>
            </div>

            {/* ── Outer ring — separate element so it can trail independently ── */}
            <div
                ref={ringRef}
                aria-hidden
                style={{
                    ...base,
                    width:        OUTER_RING,
                    height:       OUTER_RING,
                    borderRadius: '50%',
                    border:       `1px solid ${cyan50}`,
                    willChange:   'transform, width, height, border-color',
                    transition:   'width 0.2s ease, height 0.2s ease, border-color 0.2s ease',
                }}
            >
                {/* 4 tick marks at N/E/S/W */}
                {[0, 90, 180, 270].map((deg) => (
                    <div
                        key={deg}
                        style={{
                            position:        'absolute',
                            width:           1,
                            height:          6,
                            background:      cyan80,
                            left:            '50%',
                            top:             0,
                            transformOrigin: `0.5px ${OUTER_RING / 2}px`,
                            transform:       `rotate(${deg}deg) translateX(-50%)`,
                        }}
                    />
                ))}
            </div>
        </>
    );
}
