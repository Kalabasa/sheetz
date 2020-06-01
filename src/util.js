export function range(from, to) {
  var elements = to - from + 1;
  return [...Array(elements)].map((_, i) => (i += from));
}

export function array2D(rows, columns, value) {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: columns }, () => value)
  );
}

export function map2D(array, func) {
  return array.map((subArray, i) =>
    subArray.map((value, j) => func(value, i, j, array))
  );
}

// 0 -> A, 1 -> B, ...
export function columnToName(column) {
  let name = "";
  do {
    const remainder = column % 26;
    name += String.fromCharCode(65 + remainder);
    column = Math.floor(column / 26);
  } while (column > 0);
  return name;
}
