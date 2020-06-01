import { Output } from "./expression";

/**
 * Convert Error to sheet cell Output
 */
export function errorToOutput(error) {
  return new Output(`⚠️ ${error.message} [${error.constructor.name}]`, { error });
}

export function isSheetError(error) {
  return error instanceof SheetError
}

class SheetError extends Error {}
export class ExprReferenceError extends SheetError {}
export class ExprSyntaxError extends SheetError {}
export class ValueTypeError extends SheetError {}
