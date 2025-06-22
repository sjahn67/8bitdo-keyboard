const mo_key = Object.freeze({
    // Modifier Keys (0xE0 ~ 0xE7) - These are not used alone but in combination with other keys.
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

    const populateDropdowns = (options, initialValue) => {
        dropdowns.forEach(dropdown => {
            dropdown.innerHTML = '';
            // console.log("dropdown:", dropdown.id);
            let curValue = "None";
            switch(dropdown.id) {
                case "dropdown1":
                    curValue = initialValue.button1;
                    break;
                case "dropdown2":
                    curValue = initialValue.button2;
                    break;
            }
            options.forEach(optionValue => {
                const optionElement = document.createElement('option');
                optionElement.value = optionValue;
                optionElement.textContent = optionValue;
                // console.log("optionValue:", optionValue);
                if (optionValue === curValue) {
                optionElement.selected = true;
            }                
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
            // console.log(data);

            populateDropdowns(data.dropdownOptions, currentButtonValues);
            updateCheckBoxes(currentButtonValues.button0);

        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const updateDisplay = (values) => {
        if (values.button0 !== undefined) {
            currentValueDisplays.button0.textContent = `Option Key: 0x${values.button0.toString(16).padStart(2, '0')}`;
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

    // Function to send event data to the server (using a single API endpoint)
    const sendButtonEventToServer = async (eventType, buttonId, eventKey, currentValue) => {
        const url = `/api/button-event`; // Single API endpoint
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // Include eventType in the data sent to the server
                body: JSON.stringify({ eventType, buttonId, eventKey, currentValue })
            });
            const data = await response.json();
            if (data.success) {
                console.log(`Successfully sent ${eventType} event for ${buttonId} to server:`, data.message);
            } else {
                console.error(`Failed to send ${eventType} event for ${buttonId} to server:`, data.message);
            }
        } catch (error) {
            console.error(`Error sending ${eventType} event for ${buttonId} to server:`, error);
        }
    };

    // --- eventKey0_down function definition (only responsible for sending to server) ---
    const eventKey0_down = (key, value) => {
        console.log(`eventKey0_down called (frontend) - Key: ${key}, Current Value: ${value}`);
        sendButtonEventToServer('down', 'button0', key, value);
    };

    // --- eventKey0_up function definition (only responsible for sending to server) ---
    const eventKey0_up = (key, value) => {
        console.log(`eventKey1_up called (frontend) - Key: ${key}, Current Value: ${value}`);
        sendButtonEventToServer('up', 'button0', key, value);
    };

    // --- eventKey1_down function definition (only responsible for sending to server) ---
    const eventKey1_down = (key, value) => {
        console.log(`eventKey1_down called (frontend) - Key: ${key}, Current Value: ${value}`);
        sendButtonEventToServer('down', 'button1', key, value);
    };

    // --- eventKey1_up function definition (only responsible for sending to server) ---
    const eventKey1_up = (key, value) => {
        console.log(`eventKey1_up called (frontend) - Key: ${key}, Current Value: ${value}`);
        sendButtonEventToServer('up', 'button1', key, value);
    };

    // --- eventKey2_down function definition (only responsible for sending to server) ---
    const eventKey2_down = (key, value) => {
        console.log(`eventKey2_down called (frontend) - Key: ${key}, Current Value: ${value}`);
        sendButtonEventToServer('down', 'button2', key, value);
    };

    // --- eventKey2_up function definition (only responsible for sending to server) ---
    const eventKey2_up = (key, value) => {
        console.log(`eventKey2_up called (frontend) - Key: ${key}, Current Value: ${value}`);
        sendButtonEventToServer('up', 'button2', key, value);
    };

    // Add mousedown and mouseup event listeners for circle buttons
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

    // Confirm button click event listener (same as before)
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
                    console.log('Value saved successfully:', data.newValues);
                    updateDisplay(data.newValues);
                    alert(`The value for ${buttonId} has been saved as ${newValue}.`);
                } else {
                    alert('Failed to save value: ' + data.message);
                }
            } catch (error) {
                console.error('Error saving value:', error);
                alert('An error occurred while communicating with the server.');
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