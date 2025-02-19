const now = new Date();
const year = now.getFullYear().toString();
const month = (now.getMonth() + 1).toString().padStart(2, '0');
const day = now.getDate().toString().padStart(2, '0');

let date_top = document.getElementById('date_top').textContent = `تاريخ اليوم : ${month}/${day}/${year}`;

const worker = document.getElementById("worker");
const str = localStorage.getItem("last_username");  // Get the string from localStorage
worker.value = str;

let companies = [];
let cities = []; // Array to store cities data
let ip_address = 'https://mnc-reports.onrender.com/';


// DATA FETCHING
window.onload = function() {
  // Fetch companies data
  fetch(`http://${ip_address}:4455/get-companies`)
      .then(response => response.json()) // Parse the response as JSON
      .then(data => {
          companies = data; // Store the data in the array
          console.log('Fetched Companies:', companies, 'Test2'); // Log after it's populated
          populateCompanyList();
      })
      .catch(error => {
          console.error('Error fetching company data:', error);
          document.getElementById('company-header').innerText = 'Error loading data';
      });

  // Fetch city data
  fetch(`http://${ip_address}:4455/get-cities`)
      .then(response => response.json())
      .then(cities => {
          console.log(cities, 'locationS Here for test'); // Check the structure of the data
          populateCityDropdown(cities);  // Call the function to populate the dropdown
      })
      .catch(error => console.error('Error fetching cities:', error));

      
};

 
// Function to populate dropdown
function populateDropdown(dropdownId, data) {
  const dropdown = document.getElementById(dropdownId);
  data.forEach(item => {
      const option = document.createElement('option');
      option.value = item.location || item.city;
      option.textContent = item.location || item.city;
      dropdown.appendChild(option);
  });
}

function populateCityDropdown(cities) {
      const cityDropdown = document.getElementById('city');
      cityDropdown.innerHTML = '<option value="all">الكل</option>'; // Clear any previous options
  
      cities.forEach(cityObject => {
          const option = document.createElement('option');
          option.value = cityObject.city;  // Use cityObject.city to set the value
          option.textContent = cityObject.city;  // Display the city name
          cityDropdown.appendChild(option);
      });
  }
  
// Filter companies by city
function filterCompaniesByCity() {
    var citySelect = document.getElementById('city');
    var selectedCity = citySelect.value.toUpperCase();

    var div = document.getElementById("companyList");
    var companyItems = div.getElementsByClassName('companyItem');

    for (var i = 0; i < companyItems.length; i++) {
        var companyCity = companies[i].city.toUpperCase(); // Assuming the company data has a "city" field

        if ((selectedCity === 'ALL' || companyCity === selectedCity)) {
            companyItems[i].style.display = "";
        } else {
            companyItems[i].style.display = "none";
        }
    }
}

// Add event listener to city select for filtering
var citySelect = document.getElementById('city');
citySelect.addEventListener('change', function() {
    filterCompaniesByCity();
});


function searchCompanies() {
    var input, filter, div, companyItems, i;
    input = document.getElementById('searchInput');
    filter = input.value.toUpperCase();
    div = document.getElementById("companyList");
    companyItems = div.getElementsByClassName('companyItem');

    for (i = 0; i < companyItems.length; i++) {
        var companyName = companyItems[i].querySelector('label').textContent.toUpperCase();
        // Remove location filtering
        if (companyName.indexOf(filter) > -1) {
            companyItems[i].style.display = "";
        } else {
            companyItems[i].style.display = "none";
        }
    }

}

let selectedCity = 'all';  // Initially, no city filter applied
let currentSearchTerm = '';  // Initially, no search term

// Function to apply both city and search filters
function filterCompanies() {
    var citySelect = document.getElementById('city');
    selectedCity = citySelect.value.toUpperCase();  // Get the selected city
    var input = document.getElementById('searchInput');
    currentSearchTerm = input.value.toUpperCase();  // Get the search term

    var div = document.getElementById("companyList");
    var companyItems = div.getElementsByClassName('companyItem');

    for (var i = 0; i < companyItems.length; i++) {
        var company = companies[i];
        var companyName = company.name.toUpperCase();
        var companyCity = company.city.toUpperCase();

        // Check if the company matches the selected city and the search term
        var matchesCity = (selectedCity === 'ALL' || companyCity === selectedCity);
        var matchesSearch = companyName.indexOf(currentSearchTerm) > -1;

        // Apply both filters together
        if (matchesCity && matchesSearch) {
            companyItems[i].style.display = "";
        } else {
            companyItems[i].style.display = "none";
        }
    }
}

