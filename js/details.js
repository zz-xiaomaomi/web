var bigimg = document.querySelector(".show-img>img");
var img = document.querySelectorAll(".show-imgs>img");
console.log(img);

for (var i = 0; i < img.length; i++) {
  img[i].addEventListener("mouseenter", function () {
    document.querySelector("img.select").classList.remove("select");
    this.classList.add("select");
    bigimg.src = this.src;
  })
}

var button = document.querySelectorAll(".m-number>button");
console.log(button);

button[0].onclick = function () {
  document.getElementsByName("number")[0].value--;
  if (document.getElementsByName("number")[0].value == "1") {
    button[0].disabled = true;
    button[0].style = "cursor: not-allowed";
  }
}
button[1].onclick = function () {
  document.getElementsByName("number")[0].value++;
  if (document.getElementsByName("number")[0].value != "0") {
    button[0].disabled = false;
    button[0].style = "";
  }
}

var sizediv = document.querySelectorAll(".d-size>div");
console.log(sizediv);

for (var i = 0; i < sizediv.length; i++) {
  sizediv[i].addEventListener("click", function () {
    document.querySelector(".d-size>div.checked").classList.remove("checked");
    this.classList.add("checked");
  })
}