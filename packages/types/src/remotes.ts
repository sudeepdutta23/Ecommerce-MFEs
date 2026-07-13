import { type ComponentType } from 'react';

/** A remote MFE as registered in the shell's runtime config. */
export interface RemoteDefinition {
  /** Module Federation container name — must match the remote's webpack `name`. */
  scope: string;
  /** Absolute URL of the remote's remoteEntry.js (environment-specific). */
  url: string;
  /** Exposed module the shell should render, e.g. './App'. */
  module: string;
  /** Route segment the shell mounts this remote under, e.g. 'catalog' → /catalog/*. */
  routePath: string;
  /** Label used in the shell navigation. */
  displayName: string;
}

/** Shape of a remote's exposed './App' module. */
export interface RemoteAppModule {
  default: ComponentType;
}

export interface MountOptions {
  /** Initial route inside the remote, e.g. '/login'. */
  initialPath?: string;
}

/**
 * Shape of a remote's exposed './mount' module — a framework-agnostic entry
 * point so non-React (or non-federated) hosts can also embed the MFE.
 * Returns an unmount/cleanup function.
 */
export type MountFn = (element: HTMLElement, options?: MountOptions) => () => void;

export interface RemoteMountModule {
  mount: MountFn;
}
