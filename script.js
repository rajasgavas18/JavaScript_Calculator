 (function() {
      const display = document.getElementById('display');
      const clearBtn = document.getElementById('clear');
      const backspaceBtn = document.getElementById('backspace');
      const equalsBtn = document.getElementById('equals');
      const buttons = document.querySelectorAll('button[data-number], button.operator');

      let currentInput = '';
      let calculatedResult = null;
      let resetNext = false;

      
      const baseFontSizePx = 58; 
      let currentFontSizePx = baseFontSizePx;
      const minFontSizePx = 24;
      const maxFontSizePx = baseFontSizePx;

      function updateDisplay(value) {
        display.textContent = value || '0';
        display.title = value || '0'; 
        adjustFontSize();
      }

      
      function adjustFontSize() {
        const parentWidth = display.clientWidth - 20;
        const tempSpan = document.createElement('span');
        tempSpan.style.position = 'absolute';
        tempSpan.style.visibility = 'hidden';
        tempSpan.style.whiteSpace = 'nowrap';
        tempSpan.style.fontFamily = window.getComputedStyle(display).fontFamily;
        tempSpan.style.fontWeight = window.getComputedStyle(display).fontWeight;
        document.body.appendChild(tempSpan);

        for (let size = maxFontSizePx; size >= minFontSizePx; size -= 1) {
          tempSpan.style.fontSize = size + 'px';
          tempSpan.textContent = display.textContent;
          if (tempSpan.offsetWidth <= parentWidth) {
            currentFontSizePx = size;
            break;
          }
        }
        display.style.fontSize = currentFontSizePx + 'px';
        document.body.removeChild(tempSpan);
      }

      function calculateExpression(expression) {
        try {
          let cleanExpr = expression.replace(/[^0-9+\-*/.]/g, '');
          if (/(\.\d*\.)/.test(cleanExpr)) return null;
          return new Function('return ' + cleanExpr)();
        } catch {
          return null;
        }
      }

      function addInput(value) {
        if (resetNext) {
          currentInput = '';
          resetNext = false;
        }

        if (value === '.') {
          const lastNumberMatch = currentInput.match(/(\d*\.\d*|\d+)$/);
          const lastNumber = lastNumberMatch ? lastNumberMatch[0] : '';
          if (lastNumber.includes('.')) return;
          if (currentInput === '' || /[+\-*/]$/.test(currentInput)) currentInput += '0';
        }

        if (['+', '-', '*', '/'].includes(value)) {
          if (currentInput === '') {
            if (value === '-') {
              currentInput = value;
              updateDisplay(currentInput);
              return;
            }
            return;
          }
          if (/[+\-*/]$/.test(currentInput)) {
            currentInput = currentInput.slice(0, -1) + value;
            updateDisplay(currentInput);
            return;
          }
        }

        currentInput += value;
        updateDisplay(currentInput);

        if (!isNaN(value) || value === '.') {
          const result = calculateExpression(currentInput);
          if (result !== null && result !== undefined && result !== '') {
            calculatedResult = result;
          }
        }
      }

      buttons.forEach(button => {
        button.addEventListener('click', () => {
          if (button.hasAttribute('data-number')) {
            addInput(button.getAttribute('data-number'));
          } else if (button.classList.contains('operator')) {
            addInput(button.getAttribute('data-operator'));
          }
        });
      });

      clearBtn.addEventListener('click', () => {
        currentInput = '';
        calculatedResult = null;
        updateDisplay('0');
        currentFontSizePx = baseFontSizePx;
        display.style.fontSize = currentFontSizePx + 'px';
      });

      backspaceBtn.addEventListener('click', () => {
        if (resetNext) {
          currentInput = '';
          updateDisplay('0');
          resetNext = false;
          currentFontSizePx = baseFontSizePx;
          display.style.fontSize = currentFontSizePx + 'px';
          return;
        }
        currentInput = currentInput.slice(0, -1);
        updateDisplay(currentInput || '0');
      });

      equalsBtn.addEventListener('click', () => {
        if (currentInput === '') return;
        const result = calculateExpression(currentInput);
        if (result !== null && result !== undefined && result !== '') {
          updateDisplay(result);
          currentInput = String(result);
          resetNext = true;
        } else {
          updateDisplay('Error');
          resetNext = true;
        }
      });

      
      display.addEventListener('wheel', (event) => {
        event.preventDefault();
        if (event.deltaY < 0) {
          currentFontSizePx = Math.min(currentFontSizePx + 2, maxFontSizePx);
        } else if (event.deltaY > 0) {
          currentFontSizePx = Math.max(currentFontSizePx - 2, minFontSizePx);
        }
        display.style.fontSize = currentFontSizePx + 'px';
      });

      window.addEventListener('keydown', (event) => {
        if (event.ctrlKey || event.metaKey || event.altKey) return;

        const key = event.key;

        if (key >= '0' && key <= '9') {
          addInput(key);
          event.preventDefault();
        } else if (key === '.') {
          addInput(key);
          event.preventDefault();
        } else if (key === '+' || key === '-' || key === '*' || key === '/') {
          addInput(key);
          event.preventDefault();
        } else if (key === 'Enter' || key === '=') {
          equalsBtn.click();
          event.preventDefault();
        } else if (key === 'Backspace') {
          backspaceBtn.click();
          event.preventDefault();
        } else if (key === 'Escape') {
          clearBtn.click();
          event.preventDefault();
        }
      });

      
      updateDisplay('0');
    })();