window.addEventListener("load", () => {
  const countButton = document.getElementById("count"),
    countText = document.getElementById("count-number");
  updateCouter(countText, countButton);
});

function updateCouter(counterView, counterButton) {
  let currentValue = 0;
  counterButton.addEventListener('click', () => {
    currentValue++;
    counterView.textContent = currentValue;
  })
}