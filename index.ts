import * as React from "react";

/**
 * Creates a simple store object. The object has methods for changing, retrieving and subscribing/unsubscribing on/off
 * changes and one React hook to use in components. Store contains data which can be retrieved/changed by a string key.
 * Every change to the store calls subscribed listeners and rerenders. When making a change to the store, the store
 * doesn't make redundant calls or component rerenders.
 * @typeParam T - Store object type.
 * @param store Initial value for the store.
 * @example
 * ```tsx
 * const store = createStore({number: 1, string: "a"}); // Create a store with initial state
 * store.getValue("number");                            // 1
 * store.getStore();                                    // {number: 1, string: ""}
 * store.setValue("number", 10);                        // Set value for "number" key
 * store.setStore({string: "ab"});                      // Override multiple store entries
 * store.on("number", console.log);                     // Subscribe on "number" entry change
 * store.on(console.log);                               // Subscribe on every store change
 * function Component(): JSX.Element {
 * 	const [value, setValue] = store.useStore();         // Using a hook that returns the whole store and a setter
 * 	const [num, setNum] = store.useStore("number");     // Use a hook that returns a data associated with "number" field
 * 	return (
 * 		<div>
 * 			<p>{JSON.stringify(value)}</p>
 * 			<p>{num}</p>
 * 			<button onClick={() => {
 * 				setValue({string: "ab"});               // Override multiple store entries
 * 				setNum(10);                             // Set value for only "number" entry
 * 			}}>Update the store</button>
 * 		</div>
 * 	);
 * }
 * ```
 */
export = function createStore<T>(store: T): Store<T> {
	const listenerStore: any = {};
	function updateStore<K extends keyof T>(key: K | "", value: T[K] | Partial<T>): void {
		if (key) {
			if (store[key] === value)
				return;
			store[key] = value as T[K];
			let listenerArray = listenerStore[key];
			if (listenerArray)
				for (const listener of listenerArray)
					listener(store[key]);
			listenerArray = listenerStore[""];
			if (listenerArray)
				for (const listener of listenerArray)
					listener(store);
		} else {
			if (shallowlyEqual(store, value))
				return;
			const updatedKeys: string[] = [];
			for (const k in value as any) {
				if (store[k as K] !== (value as T)[k as K])
					updatedKeys.push(k);
				store[k as K] = (value as T)[k as K];
			}
			for (const k in listenerStore) {
				const listenerArray = listenerStore[k];
				if (!listenerArray)
					continue;
				for (const listener of listenerArray)
					if (!k || updatedKeys.includes(k))
						listener(k ? store[k as K] : store);
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
			const [, useForce] = React.useReducer(x => ++x, 0);
			const dispatch = React.useCallback((value: any) => updateStore(key as K, value), [key]);
			React.useEffect(() => {
				function listener(value: any) {
					setState(value);
					if (typeof value === "object")
						useForce();
				}
				addListener(key, listener);
				return () => removeListener(key, listener)
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

function shallowlyEqual(a: any, b: any): boolean {
	if (Object.keys(a).length !== Object.keys(b).length)
		return false;
	for (const k in a)
		if (a[k] != b[k])
			return false;
	return true;
}

/**
 * Store object implementation.
 */
type Store<T> = {

	/**
	 * Retrieves a value from the store by a key.
	 * @param key Store key.
	 */
	getValue<K extends keyof T>(key: K): T[K];

	/**
	 * Returns the whole store.
	 */
	getStore(): T;

	/**
	 * Sets a value by a key.
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
	 * Hook that watches after store changes made to an entry specified by a key.
	 * @param key Key to watch.
	 */
	useStore<K extends keyof T>(key: K): [store: T[K], setStore: (store: T[K]) => void];

	/**
	 * Hook that watches after a whole store changes.
	 */
	useStore(): [store: T, setStore: (store: Partial<T>) => void];

	/**
	 * Subscribe on value changes by a key.
	 * @param key Store key.
	 * @param listener Listener.
	 */
	on<K extends keyof T>(key: K, listener: (value: T[K]) => void): void;

	/**
	 * Subscribe on every store change.
	 * @param listener Listener.
	 */
	on(listener: (value: T) => void): void;

	/**
	 * Unsubscribe off value changes by a key.
	 * @param key Store key.
	 * @param listener Listener.
	 */
	off<K extends keyof T>(key: K, listener: (value: T[K]) => void): void;

	/**
	 * Unsubscribe off every store change.
	 * @param listener Listener.
	 */
	off(listener: (value: T) => void): void;
}