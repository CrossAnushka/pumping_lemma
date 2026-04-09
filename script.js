let currentLanguage = 'anbn';
let currentN = 3;
let baseArray = [];
let selectionStart = -1;
let selectionEnd = -1;
let pumpCount = 1;

let isDragging = false;
let dragStartIndex = -1;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('generateBtn').addEventListener('click', generateBaseString);

  document.getElementById('languageSelect').addEventListener('change', (e) => {
    const val = e.target.value;
    const isCustomRegex = val === 'custom';
    const isCustomFormal = val === 'customFormal';
    const hasM = val === 'anbm';
    document.getElementById('lengthControl').style.display = isCustomRegex ? 'none' : 'flex';
    document.getElementById('lengthControlM').style.display = hasM ? 'flex' : 'none';
    document.getElementById('customControl').style.display = isCustomRegex ? 'flex' : 'none';
    document.getElementById('customRegexControl').style.display = isCustomRegex ? 'flex' : 'none';
    document.getElementById('customFormalControl').style.display = isCustomFormal ? 'flex' : 'none';
  });

  document.getElementById('lengthSlider').addEventListener('input', (e) => {
    document.getElementById('lengthValue').textContent = e.target.value;
    if (document.getElementById('languageSelect').value === 'customFormal') {
      generateBaseString();
    }
  });

  document.getElementById('lengthSliderM').addEventListener('input', (e) => {
    document.getElementById('lengthValueM').textContent = e.target.value;
    if (document.getElementById('languageSelect').value === 'customFormal') {
      generateBaseString();
    }
  });

  document.getElementById('customInput').addEventListener('input', generateBaseString);
  document.getElementById('customFormalInput').addEventListener('input', () => {
    if (document.getElementById('languageSelect').value === 'customFormal') {
      generateBaseString();
    }
  });
  document.getElementById('customRegex').addEventListener('input', () => {
    if (document.getElementById('languageSelect').value === 'custom') {
      let regexPattern = document.getElementById('customRegex').value || '(a+b)*a';
      document.getElementById('targetLangDisplay').textContent = '/' + regexPattern + '/';
      validateString();
    }
  });

  const container = document.getElementById('stringContainer');

  container.addEventListener('mousedown', (e) => {
    if (pumpCount !== 1) {
      pumpCount = 1;
      updatePumpDisplay();
      renderPumpedString();
    }

    const charBlock = e.target.closest('.char-block');
    if (charBlock) {
      isDragging = true;
      dragStartIndex = parseInt(charBlock.dataset.index);
      selectionStart = dragStartIndex;
      selectionEnd = dragStartIndex;
      renderClassesOnly();
    }
    e.preventDefault();
  });

  container.addEventListener('mouseover', (e) => {
    if (isDragging) {
      const charBlock = e.target.closest('.char-block');
      if (charBlock) {
        const idx = parseInt(charBlock.dataset.index);
        selectionStart = Math.min(dragStartIndex, idx);
        selectionEnd = Math.max(dragStartIndex, idx);
        renderClassesOnly();
      }
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      if (selectionStart !== -1 && selectionEnd !== -1) {
        enableActions();
        validateString();
      }
    }
  });

  document.getElementById('pumpBtn').addEventListener('click', () => {
    pumpCount++;
    updatePumpDisplay();
    renderPumpedString();
    validateString();
  });

  document.getElementById('removeBtn').addEventListener('click', () => {
    pumpCount = 0;
    updatePumpDisplay();
    renderPumpedString();
    validateString();
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    pumpCount = 1;
    updatePumpDisplay();
    renderPumpedString();
    validateString();
  });
  document.getElementById('multiPumpBtn').addEventListener('click', analyzeAllPartitions);
  document.getElementById('closeModalBtn').addEventListener('click', () => {
    document.getElementById('multiPumpModal').style.display = 'none';
  });

  generateBaseString();
});

