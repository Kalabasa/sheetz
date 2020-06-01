import { errorToOutput, ExprReferenceError } from "./error";

/**
 * Represents the evaluated output of a sheet cell
 */
export class Output {
  constructor(value, settings = {}) {
    this.value = value;
    this.error = settings.error;
  }
}

/**
 * Represents the value of a sheet cell. E.g., a formula.
 * 
 * A constant value is represented by a formula that has no inputs.
 */
export class Expression {
  constructor(inputs, formula) {
    // Expression[]: dependencies
    this._inputs = [];
    // (Value[]) => Value throws Error
    this._formula = () => "";
    // Output: cached output
    this._output = undefined;
    // Expression[]: inverse of inputs
    this.dependents = new Set();

    this.change(inputs, formula);
  }

  get inputs() {
    return this._inputs;
  }

  get formula() {
    return this._formula;
  }

  change(inputs, formula) {
    for (const input of this._inputs) {
      input.dependents.delete(this);
    }

    this._inputs = inputs;
    this._formula = formula;
    this._output = undefined;

    for (const input of this._inputs) {
      if (isDependentOrEqual(input, this)) {
        console.log(input, this);
        throw new ExprReferenceError("cyclic dependency");
      }
      input.dependents.add(this);
    }
  }

  invalidate() {
    if (this._output !== undefined) {
      this._output = undefined;
      for (const dep of this.dependents) {
        dep.invalidate();
      }
    }
  }

  get output() {
    if (this._output === undefined) {
      const errorInput = this._inputs.find((input) => input.output.error);
      if (errorInput) {
        this._output = errorToOutput(
          new ExprReferenceError("error in referenced cells")
        );
      } else {
        try {
          this._output = new Output(
            this._formula(this._inputs.map((input) => input.output.value))
          );
        } catch (e) {
          this._output = errorToOutput(e);
        }
      }

      for (const dep of this.dependents) {
        dep.invalidate();
      }
    }

    return this._output;
  }
}

function isDependentOrEqual(subject, needle) {
  if (subject === needle) return true;
  return subject._inputs.some((dep) => isDependentOrEqual(dep, needle));
}
