$(document).ready(() => {
  let year = new Date().getFullYear();
  let month = new Date().getMonth();
  let currentHistory;
  const storageName = "memories";

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Initialize the calendar
  initializeCalendar();

  // Event listeners for month navigation and month selection
  setupEventListeners();

  function initializeCalendar() {
    $(".year").text(year);
    $(".year-month").text(`${months[month]} ${year}`);
    renderDaysOfWeek();
    displayDays(year, month);
  }

  function setupEventListeners() {
    $(".years-section button:first-child").click(() => changeMonth(-1));
    $(".years-section button:last-child").click(() => changeMonth(1));
    $(document).on("click", ".month-name", function () {
      selectMonth($(this).text());
    });

    // Hover effect for day numbers
    $(document).on("mouseenter", ".day-number", handleDayMouseEnter);
    $(document).on("mouseleave", ".day-number", handleDayMouseLeave);

    // Click event to show alert and display memories
    $(document).on("click", ".day-number", handleDayClick);
  }

  function renderDaysOfWeek() {
    days.forEach(day => $("#days-list").append(`<li>${day}</li>`));
  }

  function changeMonth(offset) {
    month += offset;
    if (month < 0) {
      month = 11;
      year--;
    } else if (month > 11) {
      month = 0;
      year++;
    }
    updateCalendar();
  }

  function updateCalendar() {
    $(".year").text(year);
    $(".year-month").text(`${months[month]} ${year}`);
    displayDays(year, month);
  }

  function selectMonth(selectedMonth) {
    $(".month-name").removeClass("active");
    $(`.month-name:contains(${selectedMonth})`).addClass("active");
    month = months.indexOf(selectedMonth);
    updateCalendar();
  }

  function displayDays(year, month) {
    const daysList = $(".days-number-section").empty();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    // Get all stored memories from localStorage
    const storedMemories = JSON.parse(localStorage.getItem(storageName)) || [];
    
    // Fill in the empty days before the first day of the month
    for (let i = firstDayOfMonth; i > 0; i--) {
      daysList.append(`<span class="prev-month empty">${daysInMonth + 1 - i}</span>`);
    }
  
    // Append the actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = year === new Date().getFullYear() &&
        month === new Date().getMonth() &&
        day === new Date().getDate();
      
      // Check if there is a memory for the current day
      const hasMemory = storedMemories.some(memory => 
        parseInt(memory.year) === year &&
        memory.month == months[month] &&
        parseInt(memory.day) === day 
    );

      // Append the day element to the calendar
      daysList.append(`<span class="day-number ${hasMemory ? 'has-memory' : ''} ${isToday ? 'today' : ''}" >${day}</span>`);
    }
  
    // Append empty days after the last day of the month to fill the grid
    const totalDisplayedDays = firstDayOfMonth + daysInMonth;
    for (let i = 0; i < 42 - totalDisplayedDays; i++) {
      daysList.append(`<span class="next-month empty">${i + 1}</span>`);
    }
  }
  

  function handleDayMouseEnter() {
    $(this).data("day", $(this).text()).html(`<i class="fa-solid fa-plus"></i>`);
  }

  function handleDayMouseLeave() {
    $(this).text($(this).data("day"));
  }

  function handleDayClick() {
    if (!$(this).hasClass("empty")) {
      currentHistory = `${year} ${months[month]} ${$(this).data('day')}`;
      showAlert();
      displayMemories(currentHistory);
    }
  }

  function getMemory(memoryId) {
    const storedMemories = localStorage.getItem(storageName) || '[]';
    const memories = JSON.parse(storedMemories);

    return memories.find(memory => memory.memoryId === memoryId);
  }

  function addMemory(memory) {
    const storedMemories = localStorage.getItem(storageName) || '[]';
    const memories = JSON.parse(storedMemories);

    memories.push(memory);
    localStorage.setItem(storageName, JSON.stringify(memories));
  }

  function removeMemory(memoryId) {
    try {
      // Retrieve stored memories from localStorage
      const storedMemories = localStorage.getItem(storageName);

      // If no memories are found, initialize an empty array
      const memories = storedMemories ? JSON.parse(storedMemories) : [];

      // Filter out the memory with the specified ID
      const updatedMemories = memories.filter(memory => memory.memoryId !== memoryId);

      // Save the updated memories array back to localStorage
      localStorage.setItem(storageName, JSON.stringify(updatedMemories));

    } catch (error) {
      console.error("Error removing memory:", error);
    }
  }


  function generateMemoryInput() {
    return `
      <section class="memory-entry">
        <section class="memory">
          <input type="text" class="memory-title" placeholder="Title"/>
          <textarea class="memory-text" placeholder="What are you thinking?"></textarea>
        </section>
        <section class="memory-btn">
          <button class="cancel-memory">Cancel</button>
          <button class="save-memory">Save</button>
        </section>
      </section>
    `;
  }

  function generateAlert() {
    displayMemories(currentHistory)
    return `
      <div class="display-alert">
        <section class="alert">
          <header>
            <span>${currentHistory}</span>
            <span class="close-alert"><i class="fa-solid fa-xmark"></i></span>
          </header>
          <section class="alert-content">
            <section class="add-btn">
              <i class="fa-solid fa-plus"></i>
            </section>
            <section class="memories"></section>
          </section>
        </section>
      </div>
    `;
  }

  function generateMemoryField(memory) {
    return `
      <section class="memories-section" data-index="${memory.memoryId}">
        <section class="memory">
          <div class="title">${memory.title}</div>
          <section class="memory-actions">
            <button class="edit-item">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="delete-item">
              <i class="fa-solid fa-trash"></i>
            </button>
          </section>
        </section>
      </section>
    `;
  }

  function showAlert() {
    $("body").append(generateAlert);

    // Close alert on clicking the close button
    $(".close-alert").click(() => {
      $(".display-alert").remove()
      displayDays(year, month)
    });

    // Add memory entry
    $(document).on("click", ".add-btn", function () {
      if ($(".memory-entry").length === 0) {
        $('.display-alert').append(generateMemoryInput);
      }
    });

    // Cancel memory entry
    $(document).on("click", ".cancel-memory", function () {
      $(".memory-entry").remove();
    });

    // Save memory entry
    $(document).on("click", ".save-memory", function () {
      const memoryEntry = $(".memory-entry");
      const memoryText = memoryEntry.find(".memory-text").val().trim();
      const memoryTitle = memoryEntry.find(".memory-title").val().trim();

      if (!memoryText) return;

      const [year, month, day] = currentHistory.split(" ");
      const storedMemories = JSON.parse(localStorage.getItem(storageName)) || [];
      const memoryId = storedMemories.length ? storedMemories[storedMemories.length - 1].memoryId + 1 : 1;

      const newMemory = {
        memoryId,
        year,
        month,
        day,
        title: memoryTitle,
        text: memoryText,
      };

      addMemory(newMemory);

      memoryEntry.remove();
      displayMemories(currentHistory);
    });


  }

  function displayMemories(currentHistory) {
    const [year, month, day] = currentHistory.split(" ");
    const storedMemories = JSON.parse(localStorage.getItem(storageName)) || [];
    const dayMemories = storedMemories.filter(memory =>
      memory.year === year && memory.month === month && memory.day === day
    );

    const memorySection = $(".memories").empty();
    dayMemories.forEach(memory => {
      memorySection.append(generateMemoryField(memory));
    });
    $(document).on("click", '.edit-item', function () {
      // Find the closest .memories-section related to this .edit-item
      const memorySection = $(this).closest('.memories-section');

      // Get the data-index attribute from the .memories-section
      const memoryIndex = memorySection.data('index');

      // Get the memory based on the memoryIndex
      const memory = getMemory(memoryIndex);

      if (memory) {
        $('.display-alert').append(generateMemoryInput)

        // Populate the form with the existing memory data
        $('.memory-title').val(memory.title);
        $('.memory-text').val(memory.text);
      } else {
        console.error("Memory not found for index:", memoryIndex);
      }
    });


    $(document).on("click", ".delete-item", function () {
      // Find the closest .memories-section related to this .delete-item
      const memorySection = $(this).closest('.memories-section');

      // Get the data-index attribute from the .memories-section
      const memoryIndex = memorySection.data('index');

      // If memoryIndex is valid, remove the memory
      if (memoryIndex) {
        removeMemory(memoryIndex);

        // Optionally, remove the memory section from the DOM
        memorySection.remove();

      } else {
        console.error("Memory ID not found.");
      }
    });

  }

  displayDays(year, month)

});