function generateBaseString() {
  currentLanguage = document.getElementById('languageSelect').value;

  let str = '';
  if (currentLanguage === 'anbn') {
    currentN = parseInt(document.getElementById('lengthSlider').value);
    document.getElementById('targetLangDisplay').textContent = 'aⁿ bⁿ';
    str = 'a'.repeat(currentN) + 'b'.repeat(currentN);
  } else if (currentLanguage === 'anbm') {
    currentN = parseInt(document.getElementById('lengthSlider').value);
    const currentM = parseInt(document.getElementById('lengthSliderM').value);
    document.getElementById('targetLangDisplay').textContent = 'aⁿ bᵐ';
    str = 'a'.repeat(currentN) + 'b'.repeat(currentM);
  } else if (currentLanguage === 'anb2n') {
    currentN = parseInt(document.getElementById('lengthSlider').value);
    document.getElementById('targetLangDisplay').textContent = 'aⁿ b²ⁿ';
    str = 'a'.repeat(currentN) + 'b'.repeat(2 * currentN);
  } else if (currentLanguage === 'anb3n') {
    currentN = parseInt(document.getElementById('lengthSlider').value);
    document.getElementById('targetLangDisplay').textContent = 'aⁿ b³ⁿ';
    str = 'a'.repeat(currentN) + 'b'.repeat(3 * currentN);
  } else if (currentLanguage === 'customFormal') {
    currentN = parseInt(document.getElementById('lengthSlider').value);
    const formula = document.getElementById('customFormalInput').value || 'a^n b^(2n)';
    document.getElementById('targetLangDisplay').textContent = formula;

    const tokens = parseFormalFormula(formula);
    str = '';
    let vMap = {};
    let otherIdx = 0;

    tokens.forEach(tok => {
      const vars = {};
      tok.variables.forEach(v => {
        if (v === 'n') vars[v] = currentN;
        else {
          if (!vMap[v]) { vMap[v] = Math.max(1, currentN - 1 - otherIdx); otherIdx++; }
          vars[v] = vMap[v];
        }
      });
      const val = Math.max(0, Math.round(evalMath(tok.expr, vars)) || 0);
      str += tok.char.repeat(val);
    });
  } else {
    let regexPattern = document.getElementById('customRegex').value || '(a+b)*a';
    document.getElementById('targetLangDisplay').textContent = '/' + regexPattern + '/';
    str = document.getElementById('customInput').value || 'aaba';
  }

  baseArray = str.split('');
  resetState();
}

function resetState() {
  selectionStart = -1;
  selectionEnd = -1;
  pumpCount = 1;
  updatePumpDisplay();

  document.getElementById('pumpBtn').disabled = true;
  document.getElementById('removeBtn').disabled = true;

  const badge = document.getElementById('statusBadge');
  badge.className = 'status-badge';
  badge.textContent = 'Select y to start';

  renderPumpedString();
  updateTheoremConditions(true);
  generateFormalProof(true);
}

function enableActions() {
  document.getElementById('pumpBtn').disabled = false;
  document.getElementById('removeBtn').disabled = false;
}

function updatePumpDisplay() {
  document.getElementById('pumpCountDisplay').textContent = pumpCount;
}

function renderClassesOnly() {
  const blocks = document.querySelectorAll('.char-block');
  blocks.forEach(block => {
    const i = parseInt(block.dataset.index);
    block.className = 'char-block';
    if (selectionStart !== -1) {
      if (i < selectionStart) {
        block.classList.add('x-part');
      } else if (i >= selectionStart && i <= selectionEnd) {
        block.classList.add('y-part');
      } else {
        block.classList.add('z-part');
      }
    }
  });
}

function renderPumpedString() {
  const container = document.getElementById('stringContainer');
  container.innerHTML = '';
  let fullStr = '';

  if (baseArray.length === 0) return;

  if (selectionStart === -1) {
    baseArray.forEach((c, i) => {
      const el = document.createElement('div');
      el.className = 'char-block';
      el.textContent = c;
      el.dataset.index = i;
      container.appendChild(el);
      fullStr += c;
    });
  } else {
    // X
    baseArray.slice(0, selectionStart).forEach((c, i) => {
      const el = document.createElement('div');
      el.className = 'char-block x-part';
      el.textContent = c;
      el.dataset.index = i;
      container.appendChild(el);
      fullStr += c;
    });

    // Y pumped
    const yArr = baseArray.slice(selectionStart, selectionEnd + 1);
    for (let p = 0; p < pumpCount; p++) {
      yArr.forEach((c, i) => {
        const el = document.createElement('div');
        el.className = `char-block y-part ${p > 0 ? 'y-pumped' : ''}`;
        el.textContent = c;
        el.dataset.index = selectionStart + i; // So they refer back to Y core logic on click
        container.appendChild(el);
        fullStr += c;
      });
    }

    // Z
    baseArray.slice(selectionEnd + 1).forEach((c, i) => {
      const el = document.createElement('div');
      el.className = 'char-block z-part';
      el.textContent = c;
      el.dataset.index = selectionEnd + 1 + i;
      container.appendChild(el);
      fullStr += c;
    });
  }

  document.getElementById('stringLength').textContent = fullStr.length;
}

