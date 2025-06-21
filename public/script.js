const mo_key = Object.freeze({
    // Modifier Keys (0xE0 ~ 0xE7) - 이들은 단독으로 사용되지 않고 다른 키와 조합됩니다.
    LEFT_CONTROL: 0x01,
    LEFT_SHIFT: 0x02,
    LEFT_ALT: 0x04,
    LEFT_WINDOWS: 0x08, // Windows Key, Command Key (Mac)
    RIGHT_CONTROL: 0x10,
    RIGHT_SHIFT: 0x20,
    RIGHT_ALT: 0x40,
    RIGHT_WINDOW: 0x80,
})

document.addEventListener('DOMContentLoaded', () => {
    const confirmButtons = document.querySelectorAll('.confirm-button');
    const circleButtons = document.querySelectorAll('.circle-button');
    const dropdowns = document.querySelectorAll('.value-dropdown');
    const dropdownsModi = document.querySelectorAll('.value-dropdownmodi');

    const currentValueDisplays = {
        button0: document.getElementById('currentValue0'),
        button1: document.getElementById('currentValue1'),
        button2: document.getElementById('currentValue2')
    };

    let currentButtonValues = {
        button0: 0,
        button1: 0,
        button2: 0
    };

    const populateDropdowns = (options) => {
        dropdowns.forEach(dropdown => {
            dropdown.innerHTML = '';
            options.forEach(optionValue => {
                const optionElement = document.createElement('option');
                optionElement.value = optionValue;
                optionElement.textContent = optionValue;
                dropdown.appendChild(optionElement);
            });
        });
    };

    const updateCheckBoxes = (options) => {
        Object.keys(mo_key).forEach(key => {
            if (mo_key[key] & options) {
                setCheckboxStateByValue(key, true);
            } else {
                setCheckboxStateByValue(key, false);
            }
        })
    }

    const loadInitialData = async () => {
        try {
            const response = await fetch('/api/initial-data');
            const data = await response.json();

            currentButtonValues = data.buttonValues;
            updateDisplay(currentButtonValues);
            console.log(data);

            populateDropdowns(data.dropdownOptions);
            updateCheckBoxes(currentButtonValues.button0);

        } catch (error) {
            console.error('초기 데이터를 가져오는 중 오류 발생:', error);
        }
    };

    const updateDisplay = (values) => {
        if (values.button0 !== undefined) {
            currentValueDisplays.button0.textContent = `Option Key: ${values.button0}`;
            currentButtonValues.button0 = values.button0;
        }
        if (values.button1 !== undefined) {
            currentValueDisplays.button1.textContent = `Current Key: ${values.button1}`;
            currentButtonValues.button1 = values.button1;
        }
        if (values.button2 !== undefined) {
            currentValueDisplays.button2.textContent = `Current Key: ${values.button2}`;
            currentButtonValues.button2 = values.button2;
        }
    };

    // 서버로 이벤트 데이터 전송 함수 (단일 API 엔드포인트 사용)
    const sendButtonEventToServer = async (eventType, buttonId, eventKey, currentValue) => {
        const url = `/api/button-event`; // 단일 API 엔드포인트
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // eventType을 데이터에 포함하여 서버로 전송
                body: JSON.stringify({ eventType, buttonId, eventKey, currentValue })
            });
            const data = await response.json();
            if (data.success) {
                console.log(`서버로 ${buttonId}의 ${eventType} 이벤트 전송 성공:`, data.message);
            } else {
                console.error(`서버로 ${buttonId}의 ${eventType} 이벤트 전송 실패:`, data.message);
            }
        } catch (error) {
            console.error(`서버로 ${buttonId}의 ${eventType} 이벤트 전송 중 오류 발생:`, error);
        }
    };

    // --- eventKey0_down 함수 정의 (서버로 전송만 담당) ---
    const eventKey0_down = (key, value) => {
        console.log(`eventKey0_down 호출됨 (프론트엔드) - 키: ${key}, 현재 값: ${value}`);
        sendButtonEventToServer('down', 'button0', key, value);
    };

    // --- eventKey0_up 함수 정의 (서버로 전송만 담당) ---
    const eventKey0_up = (key, value) => {
        console.log(`eventKey1_up 호출됨 (프론트엔드) - 키: ${key}, 현재 값: ${value}`);
        sendButtonEventToServer('up', 'button0', key, value);
    };

    // --- eventKey1_down 함수 정의 (서버로 전송만 담당) ---
    const eventKey1_down = (key, value) => {
        console.log(`eventKey1_down 호출됨 (프론트엔드) - 키: ${key}, 현재 값: ${value}`);
        sendButtonEventToServer('down', 'button1', key, value);
    };

    // --- eventKey1_up 함수 정의 (서버로 전송만 담당) ---
    const eventKey1_up = (key, value) => {
        console.log(`eventKey1_up 호출됨 (프론트엔드) - 키: ${key}, 현재 값: ${value}`);
        sendButtonEventToServer('up', 'button1', key, value);
    };

    // --- eventKey2_down 함수 정의 (서버로 전송만 담당) ---
    const eventKey2_down = (key, value) => {
        console.log(`eventKey2_down 호출됨 (프론트엔드) - 키: ${key}, 현재 값: ${value}`);
        sendButtonEventToServer('down', 'button2', key, value);
    };

    // --- eventKey2_up 함수 정의 (서버로 전송만 담당) ---
    const eventKey2_up = (key, value) => {
        console.log(`eventKey2_up 호출됨 (프론트엔드) - 키: ${key}, 현재 값: ${value}`);
        sendButtonEventToServer('up', 'button2', key, value);
    };

    // 원형 버튼 mousedown 및 mouseup 이벤트 리스너 추가
    circleButtons.forEach(button => {
        const buttonId = button.id;
        const eventKey = button.dataset.buttonKey;

        button.addEventListener('mousedown', () => {
            const currentValue = currentButtonValues[buttonId];
            if (eventKey === 'key1') {
                eventKey1_down(eventKey, currentValue);
            } else if (eventKey === 'key2') {
                eventKey2_down(eventKey, currentValue);
            }
        });

        button.addEventListener('mouseup', () => {
            const currentValue = currentButtonValues[buttonId];
            switch (eventKey) {
                case "key0":
                    eventKey0_up(eventKey, currentValue);
                    break;
                case "key1":
                    eventKey1_up(eventKey, currentValue);
                    break;
                case "key2":
                    eventKey2_up(eventKey, currentValue);
                    break;
            }
        });
    });

    // 확인 버튼 클릭 이벤트 리스너 (기존과 동일)
    confirmButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const buttonId = button.dataset.buttonId;
            let newValue = 0;
            if(buttonId === "button0") {
                const selectedList = getSelectedCheckboxValues();
                selectedList.forEach(item => {
                    newValue |= mo_key[item];
                });
            } else {
                const dropdownId = `dropdown${buttonId.replace('button', '')}`;
                const selectedDropdown = document.getElementById(dropdownId);
                newValue = selectedDropdown.value;
            }

            try {
                const response = await fetch('/api/update-value', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ buttonId, newValue })
                });
                const data = await response.json();

                if (data.success) {
                    console.log('값 저장 성공:', data.newValues);
                    updateDisplay(data.newValues);
                    alert(`${buttonId}의 값이 ${newValue}로 저장되었습니다.`);
                } else {
                    alert('값 저장 실패: ' + data.message);
                }
            } catch (error) {
                console.error('값 저장 중 오류 발생:', error);
                alert('서버와 통신 중 오류가 발생했습니다.');
            }
        });
    });

