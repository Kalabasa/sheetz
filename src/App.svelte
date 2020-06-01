<script>
  import { array2D, map2D, columnToName, range } from "./util.js";
  import { demo } from "./demo.js";
  import { evaluate } from "./sheet.js";
  import { parseCellInput } from "./parse.js";
  import Cell from "./Cell.svelte";

  const columns = 10;
  const rows = 10;

  let focusCoords = { row: 0, column: 0 };
  $: focusAddress = `${columnToName(focusCoords.column)}${focusCoords.row + 1}`;

  let textTable = array2D(rows, columns, "");
  demo(textTable);
  $: inputTable = map2D(textTable, parseCellInput);
  $: outputTable = evaluate(inputTable);
</script>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Inconsolata&family=Source+Sans+Pro:ital,wght@0,400;0,700;1,400;1,700&display=swap");

  :root {
    --cellBorderColor: #e6e6e6;
    --formulaBackgroundColor: #e7f8ff;
    --errorBackgroundColor: #ffecec;
  }

  :global(*) {
    box-sizing: border-box;
  }

  main {
    font-family: "Source Sans Pro", sans-serif;
    font-size: 12pt;
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 100%;
    min-height: 100%;
  }

  .frame {
    width: 60rem;
  }

  .heading {
    font-size: 110%;
  }

  .focus-bar {
    display: flex;
    align-items: stretch;
    margin-bottom: 1rem;
  }

  .focus-address {
    display: flex;
    align-items: center;
  }

  .focus-input {
    flex: 1;
    margin: 0;
    border: solid 1px var(--cellBorderColor);
    border-left-width: 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
  }

  .focus-address,
  .table-label {
    font-weight: bold;
    font-size: 85%;
    padding: 0.2rem 0.4rem;
    vertical-align: middle;
    color: #555;
    border: solid 1px var(--cellBorderColor);
    background: #f6f6f6;
  }
  .row-label {
    width: 0px;
    text-align: right;
  }
  .column-label {
    text-align: center;
  }
  .table-cell {
    width: 100px;
    border: solid 1px var(--cellBorderColor);
  }
</style>

<main>
  <div class="frame">
    <h1 class="heading">svelte spreadsheet</h1>
    <div class="focus-bar">
      <span class="focus-address">{focusAddress}</span>
      <input
        class="focus-input"
        type="text"
        bind:value={textTable[focusCoords.row][focusCoords.column]} />
    </div>
    <table>
      <tr>
        <td />
        {#each range(1, columns) as c}
          <th class="table-label column-label">{columnToName(c - 1)}</th>
        {/each}
      </tr>
      {#each range(1, rows) as r}
        <tr>
          <th class="table-label row-label">{r}</th>
          {#each range(1, columns) as c}
            <td class="table-cell">
              <Cell
                bind:input={textTable[r - 1][c - 1]}
                bind:output={outputTable[r - 1][c - 1]}
                on:focus={() => (focusCoords = { row: r - 1, column: c - 1 })} />
            </td>
          {/each}
        </tr>
      {/each}
    </table>
  </div>
</main>
