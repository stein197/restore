import * as assert from "node:assert";
import * as React from "react";
import * as sandbox from "@stein197/test-sandbox";
import * as createStore from ".";

const STORE_DEFAULT_VALUE = {
	number: 1,
	string: "A"
};

let store = createStore({...STORE_DEFAULT_VALUE});

function ComponentStore(props: {noop?: boolean;}): JSX.Element {
	const CHAR_CODE_START = 65
	const [value, setValue] = store.useStore();
	const nextNumber = value.number + 1;
	const nextChar = String.fromCharCode(CHAR_CODE_START + value.number);
	return (
		<div className="store">
			<p>{JSON.stringify(value)}</p>
			<button onClick={() => props.noop ? setValue({...value}) : setValue({
				number: nextNumber,
				string: value.string + nextChar
			})}>setStore</button>
		</div>
	);
}

function ComponentNumber(props: {noop?: boolean}): JSX.Element {
	const [num, setNum] = store.useStore("number");
	return (
		<div className="num">
			<p>{num}</p>
			<button onClick={() => setNum(props.noop ? num : num + 1)}>setNum</button>
		</div>
	);
}

function ComponentString(): JSX.Element {
	const [str, setStr] = store.useStore("string");
	return (
		<div className="str">
			<p>{str}</p>
			<button onClick={() => setStr(str + String.fromCharCode(str.charCodeAt(str.length - 1) + 1))}>setStr</button>
		</div>
	);
}

function ComponentBoth(): JSX.Element {
	const [num, setNum] = store.useStore("number");
	const [str, setStr] = store.useStore("string");
	return (
		<div className="both">
			<p className="num">{num}</p>
			<p className="str">{str}</p>
			<button onClick={() => (setNum(num + 1), setStr(str + String.fromCharCode(str.charCodeAt(str.length - 1) + 1)))}>setStore</button>
		</div>
	);
}

function ComponentNoop(): JSX.Element {
	const [num, setNum] = store.useStore("number");
	return (
		<div className="noop">
			<button onClick={() => setNum(num)} />
		</div>
	)
}

