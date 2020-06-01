import * as acorn from "acorn";
import Decimal from "decimal.js";
import { Value } from "./value";
import { ExprSyntaxError, ValueTypeError } from "./error";
import {
  toDecimalValue,
  negateValue,
  addValues,
  subtractValues,
  multiplyValues,
  divideValues,
} from "./operations";

/**
 * Represents the user input in a cell.
 */
export class CellInput {
  constructor(type, value) {
    this._type = type;
    this._value = value;
  }

  get type() {
    return this._type;
  }

  get formula() {
    if (this._type !== CellInput.TYPE_FORMULA)
      throw new Error("illegal getter");
    return this._value;
  }

  get literal() {
    if (this._type !== CellInput.TYPE_LITERAL)
      throw new Error("illegal getter");
    return this._value;
  }

  get error() {
    if (this._type !== CellInput.TYPE_ERROR) throw new Error("illegal getter");
    return this._value;
  }
}

// _value: Value
CellInput.TYPE_LITERAL = "literal";
// _value: InputFormula
CellInput.TYPE_FORMULA = "formula";
// _value: Error
CellInput.TYPE_ERROR = "error";

/**
 * Represents the user input, if a formula
 */
export class InputFormula {
  constructor(inputAddresses, formulaFunc) {
    this._inputAddresses = inputAddresses;
    this._formulaFunc = formulaFunc;
  }

  get inputAddresses() {
    return this._inputAddresses;
  }

  get formulaFunc() {
    return this._formulaFunc;
  }
}

export function parseCellInput(text) {
  try {
    if (text.startsWith("=")) {
      const formulaText = text.substring(1);
      const inputFormula = parseInputFormula(formulaText);
      return new CellInput(CellInput.TYPE_FORMULA, inputFormula);
    } else {
      return new CellInput(CellInput.TYPE_LITERAL, parseLiteralValue(text));
    }
  } catch (e) {
    return new CellInput(CellInput.TYPE_ERROR, e);
  }
}

function parseLiteralValue(literalText) {
  try {
    return new Value(Value.TYPE_DECIMAL, new Decimal(literalText));
  } catch (e) {
    if (!(e instanceof Error) || !e.message.startsWith("[DecimalError]")) {
      throw e;
    }
    return new Value(Value.TYPE_TEXT, literalText);
  }
}

// returns InputFormula
function parseInputFormula(formulaText) {
  let ast;
  try {
    ast = acorn.parse(formulaText);
  } catch (e) {
    throw new ExprSyntaxError(e.message);
  }

  if (
    ast.type !== "Program" ||
    ast.body.length !== 1 ||
    ast.body[0].type !== "ExpressionStatement"
  ) {
    throw new ExprSyntaxError("must be a single expression");
  }

  const exprNode = ast.body[0].expression;
  const inputAddresses = listIdentifiers(exprNode);
  const formulaFunc = astToFormula(exprNode, (name) =>
    inputAddresses.indexOf(name)
  );
  return { inputAddresses, formulaFunc };
}

function listIdentifiers(node) {
  switch (node.type) {
    case "Identifier":
      return [node.name];

    case "Literal":
      return [];

    case "UnaryExpression":
      return listIdentifiers(node.argument);

    case "BinaryExpression":
      return [...listIdentifiers(node.left), ...listIdentifiers(node.right)];

    default:
      throw new ExprSyntaxError(`invalid type: ${node.type}`);
  }
}

function astToFormula(node, nameToIndex) {
  switch (node.type) {
    case "Identifier":
      return (args) => args[nameToIndex(node.name)];

    case "Literal":
      if (typeof node.value !== "number" && typeof node.value !== "string") {
        throw new ValueTypeError(`invalid value: ${node.value}`);
      }
      return () => parseLiteralValue(node.value);

    case "UnaryExpression":
      const argumentFormula = astToFormula(node.argument, nameToIndex);
      if (node.operator === "+") {
        return (args) => toDecimalValue(argumentFormula(args));
      } else if (node.operator === "-") {
        return (args) => negateValue(argumentFormula(args));
      } else {
        throw new ExprSyntaxError(`invalid operator: ${node.operator}`);
      }

    case "BinaryExpression":
      const leftFormula = astToFormula(node.left, nameToIndex);
      const rightFormula = astToFormula(node.right, nameToIndex);
      if (node.operator === "+") {
        return (args) => addValues(leftFormula(args), rightFormula(args));
      } else if (node.operator === "-") {
        return (args) => subtractValues(leftFormula(args), rightFormula(args));
      } else if (node.operator === "*") {
        return (args) => multiplyValues(leftFormula(args), rightFormula(args));
      } else if (node.operator === "/") {
        return (args) => divideValues(leftFormula(args), rightFormula(args));
      } else {
        throw new ExprSyntaxError(`invalid operator: ${node.operator}`);
      }

    default:
      throw new ExprSyntaxError(`invalid type: ${node.type}`);
  }
}
