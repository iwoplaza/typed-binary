import type { IMeasurer } from './types.ts';

export class Measurer implements IMeasurer {
  size = 0;
  isUnbounded = false;

  /**
   * Marks this measurer as unbounded. Mutates the measurer itself (instead of returning
   * a separate one), so that containers that ignore the return value of `.measure()`
   * still end up unbounded.
   */
  get unbounded(): IMeasurer {
    this.size = Number.NaN;
    this.isUnbounded = true;
    return this;
  }

  add(bytes: number): IMeasurer {
    // NaN is sticky, so an unbounded measurer stays unbounded
    this.size += bytes;
    return this;
  }

  fork(): IMeasurer {
    const forked = new Measurer();
    forked.size = this.size;
    forked.isUnbounded = this.isUnbounded;
    return forked;
  }
}