function validateString() {
  if (selectionStart === -1) return;

  let fullStr = '';
  const x = baseArray.slice(0, selectionStart).join('');
  const y = baseArray.slice(selectionStart, selectionEnd + 1).join('');
  const z = baseArray.slice(selectionEnd + 1).join('');

  fullStr = x + y.repeat(pumpCount) + z;

  let isValid = false;
  if (currentLanguage === 'anbn') {
    isValid = checkAnBn(fullStr);
  } else if (currentLanguage === 'anbm') {
    isValid = checkAnBm(fullStr);
  } else if (currentLanguage === 'anb2n') {
    isValid = checkAnB2n(fullStr);
  } else if (currentLanguage === 'anb3n') {
    isValid = checkAnB3n(fullStr);
  } else if (currentLanguage === 'customFormal') {
    const formula = document.getElementById('customFormalInput').value || 'a^n b^(2n)';
    const tokens = parseFormalFormula(formula);
    isValid = checkCustomFormal(fullStr, tokens);
  } else {
    try {
      let pattern = document.getElementById('customRegex').value || '(a+b)*a';
      pattern = pattern.replace(/\+/g, (match, offset, str) => {
        if (offset === str.length - 1) return '+';
        const nextChar = str[offset + 1];
        if (nextChar === ')' || nextChar === '*' || nextChar === '+' || nextChar === '?') return '+';
        return '|';
      });
      pattern = pattern.replace(/^\^/, '').replace(/\$$/, '');
      const regex = new RegExp(`^(?:${pattern})$`);
      isValid = regex.test(fullStr);
    } catch (e) {
      isValid = false;
    }
  }

  const badge = document.getElementById('statusBadge');
  if (isValid) {
    badge.textContent = 'Still in Language';
    badge.className = 'status-badge success';
  } else {
    badge.textContent = 'Not in Language';
    badge.className = 'status-badge error';
  }

  updateTheoremConditions(isValid);
  generateFormalProof(isValid);
}

function checkAnBn(str) {
  if (str.length === 0) return false;
  const match = str.match(/^(a+)(b+)$/);
  if (!match) return false;
  return match[1].length === match[2].length;
}

function checkAnBm(str) {
  if (str.length === 0) return false;
  return /^(a+)(b+)$/.test(str);
}

function checkAnB2n(str) {
  if (str.length === 0) return false;
  const match = str.match(/^(a+)(b+)$/);
  if (!match) return false;
  return match[2].length === 2 * match[1].length;
}

function checkAnB3n(str) {
  if (str.length === 0) return false;
  const match = str.match(/^(a+)(b+)$/);
  if (!match) return false;
  return match[2].length === 3 * match[1].length;
}

function parseFormalFormula(formula) {
  const clean = formula.replace(/\s+/g, '');
  const regex = /([a-zA-Z0-9])\^(?:([^()\s]+)|\(([^()]+)\))/g;
  let tokens = [];
  let match;
  while ((match = regex.exec(clean)) !== null) {
    const char = match[1];
    const expr = (match[2] || match[3]);
    const vars = expr.match(/[a-zA-Z]+/g) || [];
    const uniqueVars = [...new Set(vars)];
    tokens.push({ char, expr, variables: uniqueVars });
  }
  return tokens;
}

function evalMath(expr, vars) {
  let code = expr.replace(/\^/g, '**');
  code = code.replace(/(\d)([a-zA-Z])/g, '$1*$2');
  code = code.replace(/[^a-zA-Z0-9+\-*/().]/g, '');
  Object.keys(vars).forEach(v => {
    const rx = new RegExp(`\\b${v}\\b`, 'g');
    code = code.replace(rx, vars[v]);
  });
  try {
    return Function(`"use strict"; return (${code})`)();
  } catch (e) {
    return null;
  }
}

