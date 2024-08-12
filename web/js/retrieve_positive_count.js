document.addEventListener("DOMContentLoaded", function() {
    const container = document.querySelector('.out-of-100-container');
    const variable = container.getAttribute('data-variable');

    fetch('plotting_info.json')
        .then(response => response.text())
        .then(text => {
            try {
                const data = JSON.parse(text);
                const positiveCount = data[variable].positive_count;
                container.querySelector('.is-the-the').innerHTML = `${positiveCount} out of 100 people aged 15 to 39 years old`;
            } catch (error) {
                console.error('Error parsing JSON data:', error);
                console.error('Response text:', text);
            }
        })
        .catch(error => console.error('Error fetching the JSON data:', error));
});