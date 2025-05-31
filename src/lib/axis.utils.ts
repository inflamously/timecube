export type AxisType = "right"
    | "left"
    | "top"
    | "bottom"
    | "back"
    | "front"

export type UpAxisTypes = "left" | "top" | "bottom" | "right"

export function calculateSideFromWorldVector([x, y, z]: [number, number, number]): AxisType | null {
    if (x === 1) {
        return "right"
    }
    if (x === -1) {
        return "left"
    }
    if (y === -1) {
        return "top"
    }
    if (y === 1) {
        return "bottom"
    }
    if (z === -1) {
        return "back"
    }
    if (z === 1) {
        return "front"
    }
    return null
}