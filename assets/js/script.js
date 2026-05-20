const exprEl = document.getElementById("expr");
const mainEl = document.getElementById("main");

const state = {
  current: "0",
  prev: null,
  operator: null,
  justCalc: false,
  waitingNew: false,
  expression: "",
  parenDepth: 0,
  parenExpr: "",
};

const fmt = (n) => {
  const s = parseFloat(n.toPrecision(10)).toString();
  return s.length > 12 ? n.toExponential(4) : s;
};

const setMain = (val, isErr = false) => {
  mainEl.textContent = val;
  mainEl.className = "display-main" + (isErr ? " error" : "");
};

const setExpr = (txt) => {
  exprEl.textContent = txt;
};

const opMap = { "÷": "/", "×": "*", "−": "-", "+": "+" };

function compute() {
  if (state.prev === null || state.operator === null) return;
  const a = parseFloat(state.prev);
  const b = parseFloat(state.current);
  const op = opMap[state.operator];
  if (op === "/" && b === 0) {
    setMain("Erro: ÷ por 0", true);
    state.current = "0";
    state.prev = null;
    state.operator = null;
    state.waitingNew = false;
    setExpr("");
    clearActiveOp();
    return;
  }
  const result =
    op === "/" ? a / b : op === "*" ? a * b : op === "-" ? a - b : a + b;
  state.expression = `${fmt(a)} ${state.operator} ${fmt(b)} =`;
  setExpr(state.expression);
  state.current = fmt(result);
  state.prev = null;
  state.operator = null;
  state.justCalc = true;
  state.waitingNew = false;
  setMain(state.current);
  clearActiveOp();
}

function handleDigit(d) {
  if (state.waitingNew) {
    state.current = d === "0" ? "0" : d;
    state.waitingNew = false;
  } else if (state.justCalc) {
    state.current = d === "0" ? "0" : d;
    state.justCalc = false;
  } else if (state.current === "0" && d !== ".") {
    state.current = d;
  } else if (state.current.length < 12) {
    state.current += d;
  }
  setMain(state.current);
  if (state.operator) setExpr(`${state.prev} ${state.operator}`);
}

function handleDot() {
  if (state.waitingNew) {
    state.current = "0.";
    state.waitingNew = false;
    setMain(state.current);
    return;
  }
  if (state.justCalc) {
    state.current = "0.";
    state.justCalc = false;
  } else if (!state.current.includes(".")) state.current += ".";
  setMain(state.current);
}

function handleOp(op) {
  if (state.operator && !state.waitingNew) compute();
  state.prev = state.current;
  state.operator = op;
  state.justCalc = false;
  state.waitingNew = true;
  setExpr(`${state.prev} ${op}`);
  setActiveOp(op);
}

function handleClear() {
  state.current = "0";
  state.prev = null;
  state.operator = null;
  state.justCalc = false;
  state.waitingNew = false;
  state.expression = "";
  state.parenDepth = 0;
  state.parenExpr = "";
  setMain("0");
  setExpr("");
  clearActiveOp();
}

function handleSign() {
  if (state.current === "0") return;
  state.current = fmt(parseFloat(state.current) * -1);
  setMain(state.current);
}

function handlePercent() {
  state.current = fmt(parseFloat(state.current) / 100);
  setMain(state.current);
}

function handleBackspace() {
  if (state.waitingNew || state.justCalc) return;
  if (
    state.current.length <= 1 ||
    (state.current.length === 2 && state.current[0] === "-")
  ) {
    state.current = "0";
  } else {
    state.current = state.current.slice(0, -1);
  }
  setMain(state.current);
}

function handleParenOpen() {
  state.parenDepth++;
  const prefix = state.parenExpr ? state.parenExpr + " × " : "";
  state.parenExpr = prefix + "(";
  state.prev = state.current;
  state.operator = "×";
  state.waitingNew = true;
  setExpr(state.parenExpr);
}

function handleParenClose() {
  if (state.parenDepth <= 0) return;
  state.parenDepth--;
  if (state.operator && state.prev !== null) compute();
  state.parenExpr = "";
  setExpr(state.expression || "");
}

function setActiveOp(op) {
  clearActiveOp();
  const btn = document.querySelector(`.btn-op[data-op="${op}"]`);
  if (btn) btn.classList.add("active");
}

function clearActiveOp() {
  document
    .querySelectorAll(".btn-op.active")
    .forEach((b) => b.classList.remove("active"));
}

document.querySelector(".grid").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const { digit, action, op } = btn.dataset;
  if (digit !== undefined) handleDigit(digit);
  else if (op) handleOp(op);
  else if (action === "dot") handleDot();
  else if (action === "equals") compute();
  else if (action === "clear") handleClear();
  else if (action === "sign") handleSign();
  else if (action === "percent") handlePercent();
  else if (action === "back") handleBackspace();
  else if (action === "paren-open") handleParenOpen();
  else if (action === "paren-close") handleParenClose();
});

document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") handleDigit(e.key);
  else if (e.key === ".") handleDot();
  else if (e.key === "+") handleOp("+");
  else if (e.key === "-") handleOp("−");
  else if (e.key === "*") handleOp("×");
  else if (e.key === "/") {
    e.preventDefault();
    handleOp("÷");
  } else if (e.key === "Enter" || e.key === "=") compute();
  else if (e.key === "Escape" || e.key === "c") handleClear();
  else if (e.key === "Backspace") handleBackspace();
  else if (e.key === "(") handleParenOpen();
  else if (e.key === ")") handleParenClose();
});
