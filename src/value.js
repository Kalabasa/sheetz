/**
 * Represents a basic value with units.
 */
export class Value {
  constructor(type, value) {
    // Value.TYPE_*
    this._type = type;
    // depends on type
    this._value = value;
  }

  get type() {
    return this._type;
  }

  get text() {
    if (this._type !== Value.TYPE_TEXT)
      throw new Error("illegal getter");
    return this._value;
  }

  get decimal() {
    if (this._type !== Value.TYPE_DECIMAL)
      throw new Error("illegal getter");
    return this._value;
  }

  toString() {
    return this._value.toString();
  }
}

// _value: string
Value.TYPE_TEXT = 'text';
// _value: Decimal
Value.TYPE_DECIMAL = 'decimal';
