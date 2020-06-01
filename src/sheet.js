import { ExprReferenceError, isSheetError } from "./error.js";
import { Expression } from "./expression.js";
import { CellInput } from "./parse.js";
import { map2D } from "./util.js";

/**
 * Evaluate a table of inputs.
 * 
 * @param inputTable CellInput[][]
 */
export function evaluate(inputTable) {
  // initialize empty expressions, will change later
  const expressionsTable = map2D(
    inputTable,
    () => new Expression([], () => {})
  );

  const rows = inputTable.length;
  const columns = inputTable[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      express(inputTable[r][c], expressionsTable[r][c], expressionsTable);
    }
  }

  const outputTable = map2D(expressionsTable, (expr) => expr.output);

  return outputTable;
}

/**
 * Convert input to expression
 * 
 * @param input CellInput
 * @param expr Expression destination expression
 * @param expressionsTable Expresssion[][] expressions table for reference
 */
function express(input, expr, expressionsTable) {
  try {
    if (input.type === CellInput.TYPE_FORMULA) {
      const inputExpressions = input.formula.inputAddresses.map((address) =>
        index(expressionsTable, address)
      );

      if (inputExpressions.some((v) => v === undefined)) {
        throw new ExprReferenceError(
          `invalid reference: ${
            input.formula.inputAddresses[inputExpressions.indexOf(undefined)]
          }`
        );
      }

      expr.change(inputExpressions, input.formula.formulaFunc);
    } else if (input.type === CellInput.TYPE_LITERAL) {
      expr.change([], () => input.literal);
    } else if (input.type === CellInput.TYPE_ERROR) {
      throw input.error;
    }
  } catch (e) {
    if (isSheetError(e)) {
      expr.change([], () => {
        throw e;
      });
    } else {
      throw e;
    }
  }
}

// index cell by address. "A1" -> table[0][0]
function index(table, address) {
  const coords = address.match(/([A-Z]+)(\d+)/i);

  if (!coords) {
    return undefined;
  }

  const column = columnIndex(coords[1]);
  const row = parseInt(coords[2]) - 1;

  if (
    row < 0 ||
    row >= table.length ||
    column < 0 ||
    column >= table[0].length
  ) {
    return undefined;
  }

  return table[row][column];
}

// convert column name to index. "A" -> 0
function columnIndex(columnName) {
  columnName = columnName.toLowerCase();

  let index = 0;
  for (let i = columnName.length - 1; i >= 0; i--) {
    index *= 10;
    index += columnName.charCodeAt(i) - 97;
  }
  return index;
}
