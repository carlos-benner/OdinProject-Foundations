/* Calculator logic */

const enterKeyCode = 'Enter';
const escapeKeyCode = 'Escape';
const backspaceKeyCode = 'Backspace';

const keyTypes = {
    clear: 'clear',
    clearOnce: 'clearOnce',
    solve: 'solve',
    digit: 'digit',
    operation: 'operation',
};

//Input
let currentInput = '';
let lastKey = keyTypes.clear;

document.querySelectorAll('.calc-pad > button').forEach((btn) => {
    btn.addEventListener('click', buttonPressed);
});

document.addEventListener('keydown', keyboardPressed);

function keyboardPressed(e) {
    if (e.repeat) return;
    let key = e.key;
    if (e.key == '/') e.preventDefault;
    switch (key) {
        case enterKeyCode:
            key = keyTypes.solve;
            break;
        case escapeKeyCode:
            key = keyTypes.clear;
            break;
        case backspaceKeyCode:
            key = keyTypes.clearOnce;
            break;
        default:
            break;
    }
    const calcButton = document.querySelector(
        `.calc-pad > button[data-key='${key}']`
    );
    if (calcButton) {
        calcButton.click();
    }
}

function buttonPressed(e) {
    const screen = document.querySelector('.calc-screen > .screen');
    const keyValue = e.target.attributes['data-key'].value;
    const keyType = e.target.attributes['data-key-type']?.value;

    //Clearing input for special case
    currentInput = currentInput === 'ERR' ? '0' : currentInput;

    //Appending space to separate operators and digits
    if (
        keyType != keyTypes.clear &&
        keyType != keyTypes.clearOnce &&
        keyType != keyTypes.solve &&
        keyType != lastKey &&
        currentInput != '' &&
        !currentInput.endsWith(' ')
    ) {
        currentInput += ' ';
    }

    switch (keyType) {
        case keyTypes.clear:
            clearScreen();
            break;

        case keyTypes.clearOnce:
            currentInput = currentInput.split('').slice(0, -1).join('');
            //Clear screen if all input were removed or if character is not a digit
            if (
                currentInput.length == 0 ||
                (currentInput.length == 1 && !Number.isInteger(+currentInput))
            ) {
                clearScreen();
            }
            break;

        case keyTypes.solve:
            //Ignore previous input if solving equation with trailing operation
            if (lastKey == keyTypes.operation) {
                currentInput = currentInput.split('').slice(0, -1).join('');
            }
            currentInput = solveEquation(currentInput);
            break;

        case keyTypes.digit:
            let inputArray = currentInput.split(' ');
            if (lastKey === keyTypes.solve) currentInput = '';
            if (keyValue === '.') {
                //ignore key if last number contains a dot
                if (inputArray[inputArray.length - 1].indexOf('.') > -1) break;
                //include leading zero if dot is used and there is no digit
                if (
                    !Number.isInteger(
                        parseInt(currentInput[currentInput.length - 1])
                    )
                )
                    currentInput += '0';
            }
            //ignore zero input if leading zero exists and no decimal separator present
            if (
                keyValue === '0' &&
                inputArray[inputArray.length - 1].startsWith('0') &&
                inputArray[inputArray.length - 1].indexOf('.') < 0
            ) {
                break;
            }
            currentInput += `${keyValue}`;
            break;

        case keyTypes.operation:
            //replace last operation
            if (lastKey === keyTypes.operation)
                currentInput = currentInput.split('').slice(0, -1).join('');
            if (currentInput === '') currentInput = '0 ';
            currentInput += `${keyValue}`;
            break;

        default:
            break;
    }

    if (currentInput != '') {
        screen.textContent = currentInput;
        screen.classList.remove('blink');
    }
    lastKey =
        keyType != null && keyType != keyTypes.clearOnce
            ? keyType
            : keyTypes.digit;
}

function clearScreen() {
    const screen = document.querySelector('.calc-screen > .screen');
    currentInput = '';
    screen.textContent = '0';
    screen.classList.add('blink');
}

function solveEquation(eq) {
    let equationArray = eq.split(' ');
    let exponentIndex = equationArray.indexOf('^');
    let divisionIndex = equationArray.indexOf('/');
    let multiplicationIndex = equationArray.indexOf('*');
    let subtractionIndex = equationArray.indexOf('-');
    let additionIndex = equationArray.indexOf('+');

    switch (true) {
        case exponentIndex > -1:
            equationArray = solveOperationInArray(equationArray, exponentIndex);
            break;
        case divisionIndex > -1 || multiplicationIndex > -1:
            equationArray = solveOperationInArray(
                equationArray,
                getLowerOperationIndex(divisionIndex, multiplicationIndex)
            );
            break;
        case additionIndex > -1 || subtractionIndex > -1:
            equationArray = solveOperationInArray(
                equationArray,
                getLowerOperationIndex(additionIndex, subtractionIndex)
            );
            break;
        default:
            //Exit condition: All operations were solved.
            const num = equationArray.join(' ');
            return (Math.round(num * 10000) / 10000).toString();

            break;
    }
    //We solve the equation recursively by operations according to their "weight".
    //First power, then multiplication and division from left to right,
    //finally addition and subtraction from left to right
    return solveEquation(equationArray.join(' '));
}

function getLowerOperationIndex(op1, op2) {
    return op1 === -1 ? op2 : op2 === -1 ? op1 : Math.min(op1, op2);
}

function solveOperationInArray(eqArray, operationIndex) {
    if (operationIndex < 0) return eqArray;
    if (eqArray[operationIndex] === '/' && eqArray[operationIndex + 1] == 0)
        return ['ERR'];

    //using eval here. Can be replaced by a switch handling each type of operation
    const operationResult = eval(
        `${eqArray[operationIndex - 1]} ${
            eqArray[operationIndex] === '^' ? '**' : eqArray[operationIndex]
        } ${eqArray[operationIndex + 1]}`
    );
    return [
        ...eqArray.slice(0, operationIndex - 1),
        operationResult,
        ...eqArray.slice(operationIndex + 2),
    ];
}
