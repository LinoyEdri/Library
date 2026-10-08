import { lazy, type ComponentType } from 'react';

// React.lazy for a page exported by name (our pages use named exports, lazy needs a default)
export const lazyPage = <Module extends Record<string, unknown>>(
  loadModule: () => Promise<Module>,
  exportName: keyof Module & string,
) =>
  lazy(async () => {
    const loadedModule = await loadModule();

    return { default: loadedModule[exportName] as ComponentType };
  });
