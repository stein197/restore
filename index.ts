import * as React from "react";

// TODO
export = function createStore<T>(store: T): Store<T> {
	const listenersStore: any = {};
	function updateStore(value: Partial<T>): void {
		store = {...store, ...value};
		for (const key in listenersStore) {
			const keyListeners = listenersStore[key];
			for (const id in keyListeners) {
				const listener = keyListeners[id];
				listener(key ? store[key] : store);
			}
		}
	}
	function updateEntry(key: string, value: any): void {
		store[key] = value;
		store = {...store};
		const keyListeners = listenersStore[key];
		for (const id in keyListeners) {
			const listener = keyListeners[id];
			listener(value);
		}
		const globalListeners = listenersStore[""];
		if (!globalListeners)
			return;
		for (const id in globalListeners) {
			const listener = globalListeners[id];
			listener(store);
		}
	}
	function addListener(a: string | Function, b?: Function): void {
		const [key, listener] = getKeyAndListener(a, b);
		if (!listenersStore[key])
			listenersStore[key] = [];
		listenersStore[key].push(listener);
	}
	function removeListener(a: string | Function, b?: Function): void {
		const [key, listener] = getKeyAndListener(a, b);
		if (!listenersStore[key])
			return;
		const index = listenersStore[key].indexOf(listener);
		listenersStore[key].splice(index, 1);
		if (!listenersStore[key].length)
			delete listenersStore[key];
	}
	function getKeyAndListener(a: any, b: any): [string, () => void] {
		const key = typeof a === "string" && b ? a : "";
		const listener = typeof a === "function" ? a : b;
		return [key, listener];
	}
	return {
		getValue(key) {
			return store[key];
		},
		getStore() {
			return store;
		},
		setValue(key, value) {
			updateEntry(key, value);
		},
		setStore(value) {
			updateStore(value);
		},
		useStore(key) {
			key = key ?? "";
			const [state, setState] = React.useState(key ? store[key] : store);
			const dispatch = React.useCallback(state => key ? updateEntry(key, state) : updateStore(state), [key]);
			React.useEffect((): () => void => {
				addListener(key, setState);
				return () => removeListener(key, setState)
			}, [key]);
			return [state, dispatch];
		},
		on(a, b) {
			addListener(a, b);
		},
		off(a, b) {
			removeListener(a, b);
		}
	};
}

/**
 * Store object implementation.
 */
type Store<T> = {

	/**
	 * Returns a value by key.
	 * @param key Store key.
	 */
	getValue<K extends keyof T>(key: K): T[K];

	/**
	 * Returns the whole store.
	 */
	getStore(): T;

	/**
	 * Sets a value.
	 * @param key Store key.
	 * @param value Store value.
	 */
	setValue<K extends keyof T>(key: K, value: T[K]): void;

	/**
	 * Overrides multiple store entries.
	 * @param store New store.
	 */
	setStore(store: Partial<T>): void;

	/**
	 * Hook that watches after store changes.
	 * @param key Key to watch.
	 */
	useStore<K extends keyof T>(key: K): [store: T[K], setStore: (store: T[K] | ((prev: T[K]) => T[K])) => void];

	/**
	 * Hook that watches after store changes.
	 */
	useStore(): [store: T, setStore: (store: Partial<T> | ((prev: T) => T)) => void];

	/**
	 * Subscribe on key changes.
	 * @param key Store key.
	 * @param listener Listener.
	 */
	on<K extends keyof T>(key: K, listener: (value: T[K]) => void): void;

	/**
	 * Subscribe on every store changes.
	 * @param listener Listener.
	 */
	on(listener: (value: T) => void): void;

	/**
	 * Unsubscribe off key changes.
	 * @param key Store key.
	 * @param listener Listener.
	 */
	off<K extends keyof T>(key: K, listener: (value: T[K]) => void): void;

	/**
	 * Unsubscribe off every store changes.
	 * @param listener Listener.
	 */
	off(listener: (value: T) => void): void;
}