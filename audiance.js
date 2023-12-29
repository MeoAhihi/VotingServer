const socket = io();
document.getElementById("myForm").addEventListener("submit", function (event) {
  event.preventDefault();

  // Get the selected gender
  const genderRadios = document.getElementsByName("gender");
  let selectedGender = "";
  for (const radio of genderRadios) {
    if (radio.checked) {
      selectedGender = radio.value;
      break;
    }
  }

  // Get the selected color
  const colorRadios = document.getElementsByName("color");
  let selectedColor = "";
  for (const radio of colorRadios) {
    if (radio.checked) {
      selectedColor = radio.value;
      break;
    }
  }

  //send data to server
  socket.emit("vote", Date.now(), selectedGender, selectedColor);
});