/**
 * Sets the checked state of a specific checkbox by its value.
 * @param {string} value - The value of the checkbox to manipulate (e.g., 'valueA', 'valueB').
 * @param {boolean} checked - True to check the checkbox, false to uncheck it.
 */
function setCheckboxStateByValue(value, checked) {
    const checkboxes = document.querySelectorAll('#checkboxGroup0 input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.value === value) {
            checkbox.checked = checked;
        }
    });
    console.log(`Checkbox with value '${value}' has been set to ${checked}`);
}

/**
 * Sets the checked state for all checkboxes in the group.
 * @param {boolean} checked - True to check all checkboxes, false to uncheck them.
 */
function setAllCheckboxesState(checked) {
    const checkboxes = document.querySelectorAll('#checkboxGroup0 input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = checked;
    });
    console.log(`All checkboxes have been set to ${checked}`);
}

/**
 * Returns an array of values for all currently selected checkboxes.
 * @returns {Array<string>} An array containing the values of the selected checkboxes.
 */
function getSelectedCheckboxValues() {
    const checkedCheckboxes = document.querySelectorAll('#checkboxGroup0 input[type="checkbox"]:checked');
    const selectedValues = Array.from(checkedCheckboxes).map(checkbox => checkbox.value);
    console.log('Currently selected values:', selectedValues);
    return selectedValues;
}    

    loadInitialData();
});