function checkCustomFormal(str, tokens) {
  if (tokens.length === 0) return false;
  let regexStr = '^';
  tokens.forEach(tok => regexStr += `(${tok.char}*)`);
  regexStr += '$';

  const match = str.match(new RegExp(regexStr));
  if (!match) return false;

  const counts = tokens.map((_, i) => match[i + 1].length);
  const maxCount = Math.max(200, ...counts);

  const allVars = [];
  tokens.forEach(t => t.variables.forEach(v => {
    if (!allVars.includes(v)) allVars.push(v);
  }));

  if (allVars.length === 0) {
    return tokens.every((tok, i) => Math.max(0, Math.round(evalMath(tok.expr, {})) || 0) === counts[i]);
  } else if (allVars.length === 1) {
    const v1 = allVars[0];
    for (let i = 1; i <= maxCount + 10; i++) {
      let valid = true;
      for (let t = 0; t < tokens.length; t++) {
        if (Math.max(0, Math.round(evalMath(tokens[t].expr, { [v1]: i })) || 0) !== counts[t]) {
          valid = false;
          break;
        }
      }
      if (valid) return true;
    }
    return false;
  } else if (allVars.length === 2) {
    const v1 = allVars[0], v2 = allVars[1];
    for (let i = 1; i <= Math.min(100, maxCount + 10); i++) {
      for (let j = 1; j <= Math.min(100, maxCount + 10); j++) {
        let valid = true;
        for (let t = 0; t < tokens.length; t++) {
          if (Math.max(0, Math.round(evalMath(tokens[t].expr, { [v1]: i, [v2]: j })) || 0) !== counts[t]) {
            valid = false;
            break;
          }
        }
        if (valid) return true;
      }
    }
    return false;
  }
  return false;
}

function updateTheoremConditions(isValid) {
  const cond1 = document.getElementById('cond1');
  const cond2 = document.getElementById('cond2');
  const cond3 = document.getElementById('cond3');

  if (!cond1 || !cond2 || !cond3) return;

  if (selectionStart === -1 || selectionEnd === -1) {
    cond1.className = '';
    cond2.className = '';
    cond3.className = '';
    return;
  }

  const xyLen = selectionEnd + 1;
  const yLen = selectionEnd - selectionStart + 1;

  cond1.className = xyLen <= currentN ? 'condition-pass' : 'condition-fail';
  cond2.className = yLen > 0 ? 'condition-pass' : 'condition-fail';
  cond3.className = isValid ? 'condition-pass' : 'condition-fail';
}

function generateFormalProof(isValid) {
  const proofBox = document.getElementById('proofText');
  if (!proofBox) return;

  if (selectionStart === -1) {
    proofBox.innerHTML = 'Select a substring <span class="y-label">y</span> to generate the proof.';
    proofBox.className = 'proof-text';
    document.querySelectorAll('.active-x, .active-y, .active-z').forEach(el => {
      el.classList.remove('active-x', 'active-y', 'active-z');
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = null;
    });
    return;
  }

  const w = baseArray.join('');
  const x = baseArray.slice(0, selectionStart).join('');
  const y = baseArray.slice(selectionStart, selectionEnd + 1).join('');
  const z = baseArray.slice(selectionEnd + 1).join('');
  const pumpedStr = x + y.repeat(pumpCount) + z;

  let proofHTML = `
    Let <span class="proof-var">p</span> be the pumping length. We select string <span class="proof-var">w</span> = <span class="proof-string">${w}</span>.<br><br>
    The partition chosen is:<br>
    <span class="proof-var">x</span> = <span class="proof-string">${x || 'ε'}</span><br>
    <span class="proof-var">y</span> = <span class="proof-string">${y}</span><br>
    <span class="proof-var">z</span> = <span class="proof-string">${z || 'ε'}</span><br><br>
    By pumping <span class="proof-var">i = ${pumpCount}</span>, we generate string <span class="proof-var">w'</span> = xy<sup style="font-size:0.7em">${pumpCount}</sup>z = <span class="proof-string">${pumpedStr}</span>.<br><br>
  `;

  if (isValid) {
    proofHTML += `Because <span class="proof-var">w'</span> respects the target language structure, <span class="proof-var">w' ∈ L</span>. The lemma holds for this partition and pump count.`;
  } else {
    proofHTML += `Because <span class="proof-var">w'</span> breaks the structural constraints of the language, <span class="proof-var">w' ∉ L</span>.<br><br>
    This contradicts the Pumping Lemma! Therefore, the language is proved to be <strong>Not Regular</strong>.`;
  }

  proofBox.innerHTML = proofHTML;
  proofBox.className = 'proof-text proof-text-active';

  animateDFA(pumpCount);
}

function animateDFA(pumps) {
  document.querySelectorAll('.active-x, .active-y, .active-z').forEach(el => {
    el.classList.remove('active-x', 'active-y', 'active-z');
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = null;
  });

  if (selectionStart === -1) return;

  const nodeStart = document.querySelector('.node-start');
  const nodeLoopStart = document.querySelector('.node-loop-start');
  const nodeLoopEnd = document.querySelector('.node-loop-end');
  const nodeEnd = document.querySelector('.node-end');
  const edgeX = document.querySelector('.edge-x');
  const edgeY = document.querySelector('.edge-y');
  const edgeZ = document.querySelector('.edge-z');

  if (!nodeStart) return;

  nodeStart.classList.add('active-x');
  edgeX.classList.add('active-x');
  nodeLoopStart.classList.add('active-x');

  setTimeout(() => {
    if (pumps > 0) {
      edgeY.classList.add('active-y');
      nodeLoopEnd.classList.add('active-y');
      nodeLoopEnd.style.animationIterationCount = Math.min(3, pumps);
    }
  }, 300);

  setTimeout(() => {
    edgeZ.classList.add('active-z');
    nodeEnd.classList.add('active-z');
  }, 700);
}

