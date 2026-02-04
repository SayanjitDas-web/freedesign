function switchTab(tabName) {
  // 1. Reset all tabs and buttons
  document
    .querySelectorAll(".tab-content")
    .forEach((el) => el.classList.remove("active"));
  document
    .querySelectorAll(".tab-btn")
    .forEach((el) => el.classList.remove("active"));

  // 2. Activate selected
  document.getElementById(`tab-${tabName}`).classList.add("active");
  document.getElementById(`btn-tab-${tabName}`).classList.add("active");
}
