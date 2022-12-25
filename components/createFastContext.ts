import React, {
  useRef,
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from 'react';

export default function createFastContext<Store>(
  initialState: Store,
) {
  function useStoreData(): {
    get: () => Store;
    set: (
      value: Partial<Store> | ((args: Store) => Partial<Store>),
    ) => void;
    subscribe: (callback: () => void) => () => void;
  } {
    const store = useRef(initialState);

    const get = useCallback(() => store.current, []);

    const subscribers = useRef(new Set<() => void>());

    const set = useCallback(
      (
        value:
          | Partial<Store>
          | ((currentStore: Store) => Partial<Store>),
      ) => {
        if (typeof value === 'function') {
          store.current = {
            ...store.current,
            ...value(store.current),
          };
        } else {
          store.current = { ...store.current, ...value };
        }
        subscribers.current.forEach((callback) => callback());
      },
      [],
    );

    const subscribe = useCallback((callback: () => void) => {
      subscribers.current.add(callback);
      return () => subscribers.current.delete(callback);
    }, []);

    return {
      get,
      set,
      subscribe,
    };
  }

  type UseStoreDataReturnType = ReturnType<typeof useStoreData>;

  const StoreContext = createContext<UseStoreDataReturnType | null>(
    null,
  );

  function Provider({ children }: { children: React.ReactNode }) {
    return (
      <StoreContext.Provider value={useStoreData()}>
        {children}
      </StoreContext.Provider>
    );
  }

  type getReturnType<SelectorOutput> = SelectorOutput extends (
    store: Store,
  ) => unknown
    ? ReturnType<SelectorOutput>
    : undefined;

  function useStore<SelectorOutput extends (store: Store) => unknown>(
    selector?: SelectorOutput,
  ): [
    getReturnType<SelectorOutput>,
    (
      value:
        | Partial<Store>
        | ((currentStore: Store) => Partial<Store>),
    ) => void,
    UseStoreDataReturnType['get'],
  ] {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error('Store not found');
    }

    const [state, setState] = useState(() => selector?.(store.get()));

    useEffect(() => {
      return store.subscribe(() =>
        setState(() => selector?.(store.get())),
      );
    }, [store, selector]);

    return [
      state as getReturnType<SelectorOutput>,
      store.set,
      store.get,
    ];
  }

  return {
    Provider,
    useStore,
  };
}