function analyzeAllPartitions() {
  const modal = document.getElementById('multiPumpModal');
  const tbody = document.getElementById('matrixBody');
  const pValueDisplay = document.getElementById('matrixPValue');
  const matrixPumpCount = document.getElementById('matrixPumpCount');
  const conclusion = document.getElementById('matrixConclusion');
  
  const isRegex = document.getElementById('languageSelect').value === 'custom';
  const p = isRegex ? baseArray.length : currentN;
  
  pValueDisplay.textContent = p;
  matrixPumpCount.textContent = pumpCount;
  
  tbody.innerHTML = '';
  
  let validConfigurations = 0;
  let brokenConfigurations = 0;
  
  const maxXY = Math.min(p, baseArray.length);
  
  if (maxXY === 0) {
    alert("Please generate a valid target string first.");
    return;
  }
  
  for (let xyLen = 1; xyLen <= maxXY; xyLen++) {
    for (let yLen = 1; yLen <= xyLen; yLen++) {
      const xLen = xyLen - yLen;
      
      const x = baseArray.slice(0, xLen).join('');
      const y = baseArray.slice(xLen, xyLen).join('');
      const z = baseArray.slice(xyLen).join('');
      
      const pumpedStr = x + y.repeat(pumpCount) + z;
      
      let isValid = false;
      const lang = document.getElementById('languageSelect').value;
      if (lang === 'anbn') isValid = checkAnBn(pumpedStr);
      else if (lang === 'anbm') isValid = checkAnBm(pumpedStr);
      else if (lang === 'anb2n') isValid = checkAnB2n(pumpedStr);
      else if (lang === 'anb3n') isValid = checkAnB3n(pumpedStr);
      else if (lang === 'customFormal') {
        const formula = document.getElementById('customFormalInput').value || 'a^n b^(2n)';
        isValid = checkCustomFormal(pumpedStr, parseFormalFormula(formula));
      } else {
        try {
          let pattern = document.getElementById('customRegex').value || '(a+b)*a';
          pattern = pattern.replace(/\+/g, (m, offset, str) => {
            if (offset === str.length - 1) return '+';
            const nextChar = str[offset + 1];
            if (nextChar === ')' || nextChar === '*' || nextChar === '+' || nextChar === '?') return '+';
            return '|';
          });
          pattern = pattern.replace(/^\^/, '').replace(/\$$/, '');
          isValid = new RegExp(`^(?:${pattern})$`).test(pumpedStr);
        } catch(e) { isValid = false; }
      }
      
      if (isValid) validConfigurations++;
      else brokenConfigurations++;
      
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
      tr.innerHTML = `
        <td style="padding: 10px 12px; color: #cbd5e1;">${x || 'ε'}</td>
        <td style="padding: 10px 12px; color: #e8b2ff; font-weight: bold; background: rgba(232, 178, 255, 0.05);">${y}</td>
        <td style="padding: 10px 12px; color: #cbd5e1;">${z || 'ε'}</td>
        <td style="padding: 10px 12px; color: ${isValid ? '#93c5fd' : '#fca5a5'};">${pumpedStr}</td>
        <td style="padding: 10px 12px; text-align: center; font-size: 1.2rem;">${isValid ? '✅' : '❌'}</td>
      `;
      tbody.appendChild(tr);
    }
  }
  
  if (validConfigurations === 0) {
    conclusion.innerHTML = `<span style="color: #fca5a5;">At i=${pumpCount}, EVERY single valid partition breaks the rules! The language is proved to be NOT REGULAR.</span>`;
    conclusion.style.borderColor = 'rgba(239, 68, 68, 0.4)';
    conclusion.style.background = 'rgba(239, 68, 68, 0.15)';
  } else {
    conclusion.innerHTML = `<span style="color: #34d399;">At least one partition survived pumping at i=${pumpCount}. The language MIGHT be regular (or you need a different p / different i).</span>`;
    conclusion.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    conclusion.style.background = 'rgba(16, 185, 129, 0.15)';
  }
  
  modal.style.display = 'flex';
}
