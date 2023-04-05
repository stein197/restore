# Restore
Simple key-based store management package with React support.

## Installation
```
npm install @stein197/restore
```

## Usage
```tsx
import createStore from "@stein197/restore";

const store = createStore({number: 1, string: "a"}); // Create a store with initial state
store.getValue("number");                            // 1
store.getStore();                                    // {number: 1, string: ""}
store.setValue("number", 10);                        // Set value for "number" key
store.setStore({string: "ab"});                      // Override multiple store entries
store.on("number", console.log);                     // Subscribe on "number" entry change
store.on(console.log);                               // Subscribe on every store change
function Component(): JSX.Element {
	const [value, setValue] = store.useStore();      // Using a hook that returns the whole store and a setter
	const [num, setNum] = store.useStore("number");  // Use a hook that returns a data associated with "number" field
	return (
		<div>
			<p>{JSON.stringify(value)}</p>
			<p>{num}</p>
			<button onClick={() => {
				setValue({string: "ab"});            // Override multiple store entries
				setNum(10);                          // Set value for only "number" entry
			}}>Update the store</button>
		</div>
	);
}
```

## NPM scripts
- `clean`. Delete all generated files
- `build`. Build the project
- `test`. Run unit tests
