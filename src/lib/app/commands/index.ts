import type { UnlistenFn } from "@tauri-apps/api/event";
import { flattenHandler, type FlattenHandler, type Handler } from "./handler";
import type { MPVViewHandler } from "./mpvView";

type NullModule = { handler: null; flatHandler: null };
type NonNullModule<H extends Handler> = { handler: H; flatHandler: FlattenHandler<H> };
type Module<H extends Handler> = NullModule | NonNullModule<H>;
type HandlerFromModule<M extends Module<Handler>> = M extends NonNullModule<infer H> ? H : never;

export const createModule = <H extends Handler>(): Module<H> => ({
  handler: null,
  flatHandler: null
});

const modules = {
  mpvView: createModule<MPVViewHandler>()
};

type Modules = typeof modules;
type ModuleName = keyof Modules;

export function registerHandler<M extends ModuleName>(
  module: M,
  handler: HandlerFromModule<Modules[M]>
): UnlistenFn {
  if (modules[module].handler) {
    throw new Error(`Cannot register two handlers for the same module (${module})`);
  }

  (modules[module] as Module<HandlerFromModule<Modules[M]>>).handler = handler;
  (modules[module] as Module<HandlerFromModule<Modules[M]>>).flatHandler = flattenHandler(handler);

  return () => {
    modules[module].handler = null;
    modules[module].flatHandler = null;
  };
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

type ModulesHandler = {
  [M in ModuleName]: HandlerFromModule<Modules[M]>;
};
type FlatHandlers = FlattenHandler<ModulesHandler>;

export namespace Command {
  export type Name = keyof FlatHandlers;
  export type FromName<N extends Name> = FlatHandlers[N];

  export namespace Parameterless {
    type _Name<C extends Command.Name> = C extends any
      ? Command.FromName<C> extends () => void
        ? C
        : never
      : never;
    export type Name = _Name<Command.Name>;
  }

  export namespace Parametered {
    export type Name = Exclude<Command.Name, Command.Parameterless.Name>;
  }
}

export function command<C extends Command.Name>(name: C): Command.FromName<C> {
  const pathIndex = name.indexOf(".");
  const moduleName = name.substring(0, pathIndex);
  const path = name.substring(pathIndex + 1);

  const module = modules[moduleName as ModuleName];
  if (!module.flatHandler) {
    throw new Error(`Cannot use unregistered module commands (${moduleName})`);
  }
  return module.flatHandler[path as keyof typeof module.flatHandler];
}
