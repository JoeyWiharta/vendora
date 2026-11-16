import "@testing-library/jest-dom";

class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

// jsdom belum punya PointerEvent; Base UI memakainya saat checkbox diklik
if (typeof window !== "undefined" && !window.PointerEvent) {
    class PointerEventPolyfill extends MouseEvent {
        pointerId: number;
        pointerType: string;
        isPrimary: boolean;

        constructor(type: string, params: PointerEventInit = {}) {
            super(type, params);
            this.pointerId = params.pointerId ?? 1;
            this.pointerType = params.pointerType ?? "mouse";
            this.isPrimary = params.isPrimary ?? true;
        }
    }
    window.PointerEvent = PointerEventPolyfill as unknown as typeof PointerEvent;
}