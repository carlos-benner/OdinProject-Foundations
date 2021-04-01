/* Calculator logic */

//Input
let currentInput = '';
let lastKey = 'clear';
let operationsArray = ['+', '-', '*', '/', 'exp'];
document.querySelectorAll('.calc-pad > button').forEach((btn) => {
    btn.addEventListener('click', buttonPressed);
});

function buttonPressed(e) {
    const screen = document.querySelector('.calc-screen > .screen');
    const keyValue = e.target.attributes['data-key'].value;
    const keyType = e.target.attributes['data-key-type']?.value;

    if (
        keyType != 'clear' &&
        keyType != 'clearOnce' &&
        keyType != 'solve' &&
        keyType != lastKey &&
        currentInput != '' &&
        !currentInput.endsWith(' ')
    ) {
        currentInput += ' ';
    }

    switch (keyType) {
        case 'clear':
            clearScreen();
            break;
        case 'clearOnce':
            currentInput = currentInput.split('').slice(0, -1).join('');
            if (currentInput.length == 0) {
                clearScreen();
            }
            break;
        case 'solve':
            if (lastKey == 'operation') {
                console.log('last key operation', currentInput);
                currentInput = currentInput.split('').slice(0, -1).join('');
                console.log(currentInput);
            }
            currentInput = solveEquation(currentInput);
            break;
        case 'grouping':
            //TODO: check if can close brackets or add new bracket
            break;
        case 'digit':
            let inputArray = currentInput.split(' ');
            if (lastKey === 'solve') currentInput = '';
            if (keyValue === '.') {
                //ignore key if last number contains a dot
                if (inputArray[inputArray.length - 1].indexOf('.') > -1) break;
                if (currentInput === '') currentInput = '0';
            }
            if (
                keyValue === '0' &&
                inputArray[inputArray.length - 1].startsWith('0') &&
                inputArray[inputArray.length - 1].indexOf('.') < 0
            ) {
                break;
            }
            currentInput += `${keyValue}`;
            break;
        case 'operation':
            //replace last operation
            if (lastKey === 'operation')
                currentInput = currentInput.split('').slice(0, -1).join('');
            if (currentInput === '') currentInput = '0';
            currentInput += `${keyValue}`;
            break;
        default:
            break;
    }

    if (currentInput != '') {
        screen.textContent = currentInput;
        screen.classList.remove('blink');
    }
    lastKey = keyType != null && keyType != 'clearOnce' ? keyType : 'digit';
}

function clearScreen() {
    const screen = document.querySelector('.calc-screen > .screen');
    currentInput = '';
    screen.textContent = '0';
    screen.classList.add('blink');
}

function solveEquation(eq) {
    //TODO: division and multiplication must have same priority.
    //TODO: addition and subtraction must have same priority.
    //At this time because of the switch division and addition have higher priority. It should be from left to right.

    let equationArray = eq.split(' ');

    let exponentIndex = equationArray.indexOf('^');
    let divisionIndex = equationArray.indexOf('/');
    let multiplicationIndex = equationArray.indexOf('*');
    let subtractionIndex = equationArray.indexOf('-');
    let additionIndex = equationArray.indexOf('+');

    switch (true) {
        case exponentIndex > -1:
            equationArray = [
                ...equationArray.slice(0, exponentIndex - 1),
                equationArray[exponentIndex - 1] **
                    equationArray[exponentIndex + 1],
                ...equationArray.slice(exponentIndex + 2),
            ];
            break;
        case divisionIndex > -1:
            equationArray = [
                ...equationArray.slice(0, divisionIndex - 1),
                equationArray[divisionIndex - 1] /
                    equationArray[divisionIndex + 1],
                ...equationArray.slice(divisionIndex + 2),
            ];
            break;
        case multiplicationIndex > -1:
            equationArray = [
                ...equationArray.slice(0, multiplicationIndex - 1),
                equationArray[multiplicationIndex - 1] *
                    equationArray[multiplicationIndex + 1],
                ...equationArray.slice(multiplicationIndex + 2),
            ];
            break;
        case additionIndex > -1:
            equationArray = [
                ...equationArray.slice(0, additionIndex - 1),
                +equationArray[additionIndex - 1] +
                    +equationArray[additionIndex + 1],
                ...equationArray.slice(additionIndex + 2),
            ];
            break;
        case subtractionIndex > -1:
            equationArray = [
                ...equationArray.slice(0, subtractionIndex - 1),
                equationArray[subtractionIndex - 1] -
                    equationArray[subtractionIndex + 1],
                ...equationArray.slice(subtractionIndex + 2),
            ];
            break;
        default:
            return equationArray.join(' ');
            break;
    }
    return solveEquation(equationArray.join(' '));
}
