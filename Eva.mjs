
/**
 * Eva interpreter.
 */


export class Eva {
  constructor(env = {}) {
    this.globalEnv = new Environment(env);
  }
  eval(expression, environment = this.globalEnv) {
    if (isNumber(expression)) {
      return expression;
    }
    if (isString(expression)) {
      return expression.slice(1, -1);
    }
    if (expression[0] === "+") {
      return this.eval(expression[1], environment) + this.eval(expression[2], environment);
    }
    if (expression[0] === "*") {
      return this.eval(expression[1], environment) * this.eval(expression[2], environment);
    }
    if (expression[0] === "<") {
      return this.eval(expression[1], environment) < this.eval(expression[2], environment);
    }
    if (expression[0] === ">") {
      return this.eval(expression[1], environment) > this.eval(expression[2], environment);
    }
    if (expression[0] === "if") {
      const [_, condition, consequence, alternative] = expression;
      return this.eval(this.eval(condition, environment) ? consequence : alternative, environment);
    }
    if (expression[0] === "while") {
      const [_, condition, body] = expression;
      let result;
      while (this.eval(condition, environment)) {
        result = this.eval(body, environment);
      }
      return result;
    }
    if (expression[0] === "var") {
      const [_, name, value] = expression;
      return environment.define(name, this.eval(value, environment));
    }
    if (expression[0] === "set") {
      const [_, name, value] = expression;
      const env = environment.resolve(name);
      return env.set(name, this.eval(value, env));
    }
    if (isIdentifier(expression)) {
      return environment.lookup(expression);
    }
    if (expression[0] === "begin") {
      const env = new Environment(environment, environment);
      return this._evalBlock(expression.slice(1), env);
    }
    throw `Unimplemented: ${JSON.stringify(expression)}`;
  }
  _evalBlock(expressions, environment) {
    let result;
    for (const expression of expressions) {
      result = this.eval(expression, environment);
    }
    return result;
  }
}

function isNumber(expression) {
  return typeof expression === "number";
}

function isString(expression) {
  return typeof expression === "string" && expression.startsWith('"') && expression.endsWith('"');
}

function isIdentifier(expression) {
  return typeof expression === "string" && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(expression);
}

export class Environment {
  constructor(env = {}, parent = null) {
    this.variables = new Map(Object.entries(env));
    this.parent = parent;
  }

  define(name, value) {
    this.variables.set(name, value);
    return value
  }

  set(name, value) {
    if (!this.variables.has(name)) {
      throw `Undefined variable: ${name}`;
    }
    this.variables.set(name, value);
    return value;
  }

  lookup(name) {
    if (this.variables.has(name)) {
      return this.variables.get(name);
    }
    if (this.parent) {
      return this.parent.lookup(name);
    }
    throw `Undefined variable: ${name}`;
  }
  resolve(name) {
    if (this.variables.has(name)) {
      return this;
    }
    if (this.parent) {
      return this.parent.resolve(name);
    }
    console.trace();
    throw `Undefined variable: ${name}`;
  }
}