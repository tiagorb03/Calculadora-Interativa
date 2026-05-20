const exprEl = document.getElementById('expr');
  const mainEl = document.getElementById('main');

  const state = {
    current:   '0',
    prev:      null,
    operator:  null,
    justCalc:  false,
    expression: '',
  };

  const fmt = n => {
    const s = parseFloat(n.toPrecision(10)).toString();
    return s.length > 12 ? n.toExponential(4) : s;
  };

  const setMain = (val, isErr = false) => {
    mainEl.textContent = val;
    mainEl.className = 'display-main' + (isErr ? ' error' : '');
  };

  const setExpr = txt => { exprEl.textContent = txt; };

  const opMap = { '÷': '/', '×': '*', '−': '-', '+': '+' };

  function compute() {
    if (state.prev === null || state.operator === null) return;
    const a = parseFloat(state.prev);
    const b = parseFloat(state.current);
    const op = opMap[state.operator];
    if (op === '/' && b === 0) { setMain('Erro: ÷ por 0', true); state.current = '0'; state.prev = null; state.operator = null; setExpr(''); return; }
    const result = op === '/' ? a / b : op === '*' ? a * b : op === '-' ? a - b : a + b;
    state.expression = `${fmt(a)} ${state.operator} ${fmt(b)} =`;
    setExpr(state.expression);
    state.current = fmt(result);
    state.prev = null;
    state.operator = null;
    state.justCalc = true;
    setMain(state.current);
  }

  function handleDigit(d) {
    if (state.justCalc) { state.current = d === '0' ? '0' : d; state.justCalc = false; }
    else if (state.current === '0' && d !== '.') state.current = d;
    else if (state.current.length < 12) state.current += d;
    setMain(state.current);
    if (state.operator) setExpr(`${state.prev} ${state.operator}`);
  }

  function handleDot() {
    if (state.justCalc) { state.current = '0.'; state.justCalc = false; }
    else if (!state.current.includes('.')) state.current += '.';
    setMain(state.current);
  }

  function handleOp(op) {
    if (state.operator && !state.justCalc) compute();
    state.prev = state.current;
    state.operator = op;
    state.justCalc = false;
    setExpr(`${state.prev} ${op}`);
  }

  function handleClear() {
    state.current = '0'; state.prev = null; state.operator = null; state.justCalc = false; state.expression = '';
    setMain('0'); setExpr('');
  }

  function handleSign() {
    state.current = fmt(parseFloat(state.current) * -1);
    setMain(state.current);
  }

  function handlePercent() {
    state.current = fmt(parseFloat(state.current) / 100);
    setMain(state.current);
  }

  document.querySelector('.grid').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const { digit, action, op } = btn.dataset;

    if (digit !== undefined) handleDigit(digit);
    else if (op)             handleOp(op);
    else if (action === 'dot')     handleDot();
    else if (action === 'equals')  compute();
    else if (action === 'clear')   handleClear();
    else if (action === 'sign')    handleSign();
    else if (action === 'percent') handlePercent();
  });

  // Keyboard support
  document.addEventListener('keydown', e => {
    if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
    else if (e.key === '.') handleDot();
    else if (e.key === '+') handleOp('+');
    else if (e.key === '-') handleOp('−');
    else if (e.key === '*') handleOp('×');
    else if (e.key === '/') { e.preventDefault(); handleOp('÷'); }
    else if (e.key === 'Enter' || e.key === '=') compute();
    else if (e.key === 'Escape' || e.key === 'c') handleClear();
    else if (e.key === 'Backspace') {
      if (state.current.length > 1) state.current = state.current.slice(0, -1);
      else state.current = '0';
      setMain(state.current);
    }
  });