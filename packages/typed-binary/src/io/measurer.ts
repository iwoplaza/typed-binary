export interface Measurer {
  add(bytes: number): Measurer;
  fork(): Measurer;
  /**
   * Marks the measurer as unbounded (its size becomes `NaN`), and returns it.
   */
  readonly unbounded: Measurer;

  readonly size: number;
  readonly isUnbounded: boolean;
}

class MeasurerImpl implements Measurer {
  size = 0;
  isUnbounded = false;

  /**
   * Marks this measurer as unbounded. Mutates the measurer itself (instead of returning
   * a separate one), so that containers that ignore the return value of `.measure()`
   * still end up unbounded.
   */
  get unbounded(): Measurer {
    this.size = Number.NaN;
    this.isUnbounded = true;
    return this;
  }

  add(bytes: number): Measurer {
    // NaN is sticky, so an unbounded measurer stays unbounded
    this.size += bytes;
    return this;
  }

  fork(): Measurer {
    const forked = new MeasurerImpl();
    forked.size = this.size;
    forked.isUnbounded = this.isUnbounded;
    return forked;
  }
}

/**
 * The built-in measurer, which sums up the sizes added to it.
 */
export const Measurer: new () => Measurer = MeasurerImpl;
