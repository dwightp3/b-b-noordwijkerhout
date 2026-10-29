
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.getElementById("site-nav");
if (menuToggle && siteNav) {
  const setMenu = (open) => {
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    siteNav.dataset.open = String(open);
  };
  menuToggle.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
  siteNav.addEventListener("click", (event) => { if (event.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      menuToggle.focus();
    }
  });
  window.matchMedia("(min-width: 84rem)").addEventListener("change", () => setMenu(false));
}

const header = document.querySelector("[data-header]");
if (header) {
  const onScroll = () => header.toggleAttribute("data-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

const revealed = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    observer.unobserve(entry.target);
  }), { rootMargin: "0px 0px -10% 0px" });
  revealed.forEach((element) => observer.observe(element));
} else {
  revealed.forEach((element) => element.classList.add("is-visible"));
}

const booking = document.querySelector("[data-booking]");
if (booking) {
  const monthLabel = booking.querySelector("[data-booking-month]");
  const daysBody = booking.querySelector("[data-booking-days]");
  const dateInput = document.getElementById("f-dates");
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let arrival = null;
  let departure = null;

  const sameDay = (a, b) => a && b && a.getTime() === b.getTime();
  const fmt = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const syncInput = () => {
    if (arrival && departure) dateInput.value = `${fmt(arrival)} to ${fmt(departure)}`;
    else if (arrival) dateInput.value = `From ${fmt(arrival)}`;
    else dateInput.value = "";
  };

  const render = () => {
    monthLabel.textContent = `${monthNames[viewMonth]} ${viewYear}`;
    daysBody.innerHTML = "";
    const first = new Date(viewYear, viewMonth, 1);
    const offset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    let row = document.createElement("tr");
    for (let i = 0; i < offset; i++) row.appendChild(document.createElement("td"));
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewYear, viewMonth, day);
      const cell = document.createElement("td");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "booking-day";
      button.textContent = day;
      button.dataset.date = date.getTime();
      button.setAttribute("aria-label", fmt(date));
      if (date < today) button.disabled = true;
      if (sameDay(date, today)) button.classList.add("is-today");
      if (sameDay(date, arrival) || sameDay(date, departure)) button.classList.add("is-edge");
      if (arrival && departure && date > arrival && date < departure) button.classList.add("is-in-range");
      button.addEventListener("click", () => pick(date));
      cell.appendChild(button);
      row.appendChild(cell);
      if ((offset + day) % 7 === 0 || day === daysInMonth) {
        daysBody.appendChild(row);
        row = document.createElement("tr");
      }
    }
  };

  const pick = (date) => {
    if (!arrival || (arrival && departure) || date <= arrival) {
      arrival = date;
      departure = null;
    } else {
      departure = date;
    }
    syncInput();
    render();
  };

  booking.querySelector("[data-booking-prev]")?.addEventListener("click", () => {
    if (new Date(viewYear, viewMonth, 1) <= new Date(today.getFullYear(), today.getMonth(), 1)) return;
    viewMonth -= 1;
    if (viewMonth < 0) { viewMonth = 11; viewYear -= 1; }
    render();
  });
  booking.querySelector("[data-booking-next]")?.addEventListener("click", () => {
    viewMonth += 1;
    if (viewMonth > 11) { viewMonth = 0; viewYear += 1; }
    render();
  });

  render();
}

const form = document.querySelector("[data-form]");
if (form) {
  const status = form.querySelector('[role="status"]');
  const messages = { name: "Enter your name.", email: "Enter an email like name@example.com." };
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let firstInvalid = null;
    form.querySelectorAll("input[required], textarea[required]").forEach((field) => {
      field.value = field.value.trim();
      const error = document.getElementById(`${field.id}-error`);
      const valid = field.checkValidity();
      field.setAttribute("aria-invalid", String(!valid));
      if (error) {
        error.hidden = valid;
        error.textContent = valid ? "" : messages[field.name] ?? "Fill in this field.";
        if (!valid) field.setAttribute("aria-describedby", error.id);
      }
      if (!valid && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) { firstInvalid.focus(); return; }
    const name = form.elements.namedItem("name")?.value.split(" ")[0];
    if (status) status.textContent = name ? `Thanks, ${name}. We reply within one working day.` : "Thanks. We reply within one working day.";
    form.reset();
  });
}