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
    const isCustom = e.target.value === 'custom';
    document.getElementById('lengthControl').style.display = isCustom ? 'none' : 'flex';
    document.getElementById('customControl').style.display = isCustom ? 'flex' : 'none';
    document.getElementById('customRegexControl').style.display = isCustom ? 'flex' : 'none';
  });

  document.getElementById('lengthSlider').addEventListener('input', (e) => {
    document.getElementById('lengthValue').textContent = e.target.value;
  });

  document.getElementById('customInput').addEventListener('input', generateBaseString);
  document.getElementById('customRegex').addEventListener('input', () => {
    if (document.getElementById('languageSelect').value === 'custom') {
      let regexPattern = document.getElementById('customRegex').value || '(a+b)*b';
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
    document.getElementById('targetLangDisplay').textContent = 'aⁿ bᵐ';
    str = 'a'.repeat(currentN) + 'b'.repeat(Math.max(1, currentN - 1));
  } else {
    let regexPattern = document.getElementById('customRegex').value || '(a+b)*b';
    document.getElementById('targetLangDisplay').textContent = '/' + regexPattern + '/';
    str = document.getElementById('customInput').value || 'aab';
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
  } else {
    try {
      let pattern = document.getElementById('customRegex').value || '(a+b)*b';
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
