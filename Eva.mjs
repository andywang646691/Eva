
/**
 * Eva interpreter.
 */


export class Eva {
  constructor() {
    this.globalEnv = new Environment({
      null: null,

      true: true,
      false: false,

      VERSION: '0.1',

      // Operators:

      '+'(op1, op2) {
        return op1 + op2;
      },

      '*'(op1, op2) {
        return op1 * op2;
      },

      '-'(op1, op2 = null) {
        if (op2 == null) {
          return -op1;
        }
        return op1 - op2;
      },

      '/'(op1, op2) {
        return op1 / op2;
      },

      // Comparison:

      '>'(op1, op2) {
        return op1 > op2;
      },

      '<'(op1, op2) {
        return op1 < op2;
      },

      '>='(op1, op2) {
        return op1 >= op2;
      },

      '<='(op1, op2) {
        return op1 <= op2;
      },

      '='(op1, op2) {
        return op1 === op2;
      },

      // Console output:

      print(...args) {
        console.log(...args);
      },
    });
  }
  eval(expression, environment = this.globalEnv) {
    if (isNumber(expression)) {
      return expression;
    }
    if (isString(expression)) {
      return expression.slice(1, -1);
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
    if (expression[0] === "def") {
      const [_, name, params, body] = expression;
      const fnDeclaration = {
        name,
        params,
        body,
        env: environment
      }
      environment.define(name, fnDeclaration);
      return fnDeclaration;
    }
    if (expression[0] === "lambda") {
      const [_, params, body] = expression;
      return {
        params,
        body,
        env: environment
      }
    }
    const fn = this.eval(expression[0], environment);
    const args = expression.slice(1)
    if (typeof fn === "function") {
      return fn(...args.map(e => this.eval(e, environment)));
    }
    const activationRecord = fn.params.reduce((acc, param, index) => {
      acc[param] = this.eval(args[index], environment);
      return acc;
    }, {});
    const result = this._evalBody(fn.body, new Environment(activationRecord, fn.env));
    return result;
  }
  _evalBody(body, environment) {
    if (body[0] === 'begin') {
      return this._evalBlock(body.slice(1), environment);
    }
    return this.eval(body, environment);
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
  return typeof expression === "string" && /^[a-zA-Z_<>=+*][a-zA-Z0-9_<>=+]*$/.test(expression);
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
    console.trace();
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