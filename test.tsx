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
	
	// TODO
	describe("setValue()", () => {});
	
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
