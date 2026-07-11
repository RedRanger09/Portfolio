'use client'

import { motion, useReducedMotion } from 'framer-motion'

const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace'

/**
 * AI/ML engineering diagrams arranged around the portrait.
 * Clear center hole for the circular photo — research-paper aesthetic.
 */
export function HeroEngineeringBackdrop() {
  const reduce = useReducedMotion() ?? false

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <svg viewBox="0 0 640 720" preserveAspectRatio="xMidYMid meet" className="h-full w-full" fill="none">
        <defs>
          <linearGradient id="hero-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(34,211,238)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="rgb(99,102,241)" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="hero-purple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(168,85,247)" stopOpacity="0.75" />
            <stop offset="100%" stopColor="rgb(59,130,246)" stopOpacity="0.45" />
          </linearGradient>
          <radialGradient id="hero-halo" cx="50%" cy="48%" r="42%">
            <stop offset="55%" stopColor="rgb(99,102,241)" stopOpacity="0" />
            <stop offset="100%" stopColor="rgb(34,211,238)" stopOpacity="0.08" />
          </radialGradient>
          <filter id="hero-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Soft ring framing the portrait zone */}
        <circle cx="320" cy="340" r="148" fill="url(#hero-halo)" />
        <circle cx="320" cy="340" r="138" stroke="rgb(99,102,241)" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="3 6" />

        {/* Ambient particles */}
        {!reduce &&
          [
            [48, 72],
            [110, 40],
            [520, 55],
            [590, 140],
            [42, 480],
            [580, 520],
            [55, 280],
            [600, 300],
            [180, 680],
            [460, 690],
            [300, 48],
            [340, 700],
          ].map(([cx, cy], i) => (
            <motion.circle
              key={`p-${i}`}
              cx={cx}
              cy={cy}
              r={i % 3 === 0 ? 2.2 : 1.6}
              fill={i % 2 === 0 ? 'rgb(34,211,238)' : 'rgb(168,85,247)'}
              animate={{ opacity: [0.25, 0.7, 0.25] }}
              transition={{ duration: 3.6 + i * 0.2, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}

        {/* ── Neural network — top-left ── */}
        <g opacity="0.92" filter="url(#hero-glow)">
          <text x="28" y="38" fill="rgb(168,85,247)" fillOpacity="0.9" fontSize="11" fontFamily={MONO} letterSpacing="1.6">
            NEURAL NETWORK
          </text>
          {[
            [36, 68, 88, 108],
            [68, 58, 88, 108],
            [100, 68, 88, 108],
            [132, 72, 88, 108],
            [88, 108, 64, 152],
            [88, 108, 112, 152],
            [64, 152, 88, 196],
            [112, 152, 88, 196],
            [112, 152, 138, 190],
            [88, 196, 112, 230],
          ].map(([x1, y1, x2, y2], i) => (
            <line key={`nn-l-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#hero-purple)" strokeWidth="1.35" />
          ))}
          {[
            [36, 68],
            [68, 58],
            [100, 68],
            [132, 72],
            [88, 108],
            [64, 152],
            [112, 152],
            [88, 196],
            [138, 190],
            [112, 230],
          ].map(([cx, cy], i) => (
            <motion.circle
              key={`nn-n-${i}`}
              cx={cx}
              cy={cy}
              r={i === 4 || i === 7 ? 4.4 : 3.1}
              fill="rgb(168,85,247)"
              fillOpacity={0.9}
              animate={reduce ? undefined : { opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </g>

        {/* ── RAG pipeline — top ── */}
        <g opacity="0.95">
          <text x="200" y="32" fill="rgb(34,211,238)" fillOpacity="0.9" fontSize="11" fontFamily={MONO} letterSpacing="1.6">
            RAG PIPELINE
          </text>
          {[
            { x: 178, w: 52, label: 'Query' },
            { x: 250, w: 62, label: 'Retriever' },
            { x: 332, w: 54, label: 'Context' },
            { x: 406, w: 42, label: 'LLM' },
            { x: 468, w: 54, label: 'Answer' },
          ].map((box, i, arr) => (
            <g key={box.label}>
              <rect x={box.x} y="44" width={box.w} height="26" rx="5" stroke="rgb(34,211,238)" strokeOpacity="0.8" fill="rgb(34,211,238)" fillOpacity="0.1" />
              <text x={box.x + box.w / 2} y="61" textAnchor="middle" fill="rgb(165,243,252)" fillOpacity="0.95" fontSize="8.5" fontFamily={MONO}>
                {box.label}
              </text>
              {i < arr.length - 1 && arr[i + 1] ? (
                <motion.path
                  d={`M${box.x + box.w} 57 H${arr[i + 1]!.x}`}
                  stroke="rgb(34,211,238)"
                  strokeOpacity="0.75"
                  strokeWidth="1.4"
                  strokeDasharray="3 4"
                  animate={reduce ? undefined : { strokeDashoffset: [0, -14] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
                />
              ) : null}
            </g>
          ))}
        </g>

        {/* ── Token stream — under RAG, above portrait ── */}
        <g opacity="0.8">
          <text x="210" y="96" fill="rgb(99,102,241)" fillOpacity="0.75" fontSize="9" fontFamily={MONO} letterSpacing="1.2">
            TOKEN STREAM
          </text>
          {['[CLS]', 'build', 'RAG', 'sys', '…', '[SEP]'].map((tok, i) => (
            <g key={tok}>
              <rect x={210 + i * 48} y="104" width={42} height="18" rx="3" stroke="rgb(99,102,241)" strokeOpacity="0.55" fill="rgb(99,102,241)" fillOpacity="0.08" />
              <text x={231 + i * 48} y="116" textAnchor="middle" fill="rgb(199,210,254)" fillOpacity="0.85" fontSize="7.5" fontFamily={MONO}>
                {tok}
              </text>
            </g>
          ))}
        </g>

        {/* ── Embedding space — mid-left ── */}
        <g opacity="0.88">
          <text x="24" y="268" fill="rgb(34,211,238)" fillOpacity="0.85" fontSize="10.5" fontFamily={MONO} letterSpacing="1.4">
            EMBEDDING SPACE
          </text>
          {/* Axes */}
          <path d="M32 288 L32 390 L138 390" stroke="rgb(59,130,246)" strokeOpacity="0.65" strokeWidth="1.3" />
          <path d="M32 390 L95 340" stroke="rgb(59,130,246)" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 3" />
          {/* Cluster hull */}
          <ellipse cx="78" cy="340" rx="42" ry="32" stroke="rgb(34,211,238)" strokeOpacity="0.25" fill="rgb(34,211,238)" fillOpacity="0.03" />
          {[
            [48, 362],
            [62, 338],
            [78, 368],
            [94, 322],
            [70, 308],
            [108, 350],
            [54, 320],
            [88, 300],
            [42, 348],
            [100, 372],
            [72, 350],
            [116, 330],
          ].map(([cx, cy], i) => (
            <motion.circle
              key={`emb-${i}`}
              cx={cx}
              cy={cy}
              r={2.3}
              fill={i % 4 === 0 ? 'rgb(168,85,247)' : 'rgb(34,211,238)'}
              fillOpacity={0.9}
              animate={reduce ? undefined : { opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.14 }}
            />
          ))}
          <text x="42" y="408" fill="rgb(148,163,184)" fillOpacity="0.55" fontSize="7.5" fontFamily={MONO}>
            cos θ ≈ 0.91
          </text>
        </g>

        {/* ── Weight matrix — left of portrait ── */}
        <g opacity="0.72" stroke="rgb(99,102,241)" strokeWidth="1">
          <text x="24" y="430" fill="rgb(99,102,241)" fillOpacity="0.8" fontSize="9.5" fontFamily={MONO} letterSpacing="1.2">
            W ∈ ℝⁿˣᵈ
          </text>
          {[0, 1, 2, 3, 4].map((r) =>
            [0, 1, 2, 3].map((c) => (
              <rect
                key={`w-${r}-${c}`}
                x={28 + c * 16}
                y={440 + r * 14}
                width="13"
                height="11"
                fill="rgb(99,102,241)"
                fillOpacity={((r * 3 + c * 2) % 5) * 0.08 + 0.04}
                strokeOpacity="0.55"
              />
            )),
          )}
        </g>

        {/* ── FAISS index — bottom-left ── */}
        <g opacity="0.9">
          <text x="28" y="540" fill="rgb(129,140,248)" fillOpacity="0.9" fontSize="10.5" fontFamily={MONO} letterSpacing="1.4">
            FAISS INDEX
          </text>
          {[0, 1, 2, 3].map((i) => (
            <g key={`faiss-${i}`}>
              <ellipse cx="78" cy={558 + i * 26} rx="40" ry="9" stroke="rgb(99,102,241)" strokeOpacity="0.75" fill="rgb(99,102,241)" fillOpacity="0.1" />
              <path d={`M38 ${558 + i * 26} V${572 + i * 26}`} stroke="rgb(99,102,241)" strokeOpacity="0.6" strokeWidth="1.2" />
              <path d={`M118 ${558 + i * 26} V${572 + i * 26}`} stroke="rgb(99,102,241)" strokeOpacity="0.6" strokeWidth="1.2" />
              <ellipse cx="78" cy={572 + i * 26} rx="40" ry="9" stroke="rgb(99,102,241)" strokeOpacity="0.75" fill="rgb(8,8,14)" fillOpacity="0.5" />
            </g>
          ))}
          {['v₁ · q', 'v₂ · q', 'v₃ · q'].map((label, i) => (
            <g key={label}>
              <line x1="120" y1={566 + i * 26} x2="148" y2={566 + i * 26} stroke="rgb(168,85,247)" strokeOpacity="0.7" />
              <text x="152" y={569 + i * 26} fill="rgb(216,180,254)" fillOpacity="0.85" fontSize="8" fontFamily={MONO}>
                {label}
              </text>
            </g>
          ))}
        </g>

        {/* ── Softmax / logits — bottom center ── */}
        <g opacity="0.85">
          <text x="250" y="620" fill="rgb(34,211,238)" fillOpacity="0.8" fontSize="9.5" fontFamily={MONO} letterSpacing="1.2">
            SOFTMAX
          </text>
          {[0.35, 0.72, 0.48, 0.9, 0.55, 0.38, 0.62].map((h, i) => (
            <motion.rect
              key={`sm-${i}`}
              x={250 + i * 18}
              y={630 + (1 - h) * 36}
              width="12"
              height={h * 36}
              rx="2"
              fill={i === 3 ? 'rgb(34,211,238)' : 'rgb(99,102,241)'}
              fillOpacity={i === 3 ? 0.75 : 0.4}
              animate={reduce ? undefined : { opacity: [0.45, 0.9, 0.45] }}
              transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.12 }}
            />
          ))}
        </g>

        {/* ── Transformer stack — right ── */}
        <g opacity="0.93">
          <text x="500" y="195" fill="rgb(34,211,238)" fillOpacity="0.9" fontSize="10" fontFamily={MONO} letterSpacing="1.2">
            TRANSFORMER
          </text>
          <text x="500" y="208" fill="rgb(34,211,238)" fillOpacity="0.65" fontSize="10" fontFamily={MONO} letterSpacing="1.2">
            ARCHITECTURE
          </text>
          {[
            { y: 222, label: 'Add & Norm', h: 24 },
            { y: 254, label: 'Feed Forward', h: 28 },
            { y: 290, label: 'Add & Norm', h: 24 },
            { y: 322, label: 'Multi-Head Attn', h: 32 },
            { y: 362, label: 'Add & Norm', h: 24 },
            { y: 394, label: 'Pos. Encoding', h: 24 },
          ].map((block, i, arr) => (
            <g key={`tr-${i}`}>
              <rect
                x="500"
                y={block.y}
                width="112"
                height={block.h}
                rx="5"
                stroke={i % 2 === 0 ? 'rgb(34,211,238)' : 'rgb(129,140,248)'}
                strokeOpacity="0.8"
                fill={i % 2 === 0 ? 'rgb(34,211,238)' : 'rgb(99,102,241)'}
                fillOpacity="0.1"
              />
              <text x="556" y={block.y + block.h / 2 + 3.5} textAnchor="middle" fill="rgb(186,230,253)" fillOpacity="0.92" fontSize="8.5" fontFamily={MONO}>
                {block.label}
              </text>
              {i < arr.length - 1 && arr[i + 1] ? (
                <motion.line
                  x1="556"
                  y1={block.y + block.h}
                  x2="556"
                  y2={arr[i + 1]!.y}
                  stroke="rgb(34,211,238)"
                  strokeOpacity="0.65"
                  strokeWidth="1.3"
                  strokeDasharray="2 3"
                  animate={reduce ? undefined : { strokeDashoffset: [0, -10] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'linear', delay: i * 0.1 }}
                />
              ) : null}
            </g>
          ))}
        </g>

        {/* ── Attention heatmap — upper-right ── */}
        <g opacity="0.78">
          <text x="500" y="88" fill="rgb(168,85,247)" fillOpacity="0.85" fontSize="9.5" fontFamily={MONO} letterSpacing="1.2">
            ATTENTION
          </text>
          {[0, 1, 2, 3, 4].map((r) =>
            [0, 1, 2, 3, 4].map((c) => {
              const intensity = ((r + c * 2 + (r === c ? 3 : 0)) % 6) / 6
              return (
                <rect
                  key={`attn-h-${r}-${c}`}
                  x={500 + c * 16}
                  y={98 + r * 14}
                  width="13"
                  height="11"
                  rx="1.5"
                  fill={r === c ? 'rgb(34,211,238)' : 'rgb(168,85,247)'}
                  fillOpacity={0.15 + intensity * 0.55}
                  stroke="none"
                />
              )
            }),
          )}
        </g>

        {/* ── Attention arcs around portrait (outer ring) ── */}
        <g opacity="0.7" stroke="url(#hero-cyan)" strokeWidth="1.35" fill="none">
          <path d="M200 200 C230 230, 250 270, 255 310" />
          <path d="M440 200 C410 235, 395 275, 390 315" />
          <path d="M190 420 C230 450, 270 470, 310 478" />
          <path d="M450 420 C410 455, 370 475, 330 478" />
        </g>
        {[
          [200, 200],
          [440, 200],
          [190, 420],
          [450, 420],
          [255, 310],
          [390, 315],
          [310, 478],
          [330, 478],
        ].map(([cx, cy], i) => (
          <motion.circle
            key={`arc-n-${i}`}
            cx={cx}
            cy={cy}
            r={2.6}
            fill="rgb(34,211,238)"
            fillOpacity={0.85}
            animate={reduce ? undefined : { opacity: [0.4, 1, 0.4], r: [2.4, 3.2, 2.4] }}
            transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}

        {/* ── Wireframe brain — bottom-right ── */}
        <g opacity="0.72" stroke="rgb(168,85,247)" strokeWidth="1.3" fill="none">
          <text x="480" y="470" fill="rgb(168,85,247)" fillOpacity="0.7" fontSize="9" fontFamily={MONO} letterSpacing="1.2">
            LATENT SPACE
          </text>
          <ellipse cx="545" cy="545" rx="52" ry="40" strokeOpacity="0.75" />
          <ellipse cx="545" cy="545" rx="30" ry="24" strokeOpacity="0.55" />
          <path d="M510 520 C525 498, 565 498, 580 520" strokeOpacity="0.7" />
          <path d="M505 545 C520 568, 570 568, 585 545" strokeOpacity="0.6" />
          <path d="M545 505 V585" strokeOpacity="0.45" />
          <path d="M512 530 C530 548, 560 548, 578 530" strokeOpacity="0.4" />
          {[
            [528, 530],
            [560, 534],
            [540, 555],
            [558, 560],
            [545, 520],
          ].map(([cx, cy], i) => (
            <circle key={`br-${i}`} cx={cx} cy={cy} r={2.2} fill="rgb(168,85,247)" fillOpacity="0.8" stroke="none" />
          ))}
        </g>

        {/* ── Dataflow connectors toward center (stop short of face) ── */}
        <g opacity="0.45" stroke="url(#hero-cyan)" strokeWidth="1" strokeDasharray="2 4">
          <path d="M140 200 C180 240, 200 280, 210 310" />
          <path d="M140 500 C190 470, 220 440, 235 400" />
          <path d="M500 430 C460 420, 430 400, 410 380" />
        </g>
      </svg>
    </div>
  )
}
