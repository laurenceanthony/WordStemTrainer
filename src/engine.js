
let results = null
let current_level = null
let current_test_id = null
let current_item_id = null
let current_result = null
let total_test_items = null
let current_score = null
let current_item_checked = false
let current_item_is_correct = false
let limit = 10
let affix_info = null

let form = document.querySelector('#search-form');

form.addEventListener('submit', (event) => {
    event.preventDefault();

    let level = document.getElementById("level_select").value;
    let test_id = document.getElementById("test_bank_select").value;

    if (current_level === null || current_test_id === null) {
        console.log('Get new test bank')
        getResults();
    }
    else if (current_level != level || current_test_id != test_id) {
        console.log('Get new test bank')
        getResults();
    } else {
        console.log('Use current text bank')
    }
});

document.getElementById("restart").addEventListener("click", function () {
    console.log("Restart button clicked!");
    document.getElementById("quiz_item").innerText = current_word;
    current_item_checked = false
    if (current_item_is_correct) {
        current_item_is_correct = false
        current_score -= 1
    }
    document.getElementById("correct_incorrect").innerText = ""

});

document.getElementById("check").addEventListener("click", function () {
    // Get the response text and split into parts based on one or more spaces
    let response = document.getElementById("quiz_item").innerText.trim();
    let responseParts = response.split(/\s+/); // Split by one or more spaces

    // Define the expected parts
    // let part_1 = current_result[4] === null ? "" : current_result[4];
    // let part_2 = current_result[5] === null ? "" : current_result[5];
    // let part_3 = current_result[6] === null ? "" : current_result[6];

    let expectedParts = current_result.slice(4).map(part => part === null ? "" : part);
    expectedParts = trimArray(expectedParts)

    // let quizItem = parts.filter(part => part !== "").join('/');

    // let part_1 = current_result[4];
    // let part_2 = current_result[5];
    // let part_3 = current_result[6];
    // Construct the quiz item string
    // let quizItem = part_1 + '/' + part_2 + (part_3 !== "" ? '/' + part_3 : '');

    // Combine parts to match with the response
    // let expectedParts = [part_1, part_2, part_3];

    // Function to compare responseParts with expectedParts
    let isCorrect = responseParts.every((part, index) => part === expectedParts[index]) &&
        responseParts.length <= expectedParts.filter(part => part !== "").length;


    if (isCorrect === true && current_item_checked === false) {
        current_score += 1
        current_item_checked = true
        current_item_is_correct = true
    }

    if (isCorrect === true) {
        document.getElementById("correct_incorrect").innerText = "Correct!"
    }
    else {
        document.getElementById("correct_incorrect").innerText = "Incorrect!"

    }

    document.getElementById("current_score").innerText = current_score;
    // console.log(isCorrect); // Outputs true if all parts match, false otherwise
})

document.getElementById("answer").addEventListener("click", function () {
    console.log("Show Answer button clicked!");
    let parts = current_result.slice(4).map(part => part === null ? "" : part);

    // Filter out empty parts and join with '/'
    let combinedParts = parts.filter(part => part !== "").join('/');

    document.getElementById("quiz_item").innerHTML = `<span style="color: red;">${combinedParts}</span>`;
});

document.getElementById("next").addEventListener("click", function () {
    console.log("Next button clicked!");
    if (total_test_items > 0 && current_item_id < total_test_items - 1) {
        current_item_id += 1
        current_result = results[current_item_id]
        update_display()
    }
});

function getResults() {
    // Retrieve the selected values from the dropdowns
    let test_id = document.getElementById("test_bank_select").value;

    // Prepare the POST request
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        try {
            results = JSON.parse(this.responseText);
            total_test_items = results.length

            if (total_test_items > 0) {
                current_item_id = 0
                current_result = results[current_item_id]
                current_score = 0
                update_display()
            }

        } catch (e) {
            console.error("Error parsing response: ", e);
            alert("An error occurred while processing the response.");
        }
    };

    xhttp.onerror = function () {
        alert("An error occurred during the request.");
    };

    // Send the selected values to the server

    xhttp.open("POST", "get_result.php", true);
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhttp.send(`test_id=${encodeURIComponent(test_id)}&limit=${limit}`);
}

function getStemInfo() {
    // Prepare the POST request
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        try {
            stem_info = JSON.parse(this.responseText);
            // console.log(stem_info)

            let values = stem_info.map(row => `<div>${row[0]}<br>${row[1]}<br><br><div>`).join('')
            values = values.replaceAll('e.g.', '<br>e.g.');
            const display_text = `Stem List<br><br> ${values}`

            document.getElementById("stem_list").innerHTML = display_text

        } catch (e) {
            console.error("Error parsing response: ", e);
            alert("An error occurred while processing the response.");
        }
    };

    xhttp.onerror = function () {
        alert("An error occurred during the request.");
    };

    // Send the selected values to the server
    const nolimit = -1
    xhttp.open("POST", "get_stem_info.php", true);
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhttp.send();
}


document.addEventListener('DOMContentLoaded', function () {
    getResults();  // Call the function when the DOM is ready
});

function update_display() {
    current_item_checked = false
    current_level = parseInt(current_result[1])
    current_test_id = parseInt(current_result[2])
    current_word = current_result[3];

    // Update the element's text
    document.getElementById("total_test_items").innerText = total_test_items;
    document.getElementById("current_score").innerText = current_score;
    document.getElementById("quiz_item").innerText = current_word;
    document.getElementById("current_item_id").innerText = current_item_id + 1;

    if (current_item_id === total_test_items - 1) {
        document.getElementById("next").style.display = 'none';
        document.getElementById("end_of_test").style.display = 'block';
    }
    else {
        document.getElementById("next").style.display = 'block';
        document.getElementById("end_of_test").style.display = 'none';
    }

    document.getElementById("correct_incorrect").innerText = ""
}

document.getElementById('test_bank_select').addEventListener('change', function () {
    getResults()
});

document.getElementById("restart_test").addEventListener("click", function () {
    getResults()
});

document.getElementById("hint").addEventListener("click", function () {
    const button_action = document.getElementById("hint").innerText
    if (button_action === 'Show all stems') {
        document.getElementById("stem_list").style.display = 'block';
        document.getElementById("hint").innerText = 'Hide all stems'
        getStemInfo()
    }
    else {
        document.getElementById("stem_list").style.display = 'none';
        document.getElementById("hint").innerText = 'Show all stems'
    }
});

function trimArray(arr) {
    let start = 0;
    let end = arr.length - 1;

    // Find the index of the first non-blank element
    while (start <= end && arr[start] === '') {
        start++;
    }

    // Find the index of the last non-blank element
    while (end >= start && arr[end] === '') {
        end--;
    }

    // Slice the array to remove blank elements from the start and end
    return arr.slice(start, end + 1);
}