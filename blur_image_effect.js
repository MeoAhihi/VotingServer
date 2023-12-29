const pictures = document.querySelectorAll("img.picture");
document.onclick = (e) => {
  console.log(e.target.tagName);
  if (e.target.tagName === "IMG") {
    pictures.forEach((element) => {
      element.classList.add("blured");
    });
    e.target.classList.remove("blured");
  } else if (e.target.tagName === "INPUT") {
    // do nothing
  } else {
    pictures.forEach((element) => {
      element.classList.remove("blured");
    });
  }
};
