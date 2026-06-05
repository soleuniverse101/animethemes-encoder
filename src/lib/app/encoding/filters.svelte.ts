import type { CompilerContext } from "./compilers";

type ComputeFunction<T extends string | Promise<string>> = (context: CompilerContext) => T;

class GenericFilter<T extends string | Promise<string>> {
  #value: string | null = $state(null);
  private computeFunction: ComputeFunction<T>;

  constructor(compute: ComputeFunction<T>) {
    this.computeFunction = compute;
  }

  invalidate() {
    this.#value = null;
  }

  compute(context: CompilerContext): T extends string ? void : Promise<void> {
    const result = this.computeFunction(context);
    if (typeof result == "string") {
      this.#value = result;
      return undefined as T extends string ? void : Promise<void>;
    } else {
      return result.then((val) => {
        this.#value = val;
      }) as T extends string ? void : Promise<void>;
    }
  }

  get value() {
    return this.#value;
  }
}

export class Filter extends GenericFilter<string> {}
export class AsyncFilter extends GenericFilter<Promise<string>> {}
