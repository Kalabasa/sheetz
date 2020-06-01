import Decimal from "decimal.js";
import { ValueTypeError } from "./error";
import { Value } from "./value";

export function addValues(value1, value2) {
  if (value1.type === Value.TYPE_TEXT || value2.type === Value.TYPE_TEXT) {
    return new Value(Value.TYPE_TEXT, value1.toString() + value2.toString());
  } else if (
    value1.type === Value.TYPE_DECIMAL &&
    value2.type === Value.TYPE_DECIMAL
  ) {
    return new Value(Value.TYPE_DECIMAL, value1.decimal.plus(value2.decimal));
  } else {
    throw new ValueTypeError(
      `invalid addend types: ${value1.type} + ${value2.type}`
    );
  }
}

export function subtractValues(value1, value2) {
  if (value1.type === Value.TYPE_TEXT) {
    const string2 = value2.toString();
    const string1 = value1.text;
    // String subtraction doesn't make sense, but why not
    const occurrence = string1.lastIndexOf(string2);
    const difference =
      occurrence >= 0
        ? string1.slice(0, occurrence) +
          string1.slice(occurrence + string2.length)
        : value1;
    return new Value(Value.TYPE_TEXT, difference);
  } else if (
    value1.type === Value.TYPE_DECIMAL &&
    value2.type === Value.TYPE_DECIMAL
  ) {
    return new Value(Value.TYPE_DECIMAL, value1.decimal.minus(value2.decimal));
  } else {
    throw new ValueTypeError(
      `invalid subtraction types: ${value1.type} - ${value2.type}`
    );
  }
}

export function multiplyValues(value1, value2) {
  if (value1.type === Value.TYPE_TEXT && value2.type === Value.TYPE_DECIMAL) {
    const product = Array.from(
      { length: value2.decimal.toNumber() },
      () => value1.text
    ).join("");
    return new Value(Value.TYPE_TEXT, product);
  } else if (
    value1.type === Value.TYPE_TEXT &&
    value2.type === Value.TYPE_DECIMAL
  ) {
    return multiplyValues(value2, value1);
  } else if (
    value1.type === Value.TYPE_DECIMAL &&
    value2.type === Value.TYPE_DECIMAL
  ) {
    return new Value(Value.TYPE_DECIMAL, value1.decimal.times(value2.decimal));
  } else {
    throw new ValueTypeError(
      `invalid multiplicand types: ${value1.type} * ${value2.type}`
    );
  }
}

export function divideValues(value1, value2) {
  if (
    value1.type === Value.TYPE_DECIMAL &&
    value2.type === Value.TYPE_DECIMAL
  ) {
    return new Value(
      Value.TYPE_DECIMAL,
      value1.decimal.dividedBy(value2.decimal)
    );
  } else {
    throw new ValueTypeError(
      `invalid division types: ${value1.type} / ${value2.type}`
    );
  }
}

export function toDecimalValue(value) {
  if (value.type === Value.TYPE_DECIMAL) {
    return value;
  } else if (value.type === Value.TYPE_TEXT) {
    const decimal = stringToDecimal(value.text);
    return new Value(Value.TYPE_DECIMAL, decimal);
  } else {
    throw new ValueTypeError(`invalid type: ${value.type}`);
  }
}

export function negateValue(value) {
  if (value.type === Value.TYPE_DECIMAL) {
    return new Value(Value.TYPE_DECIMAL, value.decimal.negated());
  } else if (value.type === Value.TYPE_TEXT) {
    const decimal = stringToDecimal(value.text);
    return new Value(Value.TYPE_DECIMAL, decimal.negated());
  } else {
    throw new ValueTypeError(`invalid type: ${value.type}`);
  }
}

function stringToDecimal(string) {
  try {
    const decimal = new Decimal(string);
    if (decimal.isNaN()) {
      throw null;
    }
    return decimal;
  } catch (e) {
    throw new ValueTypeError(`text is not numeric: ${string}`);
  }
}
