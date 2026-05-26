import { mpvView } from "./mpvView";

type Handler<H extends {} = {}> = Record<string, H | Function>;

export function createModule<H extends Handler>(): { handler: H | null } {
  return {
    handler: null
  };
}

const modules = {
  mpvView
};

type Modules = typeof modules;
type ModuleName = keyof Modules;

export function registerHandler(module: ModuleName, handler: Modules[ModuleName]["handler"]) {
  if (modules[module].handler) {
    throw new Error(`Cannot register two handlers for the same module (${module})`);
  }
  modules[module].handler = handler;
}

export function commands<Name extends ModuleName>(
  moduleName: Name
): NonNullable<Modules[Name]["handler"]> {
  const module = modules[moduleName];
  if (!module.handler) {
    throw new Error(`Cannot use unregistered module commands (${moduleName})`);
  }
  return module.handler;
}
