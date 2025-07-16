import evaParser from "../parser/evaParser.mjs";
import * as assert from "node:assert";

function test(eva, code, expected) {
  const ast = evaParser.parse(`(begin ${code})`);
  assert.strictEqual(eva.eval(ast), expected);
}

export { test };