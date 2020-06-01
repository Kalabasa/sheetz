<script>
  import { Value } from "./value.js";

  // string raw text input
  export let input;
  // Output
  export let output;

  $: derived = input.startsWith("=");

  let pointerIsPointing = false;

  function handlePointerOver(event) {
    pointerIsPointing = true;
  }

  function handlePointerOut(event) {
    pointerIsPointing = false;
  }
</script>

<style>
  .cell {
    --padding-x: 0.2rem;
    --padding-y: 0rem;
    position: relative;
    height: 1.5rem;
    line-height: 1.5rem;
  }

  .view {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    padding: var(--padding-y) var(--padding-x);
    white-space: nowrap;
    overflow: hidden;
  }

  .output {
    background: #fff;
    pointer-events: none;
  }

  .pointerIsPointing .output {
    --popup-padding: 0.4rem;
    height: calc(100% + 2 * var(--popup-padding));
    min-width: calc(100% + 2 * var(--popup-padding));
    width: auto;
    padding: calc(var(--padding-y) + var(--popup-padding))
      calc(var(--padding-x) + var(--popup-padding));
    border-radius: 0.2rem;
    box-shadow: 0 2px 20px #00000018, 0 2px 4px #00000022;
    z-index: 1;
    transform: translate(
      calc(-1 * var(--popup-padding)),
      calc(-1 * var(--popup-padding))
    );
  }

  .input {
    opacity: 0;
  }

  .cell:focus-within .input {
    opacity: 1;
  }
  .cell:focus-within .output {
    opacity: 0;
  }

  .output.decimal {
    font-family: "Inconsolata", monospace;
    text-align: right;
  }

  .output.derived {
    background: var(--formulaBackgroundColor);
  }

  .output.error {
    background: var(--errorBackgroundColor);
    color: #cc0000;
    border: solid 1px #cc0000;
  }
</style>

<div
  class="cell"
  class:pointerIsPointing
  title={output.value}
  on:pointerover={handlePointerOver}
  on:pointerout={handlePointerOut}>
  <div
    class="view output"
    class:derived
    class:text={output.value.type === Value.TYPE_TEXT}
    class:decimal={output.value.type === Value.TYPE_DECIMAL}
    class:error={output.error}>
    {@html output.value}
  </div>
  <div
    class="view input"
    contenteditable="true"
    on:focus
    bind:innerHTML={input} />
</div>
