import * as assert from "node:assert";
import { Eva, Environment } from "../Eva.mjs";

const eva = new Eva({
  null: null,
  true: true,
  false: false,
});

/**
 * expressions
 */
assert.strictEqual(eva.eval(1), 1);
assert.strictEqual(eva.eval('"hello"'), "hello");
assert.strictEqual(eva.eval(["+", 1, 2]), 3);
assert.strictEqual(eva.eval(["+", 1, ["+", 2, 3]]), 6);
assert.strictEqual(eva.eval(["*", 2, 3]), 6);
assert.strictEqual(eva.eval(["*", 2, ["*", 3, 4]]), 24);

/**
 * variables
 */
const env = new Environment();
assert.strictEqual(eva.eval(["var", "x", 1], env), 1);
assert.strictEqual(eva.eval(["set", "x", ["+", "x", 1]], env), 2);
assert.throws(() => eva.eval("y", env), /Undefined variable: y$/);
console.log("All tests passed");


/**
 * blocks
 */
assert.strictEqual(eva.eval(["begin", 1, 2, 3]), 3);
assert.strictEqual(eva.eval(["begin", ["var", "x", 1], ["set", "x", 2], "x"]), 2);

/**
 * nested blocks
 */
assert.strictEqual(eva.eval(["begin", ["var", "x", 1], ["begin", ["set", "x", 2], "x"]]), 2);
assert.strictEqual(eva.eval(["begin", ["var", "x", 1], ["begin", ["var", "x", 2], "x"]]), 1);








