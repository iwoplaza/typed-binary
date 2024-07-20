import type { IMeasurer } from './types';

class UnboundedMeasurer implements IMeasurer {
  size = Number.NaN;
  unbounded: IMeasurer = this;
  isUnbounded = true;

  add(): IMeasurer {
    return this;
  }

  fork(): IMeasurer {
    return this;
  }
}

const unboundedMeasurer = new UnboundedMeasurer();

export class Measurer implements IMeasurer {
  size = 0;
  unbounded: IMeasurer = unboundedMeasurer;
  isUnbounded = false;

  add(bytes: number): IMeasurer {
    this.size += bytes;
    return this;
  }

  fork() {
    const forked = new Measurer();
    forked.size = this.size;
    return forked;
  }
}
