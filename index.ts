import * as React from "react";

// TODO
export = function createStore<T>(store: T): Store<T> {
	const listenerStore: any = {};
	function updateStore<K extends keyof T>(key: K | "", value: T[K] | Partial<T>): void {
		if (key) {
			store[key] = value as T[K];
			store = {...store};
			let listenerArray = listenerStore[key];
			if (listenerArray)
				for (const listener of listenerArray)
					listener(store[key]);
			listenerArray = listenerStore[""];
			if (listenerArray)
				for (const listener of listenerArray)
					listener(store);
		} else {
			store = {...store, ...value};
			for (const k in listenerStore) {
				const listenerArray = listenerStore[k];
				for (const listener of listenerArray) {
					listener(k ? store[k as K] : store);
				}
			}
		}
	}
	function addListener(a: any, b?: any): void {
		const [key, listener] = getKeyAndListener(a, b);
		if (!listenerStore[key])
			listenerStore[key] = [];
		listenerStore[key].push(listener);
	}
	function removeListener(a: any, b?: any): void {
		const [key, listener] = getKeyAndListener(a, b);
		if (!listenerStore[key])
			return;
		const index = listenerStore[key].indexOf(listener);
		listenerStore[key].splice(index, 1);
		if (!listenerStore[key].length)
			delete listenerStore[key];
	}
	return {
		getValue(key) {
			return store[key];
		},
		getStore() {
			return store;
		},
		setValue(key, value) {
			updateStore(key, value);
		},
		setStore(value) {
			updateStore("", value);
		},
		useStore<K extends keyof T>(key?: K | ""): any {
			key = key ?? "";
			const [state, setState] = React.useState(key ? store[key] : store);
			const dispatch = React.useCallback((state: any) => updateStore(key as K, state), [key]);
			React.useEffect(() => {
				addListener(key, setState);
				return () => removeListener(key, setState)
			}, [key]);
			return [state, dispatch];
		},
		// @ts-ignore
		on(a, b) {
			addListener(a, b);
		},
		// @ts-ignore
		off(a, b) {
			removeListener(a, b);
		}
	};
}

function getKeyAndListener(a: any, b: any): [string, () => void] {
	const key = typeof a === "string" && b ? a : "";
	const listener = typeof a === "function" ? a : b;
	return [key, listener];
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
	useStore<K extends keyof T>(key: K): [store: T[K], setStore: (store: T[K]) => void];

	/**
	 * Hook that watches after store changes.
	 */
	useStore(): [store: T, setStore: (store: Partial<T>) => void];

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