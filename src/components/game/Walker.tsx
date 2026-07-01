import { AnimatePresence, motion, useMotionTemplate, useSpring, useTransform } from "framer-motion";
import { useEffect, useMemo } from "react";
import { balanceToOffsetVw, walkerTopPct } from "@/lib/rope";

type WalkerState = "playing" | "fell" | "won";
type Expression = "calm" | "focused" | "wobbling" | "panic";

function expressionFor(absLean: number): Expression {
  if (absLean < 0.25) return "calm";
  if (absLean < 0.55) return "focused";
  if (absLean < 0.8) return "wobbling";
  return "panic";
}

export function Walker({
  progress,
  balance,
  maxBalance,
  state,
  stepKey,
  streak = 0,
}: {
  progress: number;
  balance: number;
  maxBalance: number;
  state: WalkerState;
  stepKey: number;
  streak?: number;
}) {
  const top = walkerTopPct(progress);
  const lean = balance / maxBalance;
  const absLean = Math.abs(lean);
  const expr: Expression = state === "playing" ? expressionFor(absLean) : "calm";

  // Streak tier — drives glow filter + body fill
  const streakTier = streak >= 9 ? 3 : streak >= 6 ? 2 : streak >= 3 ? 1 : 0;
  const glowColor =
    streakTier === 3 ? "#FF6B00" : streakTier === 2 ? "#FF8C00" : "#E5A23C";
  const glowOpacity = streakTier === 3 ? 0.9 : streakTier === 2 ? 0.75 : 0.6;
  const bodyFill =
    streakTier === 3 ? "#E04A1F" : streakTier === 2 ? "#D9542F" : "#D55B3A";

  // Horizontal slide — matches rope geometry exactly.
  const shiftVw = useSpring(0, { stiffness: 90, damping: 16, mass: 0.9 });
  useEffect(() => {
    shiftVw.set(balanceToOffsetVw(balance, maxBalance));
  }, [balance, maxBalance, shiftVw]);
  const translateX = useMotionTemplate`${shiftVw}vw`;

  // Articulated posture springs
  const hipShift = useSpring(0, { stiffness: 140, damping: 16 });
  const torsoRot = useSpring(0, { stiffness: 110, damping: 14 });
  const headRot = useSpring(0, { stiffness: 90, damping: 18 });
  const poleRot = useSpring(0, { stiffness: 120, damping: 12 });
  const legSkew = useSpring(0, { stiffness: 160, damping: 18 });
  const browLift = useSpring(0, { stiffness: 180, damping: 20 });

  useEffect(() => {
    hipShift.set(-lean * 5);
    torsoRot.set(lean * 10);
    headRot.set(-lean * 7);
    poleRot.set(-lean * 22);
    legSkew.set(lean);
    browLift.set(absLean);
  }, [lean, absLean, hipShift, torsoRot, headRot, poleRot, legSkew, browLift]);

  // Step bob
  const bob = useSpring(0, { stiffness: 500, damping: 18 });
  useEffect(() => {
    if (stepKey === 0) return;
    bob.set(-6);
    const t = setTimeout(() => bob.set(0), 140);
    return () => clearTimeout(t);
  }, [stepKey, bob]);

  const leftLegScale = useTransform(legSkew, (l) => 1 - Math.max(-l, 0) * 0.25);
  const rightLegScale = useTransform(legSkew, (l) => 1 - Math.max(l, 0) * 0.25);

  // Eye pupil tracks lean direction; shrinks in panic.
  const pupilOffset = lean * 1.5;
  const pupilR = expr === "panic" ? 0.9 : 1.3;
  const eyeRy = expr === "panic" ? 2.4 : expr === "wobbling" ? 1.8 : 1.4;

  // Eyebrow Y (lower = higher on face). Raise with lean intensity.
  const browY = -26 - absLean * 3;

  // Mouth path by expression
  const mouth = useMemo(() => {
    if (state === "won") return <path d="M -4 -12 Q 0 -8 4 -12" stroke="#2A1E16" strokeWidth="1.4" fill="none" strokeLinecap="round" />;
    if (state === "fell") return <ellipse cx="0" cy="-12" rx="2" ry="2.4" fill="#2A1E16" />;
    switch (expr) {
      case "calm":
        return <path d="M -3 -13 Q 0 -10.5 3 -13" stroke="#2A1E16" strokeWidth="1.3" fill="none" strokeLinecap="round" />;
      case "focused":
        return <path d="M -3 -12.5 L 3 -12.5" stroke="#2A1E16" strokeWidth="1.4" strokeLinecap="round" />;
      case "wobbling":
        return <ellipse cx="0" cy="-12" rx="1.6" ry="1.8" fill="#2A1E16" />;
      case "panic":
        return <ellipse cx="0" cy="-11.5" rx="2.2" ry="2.6" fill="#2A1E16" />;
    }
  }, [expr, state]);

  // Whole-body tremor for wobbling/panic
  const tremorAmt = expr === "panic" ? 1.4 : expr === "wobbling" ? 0.7 : 0;
  const tremorAnim = tremorAmt
    ? { x: [0, -tremorAmt, tremorAmt, -tremorAmt * 0.6, 0], rotate: [0, -0.4, 0.4, -0.2, 0] }
    : { x: 0, rotate: 0 };

  // Pole panic swing
  const poleSwing = expr === "panic"
    ? { rotate: [0, -2.5, 2.5, -1.5, 0] }
    : expr === "wobbling"
      ? { rotate: [0, -1, 1, 0] }
      : undefined;
  const poleDuration = expr === "panic" ? 0.35 : 0.55;

  // Arm windmill (extra rotation on top of pole counter-rotation) in panic
  const armWindmill = expr === "panic"
    ? { rotate: [0, -8, 8, -4, 0] }
    : undefined;

  // Sweat drops
  const sweatHighSide = lean > 0 ? "right" : "left";
  const showSweat = expr === "wobbling" || expr === "panic";

  const fallProps =
    state === "fell"
      ? {
          rotate: 95,
          y: 400,
          opacity: 0,
          transition: { duration: 1.2, ease: [0.6, 0.05, 0.7, 0.9] as const },
        }
      : state === "won"
        ? { y: -10, transition: { type: "spring" as const, stiffness: 200, damping: 8 } }
        : {};

  // SVG is 160x160 with viewBox -80,-80,160,160. Feet sit at svg y=50,
  // i.e. 130px down from the SVG's top-left. Translate up by that amount
  // so the feet land exactly on the rope contact point.
  const FOOT_PX = 130;
  const FOOT_ORIGIN = `50% ${FOOT_PX}px`;

  return (
    <motion.div
      className="absolute left-1/2 z-10"
      style={{ top: `${top}%`, x: "-50%", y: bob }}
      animate={{ top: `${top}%` }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
    >
      <motion.div style={{ translateX }}>
        <motion.div
          animate={tremorAnim}
          transition={
            tremorAmt
              ? { duration: 0.32, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.2 }
          }
          style={{ transformOrigin: FOOT_ORIGIN }}
        >
          <motion.div animate={fallProps} style={{ transformOrigin: FOOT_ORIGIN, marginTop: -FOOT_PX }}>
            <svg width="160" height="160" viewBox="-80 -80 160 160" overflow="visible">
              <defs>
                <filter id="streak-glow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feFlood floodColor={glowColor} floodOpacity={glowOpacity} result="color" />
                  <feComposite in="color" in2="blur" operator="in" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <ellipse cx="0" cy="55" rx="24" ry="3.2" fill="#2A1E16" opacity="0.18" />
              <g filter={streakTier > 0 ? "url(#streak-glow)" : undefined}>

              {/* Balance pole */}
              <motion.g
                style={{ rotate: poleRot, transformOrigin: "0px 0px" }}
                animate={poleSwing}
                transition={poleSwing ? { duration: poleDuration, repeat: Infinity, ease: "easeInOut" } : undefined}
              >
                <motion.g animate={armWindmill} transition={armWindmill ? { duration: 0.4, repeat: Infinity, ease: "easeInOut" } : undefined}>
                  <path d="M -64 0 Q 0 -3 64 0" stroke="#2A1E16" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.2" transform="translate(1.5, 2)" />
                  <path d="M -64 0 Q 0 -3 64 0" stroke="#E5A23C" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                  <circle cx="-64" cy="0" r="6" fill="#D55B3A" stroke="#2A1E16" strokeWidth="1.3" />
                  <circle cx="64" cy="0" r="6" fill="#D55B3A" stroke="#2A1E16" strokeWidth="1.3" />
                </motion.g>
              </motion.g>

              {/* Legs */}
              <motion.g style={{ scaleY: leftLegScale, transformOrigin: "-6px 50px" }}>
                <path d="M -8 30 L -10 50 L -4 50 L -2 32 Z" fill="#4A6FA5" stroke="#2A1E16" strokeWidth="1.2" strokeLinejoin="round" />
              </motion.g>
              <motion.g style={{ scaleY: rightLegScale, transformOrigin: "6px 50px" }}>
                <path d="M 2 32 L 4 50 L 10 50 L 8 30 Z" fill="#4A6FA5" stroke="#2A1E16" strokeWidth="1.2" strokeLinejoin="round" />
              </motion.g>

              {/* Hips + torso */}
              <motion.g style={{ x: hipShift }}>
                <motion.g style={{ rotate: torsoRot, transformOrigin: "0px 50px" }}>
                  <motion.g
                    animate={{ scaleY: expr === "calm" ? [1, 1.04, 1] : 1 }}
                    transition={{ duration: 2.4, repeat: expr === "calm" ? Infinity : 0, ease: "easeInOut" }}
                    style={{ transformOrigin: "0px 20px" }}
                  >
                    <path d={`M -10 -2 L 10 -2 L 12 30 L -12 30 Z`} fill={bodyFill} stroke="#2A1E16" strokeWidth="1.5" strokeLinejoin="round" />
                  </motion.g>

                  {/* Head */}
                  <motion.g style={{ rotate: headRot, transformOrigin: "0px -8px" }}>
                    <circle cx="0" cy="-18" r="13" fill="#F2C9A1" stroke="#2A1E16" strokeWidth="1.5" />
                    {/* hair */}
                    <path d="M -11 -25 Q -4 -34 2 -29 Q 7 -33 11 -25" fill="#3A2A1F" stroke="#2A1E16" strokeWidth="1" />

                    {/* eyebrows */}
                    <motion.path
                      d={`M -7 ${browY} Q -4 ${browY - 1.2} -1 ${browY}`}
                      stroke="#2A1E16"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <motion.path
                      d={`M 1 ${browY} Q 4 ${browY - 1.2} 7 ${browY}`}
                      stroke="#2A1E16"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      fill="none"
                    />

                    {/* eyes */}
                    <ellipse cx="-3.8" cy="-18" rx="1.9" ry={eyeRy} fill="#FBF4E4" stroke="#2A1E16" strokeWidth="0.8" />
                    <ellipse cx="3.8" cy="-18" rx="1.9" ry={eyeRy} fill="#FBF4E4" stroke="#2A1E16" strokeWidth="0.8" />
                    <circle cx={-3.8 + pupilOffset} cy="-18" r={pupilR} fill="#2A1E16" />
                    <circle cx={3.8 + pupilOffset} cy="-18" r={pupilR} fill="#2A1E16" />

                    {/* mouth */}
                    {mouth}

                    {/* sweat drops */}
                    <AnimatePresence>
                      {showSweat && (
                        <motion.g
                          key="sweat"
                          initial={{ opacity: 0, y: -2 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          {sweatHighSide === "right" || expr === "panic" ? (
                            <path d="M 11 -20 Q 13 -16 11.5 -14 Q 10 -16 11 -20 Z" fill="#7BB7D9" stroke="#2A1E16" strokeWidth="0.6" />
                          ) : null}
                          {sweatHighSide === "left" || expr === "panic" ? (
                            <path d="M -11 -20 Q -13 -16 -11.5 -14 Q -10 -16 -11 -20 Z" fill="#7BB7D9" stroke="#2A1E16" strokeWidth="0.6" />
                          ) : null}
                        </motion.g>
                      )}
                    </AnimatePresence>
                  </motion.g>
                </motion.g>
              </motion.g>

              {state === "won" && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  <path d="M -10 0 L -20 -28" stroke="#D55B3A" strokeWidth="4" strokeLinecap="round" />
                  <path d="M 10 0 L 20 -28" stroke="#D55B3A" strokeWidth="4" strokeLinecap="round" />
                </motion.g>
              )}
              </g>
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
