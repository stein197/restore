import * as assert from "node:assert";
import * as React from "react";
import * as sandbox from "@stein197/test-sandbox";
import * as createStore from ".";

const STORE_DEFAULT_VALUE = {
	number: 1,
	string: "A"
};

let store = createStore({...STORE_DEFAULT_VALUE});

function ComponentStore(): JSX.Element {
	const CHAR_CODE_START = 65
	const [value, setValue] = store.useStore();
	const nextNumber = value.number + 1;
	const nextChar = String.fromCharCode(CHAR_CODE_START + value.number);
	return (
		<>
			<p>{JSON.stringify(value)}</p>
			<button onClick={() => setValue({
				number: nextNumber,
				string: value.string + nextChar
			})}>setStore</button>
		</>
	);
}

function ComponentNumber(): JSX.Element {
	const [num, setNum] = store.useStore("number");
	return (
		<>
			<p>{num}</p>
			<button onClick={() => setNum(num + 1)}>setNum</button>
		</>
	);
}

function ComponentString(): JSX.Element {
	const [str, setStr] = store.useStore("string");
	return (
		<>
			<p>{str}</p>
			<button onClick={() => setStr(str + String.fromCharCode(str.charCodeAt(str.length - 1) + 1))}>setStr</button>
		</>
	);
}

sandbox(globalThis, sb => {
	beforeEach(() => {
		store = createStore({...STORE_DEFAULT_VALUE})
	});
	describe("getValue()", () => {	
		it("Should return correct value after initialization", () => {
			assert.equal(store.getValue("number"), 1);
		});
		it("Should return correct value after calling setValue()", () => {
			store.setValue("string", "Hello, World!");
			assert.equal(store.getValue("string"), "Hello, World!");
		});
		it("Should return correct value after calling setStore()", () => {
			store.setStore({
				string: "Hello, World!"
			});
			assert.equal(store.getValue("string"), "Hello, World!");
		});
		it("Should return correct value after calling hook setStore(store)", async () => {
			await sb.render(<ComponentStore />).simulate(sb => sb.findByText("setStore")!, "click").run();
			assert.equal(store.getValue("string"), "AB");
		});
		it("Should return correct value after calling hook setStore(key, value)", async () => {
			await sb.render(<ComponentNumber />).simulate(sb => sb.findByText("setNum")!, "click").run();
			assert.equal(store.getValue("number"), 2);
		});
	});
	describe("getStore()", () => {
		it("Should return correct value after initialization", () => {
			assert.deepStrictEqual(store.getStore(), STORE_DEFAULT_VALUE);
		});
		it("Should return correct value after calling setValue()", () => {
			store.setValue("string", "Hello, World!");
			assert.deepStrictEqual(store.getStore(), {...STORE_DEFAULT_VALUE, string: "Hello, World!"});
		});
		it("Should return correct value after calling setStore()", () => {
			store.setStore({
				string: "Hello, World!"
			});
			assert.deepStrictEqual(store.getStore(), {...STORE_DEFAULT_VALUE, string: "Hello, World!"});
		});
		it("Should return correct value after calling hook setStore(store)", async () => {
			await sb.render(<ComponentStore />).simulate(sb => sb.findByText("setStore")!, "click").run();
			assert.deepStrictEqual(store.getStore(), {number: 2, string: "AB"});
		});
		it("Should return correct value after calling hook setStore(key, value)", async () => {
			await sb.render(<ComponentNumber />).simulate(sb => sb.findByText("setNum")!, "click").run();
			assert.deepStrictEqual(store.getStore(), {...STORE_DEFAULT_VALUE, number: 2});
		});
	});
	describe("setValue()", () => {
		it("getValue() should return correct result after calling setValue()", () => {
			store.setValue("number", 10);
			assert.equal(store.getValue("number"), 10);
		});
		it("getStore() should return correct result after calling setValue()", () => {
			store.setValue("number", 10);
			assert.deepStrictEqual(store.getStore(), {...STORE_DEFAULT_VALUE, number: 10});
		});
		it("setValue() should call callbacks registered through on() using the same key", () => {
			const tracker = new assert.CallTracker();
			const f = tracker.calls(() => {}, 1);
			store.on("number", f);
			store.setValue("number", 10);
			tracker.verify();
		});
		it("setValue() should call callbacks registered through on() without a key", () => {
			const tracker = new assert.CallTracker();
			const f = tracker.calls(() => {}, 1);
			store.on(f);
			store.setValue("number", 10);
			tracker.verify();
		});
		it("setValue() should not call callbacks registered through on() using a different key", () => {
			const tracker = new assert.CallTracker();
			const f = tracker.calls(() => {}, 1);
			f();
			store.on("string", f);
			store.setValue("number", 10);
			tracker.verify();
		});
		it("setValue() should not call callbacks that were unregistered from the same key", () => {
			const tracker = new assert.CallTracker();
			const f = tracker.calls(() => {}, 1);
			f();
			store.on("number", f);
			store.off("number", f);
			store.setValue("number", 10);
			tracker.verify();
		});
		it("setValue() should not call callbacks that were unregistered from wihtout a key", () => {
			const tracker = new assert.CallTracker();
			const f = tracker.calls(() => {}, 1);
			f();
			store.on(f);
			store.off(f);
			store.setValue("number", 10);
			tracker.verify();
		});
		it("setValue() should force react components to rerender that use the same key", () => sb
			.render(<ComponentNumber />)
			.do(() => store.setValue("number", 10))
			.rerenders(2)
			.run()
		);
		it("setValue() should force react components to rerender that don't use keys", () => sb
			.render(<ComponentStore />)
			.do(() => store.setValue("number", 10))
			.rerenders(2)
			.run()
		);
		it("setValue() should not force react components to rerender that yse the same key when the new value is the same as the old one", () => sb
			.render(<ComponentNumber />)
			.do(() => store.setValue("number", store.getValue("number")))
			.rerenders(1)
			.run()
		);
		it("setValue() should not force react components to rerender that use different key", () => sb
			.render(<ComponentString />)
			.do(() => store.setValue("number", 10))
			.rerenders(1)
			.run()
		);
	});
	
	// TODO
	describe("setStore()", () => {});
	
	// TOD
	describe("useStore()", () => {});

	// TODO
	describe("useStore()", () => {});
	
	// TODO
	describe("on()", () => {});
	
	// TODO
	describe("off()", () => {});
});
