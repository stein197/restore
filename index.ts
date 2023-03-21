import * as React from "react";

// TODO
export = function createStore<T>(store: T): Store<T> {
	return {
		getValue(key) {
			return store[key];
		},
		getStore() {
			return store;
		},
		setValue(key, value) {
			// TODO
		},
		setStore(store) {
			// TODO
		},
		useStore(key) {
			// TODO
		},
		on(a, b) {
			// TODO
		},
		off(a, b) {
			// TODO
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