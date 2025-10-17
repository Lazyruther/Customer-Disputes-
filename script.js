const disputes = [
  {
    id: "A-1046",
    customer: "Priya Singh",
    type: "Chargeback",
    priority: "High",
    amount: 249,
    status: "In Review",
    due: "2023-09-15",
  },
  {
    id: "A-1051",
    customer: "Dana Cooper",
    type: "Cancellation",
    priority: "Medium",
    amount: 129,
    status: "New",
    due: "2023-09-18",
  },
  {
    id: "B-2108",
    customer: "Michael Chen",
    type: "Billing",
    priority: "Low",
    amount: 89,
    status: "Resolved",
    due: "2023-09-10",
  },
  {
    id: "C-4112",
    customer: "Sara López",
    type: "Fraud",
    priority: "High",
    amount: 499,
    status: "In Review",
    due: "2023-09-16",
  },
];

const tableBody = document.getElementById("dispute-table-body");
const statusFilter = document.getElementById("status-filter");
const form = document.getElementById("demo-form");
const navToggle = document.querySelector(".nav__toggle");
const navLinks = document.querySelector(".nav__links");

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(dateString) {
  if (!dateString) return "—";
  const options = { month: "short", day: "numeric" };
  return new Intl.DateTimeFormat("en-US", options).format(new Date(dateString));
}

function createRow(dispute) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${dispute.id}</td>
    <td>${dispute.customer}</td>
    <td>${dispute.type}</td>
    <td>${dispute.priority}</td>
    <td>${formatCurrency(dispute.amount)}</td>
    <td><span class="badge ${badgeClass(dispute.status)}">${dispute.status}</span></td>
    <td>${formatDate(dispute.due)}</td>
  `;
  return tr;
}

function badgeClass(status) {
  switch (status) {
    case "New":
      return "badge--new";
    case "Resolved":
      return "badge--resolved";
    default:
      return "badge--in-progress";
  }
}

function renderTable(filterValue = "all") {
  tableBody.innerHTML = "";
  const filtered = disputes.filter((dispute) =>
    filterValue === "all" ? true : dispute.status === filterValue
  );
  if (!filtered.length) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `<td colspan="7" class="empty">No disputes match this status yet.</td>`;
    tableBody.appendChild(emptyRow);
    return;
  }
  filtered
    .sort((a, b) => new Date(a.due) - new Date(b.due))
    .forEach((dispute) => tableBody.appendChild(createRow(dispute)));
}

function validate(formElement) {
  let isValid = true;
  const elements = Array.from(formElement.elements).filter(
    (el) => el.tagName !== "BUTTON" && !el.disabled
  );

  elements.forEach((element) => {
    const errorContainer = formElement.querySelector(
      `[data-error-for="${element.id || element.name}"]`
    );
    if (!errorContainer) return;

    if (element.type === "radio") {
      const radioGroup = formElement.querySelectorAll(
        `input[name="${element.name}"]`
      );
      const checked = Array.from(radioGroup).some((radio) => radio.checked);
      if (!checked) {
        errorContainer.textContent = "Select a priority.";
        isValid = false;
      } else {
        errorContainer.textContent = "";
      }
    } else if (!element.checkValidity()) {
      isValid = false;
      errorContainer.textContent = element.validationMessage;
    } else {
      errorContainer.textContent = "";
    }
  });
  return isValid;
}

function handleFormSubmit(event) {
  event.preventDefault();
  const successMessage = form.querySelector(".form__success");

  if (!validate(form)) {
    successMessage.textContent = "";
    return;
  }

  const formData = new FormData(form);
  const priority = formData.get("priority") || "Medium";
  const newDispute = {
    id: generateCaseId(),
    customer: formData.get("customer-name").trim(),
    type: formData.get("dispute-type"),
    priority,
    amount: Number(formData.get("amount")),
    status: "New",
    due: formData.get("due-date"),
    notes: formData.get("notes")?.trim() ?? "",
  };

  disputes.push(newDispute);
  renderTable(statusFilter.value);
  form.reset();
  successMessage.textContent = "Dispute added to the backlog.";

  setTimeout(() => {
    successMessage.textContent = "";
  }, 3500);
}

function generateCaseId() {
  const prefix = String.fromCharCode(65 + Math.floor(Math.random() * 3));
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${number}`;
}

function initNavigation() {
  if (!navToggle || !navLinks) return;
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    navLinks.setAttribute("aria-expanded", String(!expanded));
    navLinks.style.display = !expanded ? "flex" : "";
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      navLinks.setAttribute("aria-expanded", "false");
      navLinks.style.display = "";
    });
  });
}

function initFooterYear() {
  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

statusFilter?.addEventListener("change", (event) => {
  renderTable(event.target.value);
});

form?.addEventListener("submit", handleFormSubmit);

initNavigation();
initFooterYear();
renderTable();
