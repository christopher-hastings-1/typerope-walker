// Shared rope/walker geometry so the rope bend and the walker's horizontal
// shift always agree exactly.

const MAX_OFFSET_VW = 9;

/** Horizontal offset of the rope (and walker's feet) at the walker's Y,
 *  expressed in viewport-width units. */
export function balanceToOffsetVw(balance: number, maxBalance: number) {
  return (balance / maxBalance) * MAX_OFFSET_VW;
}

/** SVG viewBox width used by the Rope component. */
export const ROPE_VB_WIDTH = 200;
export const ROPE_VB_HEIGHT = 1000;
export const ROPE_CENTER_X = 100;

/** Convert a vw offset into Rope SVG x-units (viewBox is stretched to 100vw). */
export function vwToRopeUnits(vw: number) {
  return (vw / 100) * ROPE_VB_WIDTH;
}

/** Walker Y in viewport % — mirrored by both Rope and Walker. */
export function walkerTopPct(progress: number) {
  return 75 - progress * 60;
}


/** Walker Y in rope SVG units. */
export function walkerSvgY(progress: number) {
  return (walkerTopPct(progress) / 100) * ROPE_VB_HEIGHT;
}

/** Build a smooth rope path that *passes exactly through* the walker's
 *  position (walkerX in svg units, walkerY in svg units). Two quadratics
 *  meet at the walker with a vertical tangent so the rope appears to dip
 *  under the load point. */
export function buildRopePath(walkerX: number, walkerY: number) {
  const wy = Math.max(20, Math.min(ROPE_VB_HEIGHT - 20, walkerY));
  const topCtrlY = wy * 0.55;
  const botCtrlY = wy + (ROPE_VB_HEIGHT - wy) * 0.45;
  return `M ${ROPE_CENTER_X} 0 Q ${walkerX} ${topCtrlY} ${walkerX} ${wy} Q ${walkerX} ${botCtrlY} ${ROPE_CENTER_X} ${ROPE_VB_HEIGHT}`;
}
