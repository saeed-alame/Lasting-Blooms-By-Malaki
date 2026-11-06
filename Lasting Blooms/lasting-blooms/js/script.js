// Lasting Blooms by Malaki - main script

// ---------- mobile menu ----------
const menuButton = document.querySelector(".menu-button");
const navLinks = document.querySelector(".nav-links");

menuButton.addEventListener("click", function () {
  navLinks.classList.toggle("open");
});

// ---------- Edit (Cart) ----------//
const cbutton = document.querySelectorAll(".add-button")
cbutton.forEach(function(cbutton){
cbutton.addEventListener("click", function (){
  alert("Added to cart!")
});
});

// ---------- search (shop page) ----------
const searchBox = document.querySelector("#search-box");

if (searchBox !== null) {
  searchBox.addEventListener("input", function () {
    const text = searchBox.value.toLowerCase();
    const cards = document.querySelectorAll(".product-card");

    cards.forEach(function (card) {
      const name = card.dataset.name.toLowerCase();
      if (name.includes(text)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
}
// ---------- contact form validation ----------
const form = document.querySelector("#contact-form");

if (form !== null) {
  form.addEventListener("submit", function (event) {
    event.preventDefault(); // stop the page from reloading

    const name = document.querySelector("#name").value.trim();
    const email = document.querySelector("#email").value.trim();
    const message = document.querySelector("#message").value.trim();
    const error = document.querySelector("#error");
    const success = document.querySelector("#success");

    success.textContent = "";

    if (name === "" || email === "" || message === "") {
      error.textContent = "Please fill in all the fields.";
    } else if (!email.includes("@")) {
      error.textContent = "Please enter a valid email.";
    } else {
      error.textContent = "";
      success.textContent = "Thanks " + name + ", your message was sent!";
      form.reset();
    }
  });
}
// ---------- typing effect (home page) ----------
// it types a sentence one letter at a time, waits, deletes it, then types the next one
const typingText = document.querySelector("#typing-text");

const sentences = [
  "Fresh flowers for every little moment.",
  "Bouquets made by hand, just for you.",
  "Some feelings are best said with flowers.",
  "Blooms that make someone's day."
];

let sentenceNumber = 0;  // which sentence we are on
let letterCount = 0;     // how many letters are showing right now
let deleting = false;    // false = typing, true = deleting

function typeSentence() {
  const sentence = sentences[sentenceNumber];

  // add one letter when typing, remove one when deleting
  if (deleting === false) {
    letterCount = letterCount + 1;
  } else {
    letterCount = letterCount - 1;
  }

  // show only the first letters of the sentence
  typingText.textContent = sentence.substring(0, letterCount);

  // typing is slower than deleting
  let delay = 80;
  if (deleting === true) {
    delay = 40;
  }

  if (deleting === false && letterCount === sentence.length) {
    // the whole sentence is typed, wait a bit and then start deleting
    deleting = true;
    delay = 1800;
  } else if (deleting === true && letterCount === 0) {
    // everything is deleted, go to the next sentence (and back to the first one at the end)
    deleting = false;
    sentenceNumber = sentenceNumber + 1;
    if (sentenceNumber === sentences.length) {
      sentenceNumber = 0;
    }
    delay = 500;
  }

  setTimeout(typeSentence, delay);
}

// only start it on pages that have the typing span
if (typingText !== null) {
  typeSentence();
}

// run once when the page loads
updateCart();