sandbox.go(globalThis, sb => {
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
		it("setValue() should not call callbacks that were unregistered from without a key", () => {
			const tracker = new assert.CallTracker();
			const f = tracker.calls(() => {}, 1);
			f();
			store.on(f);
			store.off(f);
			store.setValue("number", 10);
			tracker.verify();
		});
		it("setValue() should not call callbacks that use the same key when the new value is the same as the old one", () => {
			const tracker = new assert.CallTracker();
			const f = tracker.calls(() => {}, 1);
			f();
			store.on("number", f);
			store.setValue("number", store.getValue("number"));
			tracker.verify();
		});
		it("setValue() should not call callbacks that don't use keys when the new value is the same as the old one", () => {
			const tracker = new assert.CallTracker();
			const f = tracker.calls(() => {}, 1);
			f();
			store.on(f);
			store.setValue("number", store.getValue("number"));
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
		it("setValue() should force react components to rerender only once when the components use multiple keys", () => sb
			.render(<ComponentBoth />)
			.do(() => {
				store.setValue("number", 10);
				store.setValue("string", "Hello, World!");
			})
			.rerenders(2)
			.run()
		);
		it("setValue() should not force react components to rerender that use the same key when the new value is the same as the old one", () => sb
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
	describe("setStore()", () => {
		it("getValue() should return correct result after calling setStore()", () => {
			store.setStore({number: 10});
			assert.equal(store.getValue("number"), 10);
		});
		it("getStore() should return correct result after calling setStore()", () => {
			store.setStore({number: 10});
			assert.deepStrictEqual(store.getStore(), {...STORE_DEFAULT_VALUE, number: 10});
		});
		it("setStore() should call callbacks registered through on() using a key", () => {
			const tracker = new assert.CallTracker();
			const f = tracker.calls(() => {}, 1);
			store.on("string", f);
			store.setStore({number: 10});
			tracker.verify();
		});
		it("setStore() should call callbacks registered through on() without a key", () => {
			const tracker = new assert.CallTracker();
			const f = tracker.calls(() => {}, 1);
			store.on(f);
			store.setStore({number: 10});
			tracker.verify();
		});
		it("setStore() should not call callbacks that were unregistered from a key", () => {
			const tracker = new assert.CallTracker();
			const f = tracker.calls(() => {}, 1);
			f();
			store.on("string", f);
			store.off("string", f);
			store.setStore({number: 10});
			tracker.verify();
		});
		it("setStore() should not call callbacks that were unregistered from without a key", () => {
			const tracker = new assert.CallTracker();
			const f = tracker.calls(() => {}, 1);
			f();
			store.on(f);
			store.off(f);
			store.setStore({number: 10});
			tracker.verify();
		});
		it("setStore() should not call callbacks that use the same key when the new value is the same as the old one", () => {
			const tracker = new assert.CallTracker();
			const f = tracker.calls(() => {}, 1);
			f();
			store.on("number", f);
			store.setStore({...store.getStore()});
			tracker.verify();
		});
		it("setStore() should not call callbacks that don't use keys when the new value is the same as the old one", () => {
			const tracker = new assert.CallTracker();
			const f = tracker.calls(() => {}, 1);
			f();
			store.on(f);
			store.setStore({...store.getStore()});
			tracker.verify();
		});
		it("setStore() should force react components to rerender that use a key", () => sb
			.render(<ComponentNumber />)
			.do(() => store.setStore({number: 10}))
			.rerenders(2)
			.run()
		);
		it("setStore() should force react components to rerender that don't use keys", () => sb
			.render(<ComponentStore />)
			.do(() => store.setStore({number: 10}))
			.rerenders(2)
			.run()
		);
		it("setStore() should force react components to rerender only once when the components use multiple keys", () => sb
			.render(<ComponentBoth />)
			.do(() => store.setStore({number: 10, string: "Hello, World!"}))
			.rerenders(2)
			.run()
		);
		it("setStore() should not force react components to rerender that use a key when the new store is the same as the old one", () => sb
			.render(<ComponentNumber />)
			.do(() => store.setStore({...store.getStore()}))
			.rerenders(1)
			.run()
		);
		it("setStore() should not force react components to rerender that don't use keys when the new store is the same as the old one", () => sb
			.render(<ComponentStore />)
			.do(() => store.setStore({...store.getStore()}))
			.rerenders(1)
			.run()
		);
	});
	describe("useStore(key)", () => {
		it("useStore() should return correct value", () => sb
			.render(<ComponentNumber />)
			.equals(sb => sb.find("p")!.textContent, "1")
			.run()
		);
		it("useStore() should always return the same reference to the setter callback", async () => {
			let f, f1, f2;
			function Component(): JSX.Element {
				const [num, setNum] = store.useStore("number");
				f = setNum;
				return (
					<>
						<p>{num}</p>
						<button onClick={() => setNum(num + 1)} />
					</>
				);
			}
			await sb.render(<Component />).do(() => f1 = f).simulate(sb => sb.find("button")!, "click").do(() => f2 = f).run();
			assert.equal(typeof f1, "function");
			assert.equal(typeof f2, "function");
			assert.equal(f1, f2);
		});
		it("Calling a setter should call callbacks registered through on() using the same key", async () => {
			const tracker = new assert.CallTracker();
			const f = tracker.calls(() => {}, 1);
			store.on("number", f);
			await sb.render(<ComponentNumber />).simulate(sb => sb.find("button")!, "click").run();
			tracker.verify();
		});
		it("Calling a setter should call callbacks registered through on() without a key", async () => {
			const tracker = new assert.CallTracker();
			const f = tracker.calls(() => {}, 1);
			store.on(f);
			await sb.render(<ComponentNumber />).simulate(sb => sb.find("button")!, "click").run();
			tracker.verify();
		});
		it("Calling a setter should not call callbacks that were unregistered using the same key", async () => {
			const tracker = new assert.CallTracker();
			const f = tracker.calls(() => {}, 1);
			f();
			store.on("number", f);
			store.off("number", f);
			await sb.render(<ComponentNumber />).simulate(sb => sb.find("button")!, "click").run();
			tracker.verify();
		});
		it("Calling a setter should not call callbacks that were unregistered without a key", async () => {
			const tracker = new assert.CallTracker();
			const f = tracker.calls(() => {}, 1);
			f();
			store.on(f);
			store.off(f);
			await sb.render(<ComponentNumber />).simulate(sb => sb.find("button")!, "click").run();
			tracker.verify();
		});
		it("Calling a setter should not call callbacks that were registered throught on() using a different key", async () => {
			const tracker = new assert.CallTracker();
			const f = tracker.calls(() => {}, 1);
			f();
			store.on("string", f);
			await sb.render(<ComponentNumber />).simulate(sb => sb.find("button")!, "click").run();
			tracker.verify();
		});
		it("Calling a setter should not call callbacks that use the same key when the new value is the same as the old one", async () => {
			const tracker = new assert.CallTracker();
			const f = tracker.calls(() => {}, 1);
			f();
			store.on("number", f);
			await sb.render(<ComponentNoop />).simulate(sb => sb.find("button")!, "click").run();
			tracker.verify();
		});
		it("Calling a setter should not call callbacks that don't use keys when the new value is the same as the old one", async () => {
			const tracker = new assert.CallTracker();
			const f = tracker.calls(() => {}, 1);
			f();
			store.on(f);
			await sb.render(<ComponentNoop />).simulate(sb => sb.find("button")!, "click").run();
			tracker.verify();
		});
		it("Calling a setter should force react components to rerender and to update the rendered value", () => sb
			.render(<ComponentNumber />)
			.simulate(sb => sb.find("button")!, "click")
			.rerenders(2)
			.equals(sb => sb.find("p")!.textContent, "2")
			.run()
		);
		it("Calling a setter should force react components to rerender that use the same key and to update their rendered values", () => {
			function Component(): JSX.Element {
				return (
					<>
						<ComponentNumber />
						<ComponentBoth />
					</>
				);
			}
			return sb
				.render(<Component />)
				.equals(sb => sb.find(".both .num")!.textContent, "1")
				.simulate(sb => sb.find(".num button")!, "click")
				.equals(sb => sb.find(".both .num")!.textContent, "2")
				.run();
		});
		it("Calling a setter should force react components to rerender that don't use keys and to update their rendered values", () => {
			function Component(): JSX.Element {
				return (
					<>
						<ComponentNumber />
						<ComponentStore />
					</>
				);
			}
			return sb
				.render(<Component />)
				.equals(sb => sb.find(".store p")!.textContent, "{\"number\":1,\"string\":\"A\"}")
				.simulate(sb => sb.find(".num button")!, "click")
				.equals(sb => sb.find(".store p")!.textContent, "{\"number\":2,\"string\":\"A\"}")
				.run();
		});
		it("Calling a setter should not force react components to rerender that use the same key when the new value is the same as the old one", async () => {
			const tracker = new assert.CallTracker();
			function Component1(): JSX.Element {
				const [value, setValue] = store.useStore("number");
				return (
					<>
						<button onClick={() => setValue(value)}>noop</button>
					</>
				);
			}
			const Component2 = tracker.calls(ComponentNumber, 1);
			function Component(): JSX.Element {
				return (
					<>
						<Component1 />
						<Component2 />
					</>
				);
			}
			await sb.render(<Component />).simulate(sb => sb.findByText("noop")!, "click").run();
			tracker.verify();
		});
		it("Calling a setter should not force react components to rerender that don't use keys when the new value is the same as the old one", async () => {
			const tracker = new assert.CallTracker();
			const Component1 = tracker.calls(ComponentStore, 1);
			function Component2(): JSX.Element {
				const [value, setValue] = store.useStore("number");
				return (
					<>
						<button onClick={() => setValue(value)}>noop</button>
					</>
				);
			}
			function Component(): JSX.Element {
				return (
					<>
						<Component1 />
						<Component2 />
					</>
				);
			}
			await sb.render(<Component />).simulate(sb => sb.findByText("noop")!, "click").run();
			tracker.verify();
		});
		it("Calling a setter should not force react components to rerender that use different key", async () => {
			const tracker = new assert.CallTracker();
			const Component1 = tracker.calls(ComponentString, 1);
			function Component(): JSX.Element {
				return (
					<>
						<Component1 />
						<ComponentNumber />
					</>
				);
			}
			await sb.render(<Component />).simulate(sb => sb.find(".num button")!, "click").run();
			tracker.verify();
		});
	});
	describe("useStore()", () => {
		it("useStore() should return correct value", () => sb
			.render(<ComponentStore />)
			.equals(sb => sb.find("p")!.textContent, "{\"number\":1,\"string\":\"A\"}")
			.run()
		);
		it("useStore() should always return the same reference to the setter callback", async () => {
			let f, f1, f2;
			function Component(): JSX.Element {
				const [value, setValue] = store.useStore();
				f = setValue;
				return (
					<>
						<p>{JSON.stringify(value)}</p>
						<button />
					</>
				);
			}
			await sb.render(<Component />).do(() => f1 = f).simulate(sb => sb.find("button")!, "click").do(() => f2 = f).run();
			assert.equal(typeof f1, "function");
			assert.equal(typeof f2, "function");
			assert.equal(f1, f2);
		});
		it("Calling a setter should call callbacks registered through on() using a key", async () => {
			const tracker = new assert.CallTracker();
			const f = tracker.calls(() => {}, 1);
			store.on("number", f);
			await sb.render(<ComponentStore />).simulate(sb => sb.find("button")!, "click").run();
			tracker.verify();
		});
		it("Calling a setter should call callbacks registered through on() without a key", async () => {
			const tracker = new assert.CallTracker();
			const f = tracker.calls(() => {}, 1);
			store.on(f);
			await sb.render(<ComponentStore />).simulate(sb => sb.find("button")!, "click").run();
			tracker.verify();
		});
		it("Calling a setter should not call callbacks that were unregistered using a key", async () => {
			const tracker = new assert.CallTracker();
			const f = tracker.calls(() => {}, 1);
			f();
			store.on("number", f);
			store.off("number", f);
			await sb.render(<ComponentStore />).simulate(sb => sb.find("button")!, "click").run();
			tracker.verify();
		});
		it("Calling a setter should not call callbacks that were unregistered without a key", async () => {
			const tracker = new assert.CallTracker();
			const f = tracker.calls(() => {}, 1);
			f();
			store.on(f);
			store.off(f);
			await sb.render(<ComponentStore />).simulate(sb => sb.find("button")!, "click").run();
			tracker.verify();
		});
		it("Calling a setter should not call callbacks that use a key when the new value is the same as the old one", async () => {
			const tracker = new assert.CallTracker();
			const f = tracker.calls(() => {}, 1);
			f();
			store.on("number", f);
			await sb.render(<ComponentStore noop={true} />).simulate(sb => sb.find("button")!, "click").run();
			tracker.verify();
		});
		it("Calling a setter should not call callbacks that don't use keys when the new value is the same as the old one", async () => {
			const tracker = new assert.CallTracker();
			const f = tracker.calls(() => {}, 1);
			f();
			store.on(f);
			await sb.render(<ComponentStore noop={true} />).simulate(sb => sb.find("button")!, "click").run();
			tracker.verify();
		});
		it("Calling a setter should force react components to rerender and to update the rendered value", () => sb
			.render(<ComponentStore />)
			.simulate(sb => sb.find("button")!, "click")
			.rerenders(2)
			.equals(sb => sb.find("p")!.textContent, "{\"number\":2,\"string\":\"AB\"}")
			.run()
		);
		it("Calling a setter should force react components to rerender that use a key and to update their rendered values", () => {
			function Component(): JSX.Element {
				return (
					<>
						<ComponentNumber />
						<ComponentStore />
					</>
				);
			}
			return sb
				.render(<Component />)
				.equals(sb => sb.find(".num p")!.textContent, "1")
				.simulate(sb => sb.find(".store button")!, "click")
				.equals(sb => sb.find(".num p")!.textContent, "2")
				.run();
		});
		it("Calling a setter should force react components to rerender that don't use keys and to update their rendered values", () => {
			function Component(): JSX.Element {
				return (
					<>
						<div className="store-1">
							<ComponentStore />
						</div>
						<div className="store-2">
							<ComponentStore />
						</div>
					</>
				);
			}
			return sb
				.render(<Component />)
				.equals(sb => sb.find(".store-1 p")!.textContent, "{\"number\":1,\"string\":\"A\"}")
				.simulate(sb => sb.find(".store-2 button")!, "click")
				.equals(sb => sb.find(".store-1 p")!.textContent, "{\"number\":2,\"string\":\"AB\"}")
				.run();
		});
		it("Calling a setter should not force react components to rerender that use a key when the new value is the same as the old one", async () => {
			const tracker = new assert.CallTracker();
			const Component1 = tracker.calls(ComponentNumber, 1);
			function Component(): JSX.Element {
				return (
					<>
						<ComponentStore noop={true} />
						<Component1 />
					</>
				);
			}
			await sb.render(<Component />).simulate(sb => sb.find(".store button")!, "click").run();
			tracker.verify();
		});
		it("Calling a setter should not force react components to rerender that don't use keys when the new value is the same as the old one", async () => {
			const tracker = new assert.CallTracker();
			const Component1 = tracker.calls(ComponentStore, 1);
			function Component(): JSX.Element {
				return (
					<>
						<div className="store-1">
							<Component1 />
						</div>
						<div className="store-2">
							<ComponentStore noop={true} />
						</div>
					</>
				);
			}
			await sb.render(<Component />).simulate(sb => sb.find(".store-2 button")!, "click").run();
			tracker.verify();
		});
	});
	describe("on(key, listener)", () => {
		it("Should accept correct parameter and be called when calling setValue() with the same key", () => {
			const [f, tracker] = createTracker(1);
			store.on("number", f);
			store.setValue("number", 10);
			assert.equal(tracker.getCalls(f)[0].arguments[0], 10);
			tracker.verify();
		});
		it("Should not be called when calling setValue() with the same key and the new value is the same as the old one", () => {
			const [f, tracker] = createTracker(1);
			store.on("number", f);
			f();
			store.setValue("number", store.getValue("number"));
			tracker.verify();
		});
		it("Should not be called when calling setValue() with a different key", () => {
			const [f, tracker] = createTracker(1);
			store.on("number", f);
			f();
			store.setValue("string", "Hello, World!");
			tracker.verify();
		});
		it("Should accept correct parameter and be called when calling setStore() with the same key", () => {
			const [f, tracker] = createTracker(1);
			store.on("number", f);
			store.setStore({number: 10});
			assert.equal(tracker.getCalls(f)[0].arguments[0], 10);
			tracker.verify();
		});
		it("Should not be called when calling setStore() with the same key and the new value is the same as the old one", () => {
			const [f, tracker] = createTracker(1);
			store.on("number", f);
			f();
			store.setStore({number: store.getValue("number")});
			tracker.verify();
		});
		it("Should not be called when calling setStore() with another keys", () => {
			const [f, tracker] = createTracker(1);
			store.on("number", f);
			f();
			store.setStore({string: "Hello, World!"});
			tracker.verify();
		});
		it("Should accept correct parameter and be called when calling a key hook setter with the same key", async () => {
			const [f, tracker] = createTracker(1);
			store.on("number", f);
			await sb.render(<ComponentNumber />).simulate(sb => sb.find("button")!, "click").run();
			assert.equal(tracker.getCalls(f)[0].arguments[0], 2);
			tracker.verify();
		});
		it("Should not be called when calling a key hook setter with the same key and the new value is the same as the old one", async () => {
			const [f, tracker] = createTracker(1);
			store.on("number", f);
			f();
			await sb.render(<ComponentNumber noop={true} />).simulate(sb => sb.find("button")!, "click").run();
			tracker.verify();
		});
		it("Should not be called when calling a key hook setter() with a different key", async () => {
			const [f, tracker] = createTracker(1);
			store.on("number", f);
			f();
			await sb.render(<ComponentString />).simulate(sb => sb.find("button")!, "click").run();
			tracker.verify();
		});
		it("Should accept correct parameter and be called when calling a store hook setter with the same key", async () => {
			const [f, tracker] = createTracker(1);
			store.on("number", f);
			await sb.render(<ComponentStore />).simulate(sb => sb.find("button")!, "click").run();
			assert.equal(tracker.getCalls(f)[0].arguments[0], 2);
			tracker.verify();
		});
		it("Should not be called when calling a store hook setter with the same key and the new value is the same as the old one", async () => {
			const [f, tracker] = createTracker(1);
			store.on("number", f);
			f();
			await sb.render(<ComponentStore noop={true} />).simulate(sb => sb.find("button")!, "click").run();
			tracker.verify();
		});
		it("Should not be called when calling a store hook setter with another keys", async () => {
			const [f, tracker] = createTracker(1);
			store.on("number", f);
			f();
			function Component(): JSX.Element {
				const [value, setValue] = store.useStore();
				return (
					<>
						<button onClick={() => setValue({string: "Hello, World!"})} />
					</>
				);
			}
			await sb.render(<Component />).simulate(sb => sb.find("button")!, "click").run();
			tracker.verify();
		});
	});
	describe("on(listener)", () => {
		it("Should accept correct parameter and be called when calling setValue()", () => {
			const [f, tracker] = createTracker(1);
			store.on(f);
			store.setValue("number", 10);
			assert.deepStrictEqual(tracker.getCalls(f)[0].arguments[0], {number: 10, string: "A"});
			tracker.verify();
		});
		it("Should not be called when calling setValue() and the new value is the same as the old one", () => {
			const [f, tracker] = createTracker(1);
			store.on(f);
			f();
			store.setValue("number", store.getValue("number"));
			tracker.verify();
		});
		it("Should accept correct parameter and be called when calling setStore()", () => {
			const [f, tracker] = createTracker(1);
			store.on(f);
			store.setStore({number: 10});
			assert.deepStrictEqual(tracker.getCalls(f)[0].arguments[0], {number: 10, string: "A"});
			tracker.verify();
		});
		it("Should not be called when calling setStore() and the new value is the same as the old one", () => {
			const [f, tracker] = createTracker(1);
			store.on(f);
			f();
			store.setStore({...store.getStore()});
			tracker.verify();
		});
		it("Should accept correct parameter and be called when calling a key hook setter with a key", async () => {
			const [f, tracker] = createTracker(1);
			store.on(f);
			await sb.render(<ComponentNumber />).simulate(sb => sb.find("button")!, "click").run();
			assert.deepStrictEqual(tracker.getCalls(f)[0].arguments[0], {number: 2, string: "A"});
			tracker.verify();
		});
		it("Should not be called when calling a key hook setter with a key and the new value is the same as the old one", async () => {
			const [f, tracker] = createTracker(1);
			store.on(f);
			f();
			await sb.render(<ComponentNumber noop={true} />).simulate(sb => sb.find("button")!, "click").run();
			tracker.verify();
		});
		it("Should accept correct parameter and be called when calling a store hook setter", async () => {
			const [f, tracker] = createTracker(1);
			store.on(f);
			await sb.render(<ComponentStore />).simulate(sb => sb.find("button")!, "click").run();
			assert.deepStrictEqual(tracker.getCalls(f)[0].arguments[0], {number: 2, string: "AB"});
			tracker.verify();
		});
		it("Should not be called when calling a store hook setter and the new value is the same as the old one", async () => {
			const [f, tracker] = createTracker(1);
			store.on(f);
			f();
			await sb.render(<ComponentStore noop={true} />).simulate(sb => sb.find("button")!, "click").run();
			tracker.verify();
		});
	});
	describe("off(key, listener)", () => {
		it("Should not call listener after unsubscribing it", () => {
			const [f, tracker] = createTracker(1);
			store.on("number", f);
			store.off("number", f);
			f();
			store.setValue("number", 10);
			store.setStore({number: 20});
			tracker.verify();
		});
	});
	describe("off(listener)", () => {
		it("Should not call listener after unsubscribing it", () => {
			const [f, tracker] = createTracker(1);
			store.on(f);
			store.off(f);
			f();
			store.setValue("number", 10);
			store.setStore({number: 20});
			tracker.verify();
		});
	});
});

function createTracker(calls: number): [() => void, assert.CallTracker] {
	const tracker = new assert.CallTracker();
	const f = tracker.calls(() => {}, calls);
	return [f, tracker];
}
