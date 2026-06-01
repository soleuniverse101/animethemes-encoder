import { LogicalPosition, LogicalSize, PhysicalPosition, Position } from "@tauri-apps/api/dpi";

export namespace Positions {
  /**
   * Adds two positions.
   *
   * @returns A {@link PhysicalPosition} if one or both are physical, {@link LogicalPosition} if both
   *   are logical. Note that physical positions are rounded using {@method round}.
   */
  export function add(
    pos1: PhysicalPosition | LogicalPosition | Position,
    pos2: PhysicalPosition | LogicalPosition | Position,
    scale: number
  ): Position {
    let p1 = pos1 instanceof Position ? pos1.position : pos1;
    let p2 = pos2 instanceof Position ? pos2.position : pos2;

    if (p1.type == "Logical" && p2.type == "Logical") {
      return new Position(new LogicalPosition(p1.x + p2.x, p1.y + p2.y));
    }

    p1 =
      p1 instanceof PhysicalPosition
        ? p1
        : (p1 instanceof Position ? p1 : new Position(p1)).toPhysical(scale);
    p2 =
      p2 instanceof PhysicalPosition
        ? p2
        : (p2 instanceof Position ? p2 : new Position(p2)).toPhysical(scale);

    return new Position(Positions.round(new PhysicalPosition(p1.x + p2.x, p1.y + p2.y)));
  }

  export function round(position: PhysicalPosition) {
    return new PhysicalPosition(Math.round(position.x), Math.round(position.y));
  }

  export function fromBoundingRect(rect: DOMRectReadOnly, viewport: Viewport) {
    return new LogicalPosition(Math.max(rect.x, viewport.x), Math.max(rect.y, viewport.y));
  }
}

// TODO Turn into LogicalPosition & LogicalSize wrapper
/** Represents a rectangle in logical size (DOM pixels) */
export type Viewport = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export namespace Sizes {
  export function fromBoundingRect(rect: DOMRectReadOnly, viewport: Viewport) {
    return new LogicalSize(
      Math.max(
        0,
        Math.min(rect.right, viewport.x + viewport.width) - Math.max(rect.left, viewport.x)
      ),
      Math.max(
        0,
        Math.min(rect.bottom, viewport.y + viewport.height) - Math.max(rect.top, viewport.y)
      )
    );
  }
}
