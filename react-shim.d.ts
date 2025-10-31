// Temporary shim to ensure named React hooks are available to TypeScript in this workspace.
// This file is a lightweight stopgap to silence 'Module "react" has no exported member' errors
// caused by type resolution issues in some editors/TS configs. It provides broad, permissive
// signatures for commonly used hooks. If you have working @types/react installed, you can
// remove this file and rely on the official types.

declare module 'react' {
  // Basic hook signatures (permissive any types to avoid cascading type errors)
  export function useState<T = any>(initial?: T | (() => T)):
    [T, (value: T | ((prev: T) => T)) => void];

  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useLayoutEffect(effect: () => void | (() => void), deps?: any[]): void;

  export function useRef<T = any>(initial?: T | null): { current: T | null };

  export function useCallback<T extends (...args: any[]) => any>(cb: T, deps?: any[]): T;
  export function useMemo<T = any>(factory: () => T, deps?: any[]): T;

  export function useReducer(reducer: any, initialValue: any, init?: any): any;
  export function useContext<T = any>(context: any): T;

  // other common exports
  export const Fragment: any;
  export const Children: any;
  export const createElement: any;
  export default any;
}
