export function getClientPositionFromTouchEvent(ev: TouchEvent) {
    const rect = (ev.target as HTMLElement)?.getBoundingClientRect() ?? {
        left: 0,
        top: 0
    };

    return ev.touches.length > 0 ? [
        ev.touches[0].clientX - window.pageXOffset - rect.left,
        ev.touches[0].clientY - window.pageYOffset - rect.top
    ] : [0, 0]
}