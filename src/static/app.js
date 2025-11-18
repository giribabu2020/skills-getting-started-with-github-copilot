document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Create participants list HTML
        let participantsHTML = "";
        if (details.participants.length > 0) {
          participantsHTML = `
            <div class="participants-section">
              <strong>Participants:</strong>
              <ul class="participants-list">
                ${details.participants
                  .map(
                    (participant) =>
                      `<li><span class="participant-badge">${participant}</span></li>`
                  )
                  .join("")}
              </ul>
            </div>
          `;
        } else {
          participantsHTML = `
            <div class="participants-section">
              <strong>Participants:</strong>
              <span class="no-participants">No one signed up yet.</span>
            </div>
          `;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Re-fetch and re-render activities so the UI updates immediately
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});

function renderActivities(activities) {
  const activitiesList = document.getElementById('activities-list');
  activitiesList.innerHTML = '';

  activities.forEach(activity => {
    const card = document.createElement('div');
    card.className = 'activity-card';

    let participantsHTML = '';
    if (activity.participants && activity.participants.length > 0) {
      participantsHTML = `<ul class="participants-list no-bullets">` +
        activity.participants.map(p => `
          <li class="participant-item">
            <span class="participant-email">${p}</span>
            <button class="delete-participant" title="Remove participant" data-activity="${activity.name}" data-email="${p}">✖</button>
          </li>
        `).join('') +
        `</ul>`;
    } else {
      participantsHTML = `<p class="no-participants">No participants yet.</p>`;
    }

    card.innerHTML = `
      <h4>${activity.name}</h4>
      <p>${activity.description}</p>
      <div class="participants-section">
        <strong>Participants:</strong>
        ${participantsHTML}
      </div>
    `;

    activitiesList.appendChild(card);
  });

  // Add event listeners for delete buttons
  document.querySelectorAll('.delete-participant').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const activityName = this.getAttribute('data-activity');
      const email = this.getAttribute('data-email');
      unregisterParticipant(activityName, email);
    });
  });
}

// Unregister participant function
function unregisterParticipant(activityName, email) {
  // You should implement the backend call here. For now, we'll assume activities is global.
  if (window.activities) {
    const activity = window.activities.find(a => a.name === activityName);
    if (activity) {
      activity.participants = activity.participants.filter(p => p !== email);
      renderActivities(window.activities);
    }
  }
  // Optionally, show a message or handle errors
}
