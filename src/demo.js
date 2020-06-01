export function demo(textTable) {
  textTable[0][0] = "=A2 + A3";
  textTable[2][0] = "120";
  textTable[1][0] = "22";
  textTable[0][1] = "=(A1 * 2.2 - A2) / 2";
  textTable[4][2] = "Hello";
  textTable[4][3] = "World";
  textTable[4][4] = '=C5 + ", " + D5 + "!"';
  textTable[2][3] = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
}