// Add event listener for city filter change
var citySelect = document.getElementById('city');
citySelect.addEventListener('change', function() {
    filterCompanies();  // Apply both filters when city changes
});

// Add event listener for search input change
var searchInput = document.getElementById('searchInput');
searchInput.addEventListener('keyup', function() {
    filterCompanies();  // Apply both filters when search input changes
});



function handleLogout() {
    // Ask for confirmation
    const isConfirmed = true;

    if (isConfirmed) {
        // If Yes, remove the key from localStorage
        localStorage.removeItem("last_username");

        // Redirect to login page
        window.location.href = "login.html";
    } else {
        // If No, just do nothing
        console.log("User cancelled the logout.");
    }
}

function populateCompanyList() {
    var div = document.getElementById("companyList");
    companies.forEach(function(company) {
        var checkboxContainer = document.createElement("div");
        checkboxContainer.setAttribute("class", "companyItem");

        var label = document.createElement("label");
        label.innerHTML = company.name;
        label.style.marginLeft = '50px'; 
        checkboxContainer.appendChild(label);

        var noteButton = document.createElement("button");
        noteButton.className = 'btn btn-outline-warning';
        noteButton.textContent = "اضف ملاحظات";
        noteButton.onclick = function(event) {
            event.preventDefault(); 
            var existingNoteContainer = checkboxContainer.querySelector(".noteContainer");

            if (!existingNoteContainer) {
                noteButton.textContent = 'اخفي الملاحظات';
            }

            if (existingNoteContainer) {
                noteButton.textContent = "اضف ملاحظات";
                existingNoteContainer.remove();
            } else {
                var noteContainer = document.createElement("div");
                noteContainer.classList.add("noteContainer"); 
                noteContainer.style.marginTop = "5px"; 

                var noteInput = document.createElement("input");
                noteInput.className = "inputnotefield";
                noteInput.type = "text";
                noteInput.placeholder = "اكتب الملاحظات هنا...";
                noteContainer.appendChild(noteInput); 

                checkboxContainer.appendChild(noteContainer); 
            }
        };
        checkboxContainer.appendChild(noteButton);

        var checkbox = document.createElement("input");
        checkbox.className = "form-check-input";
        checkbox.type = "checkbox";
        checkbox.setAttribute("data-code", company.code); 
        checkboxContainer.appendChild(checkbox);

        div.appendChild(checkboxContainer);
    });
}


function submitData() {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const date = `${year}-${month}-${day}`;

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[now.getDay()];

    var selectedCompanies = document.querySelectorAll('.companyItem input[type=checkbox]:checked');
    if (selectedCompanies.length === 0) {
        alert("يجب عليك اختيار شركة واحدة على الأقل.");
        return;
    }

    var startWork = document.getElementById("startWork").value;
    var endWork = document.getElementById("endWork").value;

    var startTime = new Date("2000-01-01T" + startWork);
    var endTime = new Date("2000-01-01T" + endWork);

    if (startTime >= endTime) {
        alert("وقت بدء العمل يجب أن يكون قبل وقت انتهاء العمل.");
        return;
    }

    var worker = document.getElementById("worker").value;

    startWork = formatTime(startWork);
    endWork = formatTime(endWork);

    const values = Array.from(selectedCompanies).map(company => {
        const companyName = company.parentElement.querySelector('label').textContent.trim();
        const noteInput = company.parentElement.querySelector('input[type=text]');
        const note = noteInput ? noteInput.value.trim() : '';
        return {
            code: company.getAttribute('data-code'),
            name: companyName,
            Notes: note,
            startWork: startWork,
            endWork: endWork
        };
    });

    var formData = {
        date: date,
        dayName: dayName,
        worker: worker,
        companies: values
    };
    console.log(formData)
    fetch('/visit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        alert(`يعطيك العافيه ${str} تم ارسال الكشف اليومي بنجاح!`);
        handleLogout();
    })
    .catch(error => {
        console.error('Error:', error);
        alert("حدث خطأ أثناء إرسال البيانات. تفاصيل الخطأ: " + error.message);
    });    
}



// Get the button element
const button = document.getElementById('no_work');

// Add event listener for the 'click' event
button.addEventListener('click', function() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[now.getDay()];
    const worker = document.getElementById("worker").value;

    fetch('/no-work', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date: dateString, dayName: dayName, worker: worker })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(data => {
        alert('تم تعيين معلوماتك ك لم اذهب الى العمل');
        handleLogout();
        
    })
    .catch(error => {
        console.error('Error:', error);
        alert('حدث خطأ أثناء إرسال الطلب');
    });
});

function formatTime(time) {
    return time + ":00"; // Format time to include seconds
}


