import { type RemoteDefinition } from '@ecom/types';

/**
 * Runtime (dynamic) Module Federation loader.
 *
 * Instead of build-time `remotes` entries, the shell injects each remote's
 * remoteEntry.js on demand and talks to the federation container API directly.
 * This keeps remote URLs a pure runtime/config concern: remotes can be added,
 * removed, or repointed per environment without rebuilding the shell.
 */

declare function __webpack_init_sharing__(scope: string): Promise<void>;
declare const __webpack_share_scopes__: { default: unknown };

interface RemoteContainer {
  init(shareScope: unknown): Promise<void>;
  get(module: string): Promise<() => unknown>;
}

const containerCache = new Map<string, Promise<RemoteContainer>>();

function injectRemoteEntry(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => {
      script.remove();
      resolve();
    };
    script.onerror = () => {
      script.remove();
      reject(new Error(`Failed to fetch remote entry: ${url}`));
    };
    document.head.appendChild(script);
  });
}

async function resolveContainer(remote: RemoteDefinition): Promise<RemoteContainer> {
  await injectRemoteEntry(remote.url);

  const container = (window as unknown as Record<string, RemoteContainer | undefined>)[
    remote.scope
  ];
  if (!container) {
    throw new Error(
      `Remote entry loaded from ${remote.url}, but no container named "${remote.scope}" was registered. ` +
        `Check that the remote's webpack "name" matches the scope in remotes.config.ts.`,
    );
  }

  // Negotiate shared singletons (react, react-dom, react-router-dom) between
  // the shell and the remote, then hand the shell's share scope to the remote.
  await __webpack_init_sharing__('default');
  await container.init(__webpack_share_scopes__.default);
  return container;
}

export async function loadRemoteModule<T>(
  remote: RemoteDefinition,
  module: string = remote.module,
): Promise<T> {
  let containerPromise = containerCache.get(remote.scope);
  if (!containerPromise) {
    containerPromise = resolveContainer(remote);
    containerCache.set(remote.scope, containerPromise);
    // Drop failed loads from the cache so the error UI's "Retry" can succeed
    // once the remote comes back.
    containerPromise.catch(() => containerCache.delete(remote.scope));
  }

  const container = await containerPromise;
  const factory = await container.get(module);
  return factory() as T;
}
