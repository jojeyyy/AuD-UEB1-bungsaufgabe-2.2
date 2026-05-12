document.addEventListener('DOMContentLoaded', () => {
    const arrayInput = document.getElementById('array-input');
    const btnReset = document.getElementById('btn-reset');
    const btnStep = document.getElementById('btn-step');
    const btnPlay = document.getElementById('btn-play');
    
    const arrayContainer = document.getElementById('array-container');
    const varN = document.getElementById('var-n');
    const varI = document.getElementById('var-i');
    const varFound = document.getElementById('var-found');
    const eopCountEl = document.getElementById('eop-count');
    const eopLog = document.getElementById('eop-log');

    let arr = [];
    let n = 0;
    let i = 0;
    let found = 0;
    let eopTotal = 0;
    let cachedNMinus2 = false;
    
    // State machine
    let currentState = 'INIT'; 
    let playInterval = null;

    function parseArray() {
        const val = arrayInput.value;
        const parsed = val.split(',').map(x => parseInt(x.trim(), 10)).filter(x => !isNaN(x));
        return parsed.length > 0 ? parsed : [5, 3, 4, 1, 8, 2];
    }

    function renderArray(highlightIndex1 = -1, highlightIndex2 = -1) {
        arrayContainer.innerHTML = '';
        arr.forEach((val, idx) => {
            const div = document.createElement('div');
            div.className = 'array-item';
            div.textContent = val;
            div.setAttribute('data-index', idx);
            if (idx === highlightIndex1) div.classList.add('highlight-1');
            if (idx === highlightIndex2) div.classList.add('highlight-2');
            arrayContainer.appendChild(div);
        });
    }

    function updateVars() {
        varN.textContent = n;
        varI.textContent = currentState === 'INIT' || currentState === 'LINE_3' ? '-' : i;
        varFound.textContent = currentState === 'INIT' ? '-' : found;
    }

    function addLog(message, cost) {
        if (cost > 0) {
            eopTotal += cost;
            eopCountEl.textContent = eopTotal;
        }
        
        const li = document.createElement('li');
        li.innerHTML = `<span>${message}</span> <span class="cost">+${cost} EOP</span>`;
        if (cost === 0) {
            li.querySelector('.cost').style.color = "var(--text-muted)";
            li.querySelector('.cost').style.background = "transparent";
            li.querySelector('.cost').style.fontWeight = "normal";
        }
        eopLog.appendChild(li);
        eopLog.scrollTop = eopLog.scrollHeight;
    }

    function highlightLine(lineNum) {
        document.querySelectorAll('pre span').forEach(el => el.classList.remove('active'));
        if (lineNum > 0) {
            const line = document.getElementById(`line-${lineNum}`);
            if (line) line.classList.add('active');
        }
    }

    function reset() {
        arr = parseArray();
        n = arr.length;
        i = 0;
        found = 0;
        eopTotal = 0;
        cachedNMinus2 = false;
        currentState = 'LINE_3';
        
        eopCountEl.textContent = '0';
        eopLog.innerHTML = '';
        
        renderArray();
        updateVars();
        highlightLine(3);
        
        btnStep.disabled = false;
        if (playInterval) {
            clearInterval(playInterval);
            playInterval = null;
            btnPlay.textContent = "Auto Play";
            btnPlay.classList.replace('secondary', 'success');
        }
    }

    function step() {
        if (currentState === 'DONE') return;

        switch (currentState) {
            case 'LINE_3':
                found = 0;
                addLog("<code>int found = 0;</code> (1 Zuweisung)", 1);
                updateVars();
                currentState = 'LINE_4_INIT';
                highlightLine(4);
                break;
                
            case 'LINE_4_INIT':
                i = 0;
                addLog("<code>int i = 0;</code> (1 Zuweisung)", 1);
                updateVars();
                currentState = 'LINE_4_COND';
                highlightLine(4);
                break;

            case 'LINE_4_COND':
                if (!cachedNMinus2) {
                    addLog("Berechne und cache <code>n - 2</code> einmalig (1 Arithm.)", 1);
                    cachedNMinus2 = true;
                }
                
                addLog(`Prüfe Bedingung <code>i < n - 2</code> (${i} < ${n-2}) (1 Vergleich)`, 1);
                
                if (i < n - 2) {
                    currentState = 'LINE_6';
                    highlightLine(6);
                    renderArray(i, i + 2);
                } else {
                    currentState = 'LINE_11';
                    highlightLine(11);
                    renderArray(); // Remove highlight
                }
                break;

            case 'LINE_6':
                addLog(`Berechne <code>i + 2</code> (1 Arithm.)`, 1);
                addLog(`Vergleiche <code>arr[${i}] > arr[${i+2}]</code> (${arr[i]} > ${arr[i+2]}) (1 Vergleich)`, 1);
                addLog(`<em>(Arrayzugriffe arr[i] kosten 0 EOP)</em>`, 0);
                
                if (arr[i] > arr[i + 2]) {
                    currentState = 'LINE_7';
                    highlightLine(7);
                } else {
                    currentState = 'LINE_8';
                    highlightLine(8);
                }
                break;

            case 'LINE_7':
                found = 1;
                addLog("<code>found = 1;</code> (1 Zuweisung)", 1);
                updateVars();
                currentState = 'LINE_8';
                highlightLine(8);
                break;

            case 'LINE_8':
                addLog(`Prüfe <code>if (found)</code> (${found} != 0) (1 Vergleich)`, 1);
                renderArray(); // Remove highlight
                
                if (found) {
                    currentState = 'LINE_9';
                    highlightLine(9);
                } else {
                    currentState = 'LINE_4_INC';
                    highlightLine(4);
                }
                break;

            case 'LINE_9':
                addLog("<code>break;</code> (0 EOP)", 0);
                currentState = 'LINE_11';
                highlightLine(11);
                break;

            case 'LINE_4_INC':
                i += 2;
                addLog("<code>i += 2</code> (1 Zuweisung)", 1);
                updateVars();
                currentState = 'LINE_4_COND';
                highlightLine(4);
                break;

            case 'LINE_11':
                addLog("<code>return found;</code> (0 EOP)", 0);
                currentState = 'DONE';
                highlightLine(11);
                btnStep.disabled = true;
                if (playInterval) {
                    clearInterval(playInterval);
                    playInterval = null;
                    btnPlay.textContent = "Auto Play";
                    btnPlay.classList.replace('secondary', 'success');
                }
                break;
        }
    }

    btnReset.addEventListener('click', reset);
    btnStep.addEventListener('click', step);
    
    btnPlay.addEventListener('click', () => {
        if (playInterval) {
            clearInterval(playInterval);
            playInterval = null;
            btnPlay.textContent = "Auto Play";
            btnPlay.classList.replace('secondary', 'success');
        } else {
            if (currentState === 'DONE') reset();
            btnPlay.textContent = "Pause";
            btnPlay.classList.replace('success', 'secondary');
            playInterval = setInterval(step, 800); // 800ms pro Schritt
        }
    });

    arrayInput.addEventListener('change', reset);
    arrayInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') reset();
    });

    // Initial setup
    reset();
});
