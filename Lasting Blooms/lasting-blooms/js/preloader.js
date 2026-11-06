// preloader.js - the loading screen
// This file builds the loading screen with JavaScript, so a page only needs
// the css link and this script line in its <head>.
// It waits until the whole page has loaded, then the curtains open.

// if the loading screen already exists (the script was added twice), do nothing
if (document.querySelector("#loader") === null) {
  const brandName = "Lasting Blooms";
  const messages = [
    "Picking the freshest flowers",
    "Trimming the stems",
    "Tying the ribbons",
    "Adding a little love",
    "Almost ready"
  ];
  const minimumTime = 3000;   // the loading screen stays at least this long (milliseconds)
  const circleLength = 503;   // the length of the progress circle, same number as in the css

  // ----- build the pieces -----

  // every letter of the name gets its own span, and each one starts a bit later than the last
  let letters = "";
  for (let i = 0; i < brandName.length; i++) {
    let letter = brandName[i];
    if (letter === " ") {
      letter = "&nbsp;";
    }
    const delay = 0.8 + i * 0.07;
    letters = letters + '<span style="animation-delay: ' + delay + 's">' + letter + "</span>";
  }

  // 14 petals with a random place, size and speed
  let petals = "";
  for (let i = 0; i < 14; i++) {
    const left = Math.floor(Math.random() * 100);
    const width = 10 + Math.floor(Math.random() * 12);
    const duration = 6 + Math.floor(Math.random() * 6);
    const delay = Math.floor(Math.random() * 10);
    let extraClass = "";
    if (i % 3 === 0) {
      extraClass = " far";
    }
    // the negative delay makes the petals already be falling when the screen opens
    petals = petals +
      '<span class="loader-petal' + extraClass + '" style="left: ' + left + '%; ' +
      "width: " + width + "px; height: " + width * 1.4 + "px; " +
      "animation-duration: " + duration + "s; animation-delay: -" + delay + 's"></span>';
  }

  // ----- put it all together -----
  const loader = document.createElement("div");
  loader.id = "loader";
  loader.setAttribute("role", "status");
  loader.setAttribute("aria-label", "Loading Lasting Blooms");

  loader.innerHTML =
    '<div class="loader-panel loader-left"></div>' +
    '<div class="loader-panel loader-right"></div>' +
    '<div class="loader-content">' +
      '<div class="loader-glow glow-one"></div>' +
      '<div class="loader-glow glow-two"></div>' +
      petals +
      '<div class="loader-center">' +
        '<div class="ring-area">' +
          '<div class="orbit">' +
            '<span class="orbit-dot"></span>' +
            '<span class="orbit-dot"></span>' +
            '<span class="orbit-dot"></span>' +
          "</div>" +
          '<svg class="ring" viewBox="0 0 180 180" aria-hidden="true">' +
            '<circle class="ring-track" cx="90" cy="90" r="80"></circle>' +
            '<circle class="ring-fill" id="ring-fill" cx="90" cy="90" r="80"></circle>' +
          "</svg>" +
          '<img class="loader-logo" src="images/logo.png" alt="Lasting Blooms logo">' +
        "</div>" +
        '<p class="loader-name" aria-hidden="true">' + letters + "</p>" +
        '<p class="loader-by">by Malaki</p>' +
        '<p class="loader-status" aria-hidden="true">' +
          '<span id="loader-message">' + messages[0] + "</span>" +
          '<b id="loader-percent">0%</b>' +
        "</p>" +
      "</div>" +
    "</div>";

  // we use documentElement (the <html> tag) because the <body> does not exist yet
  // when this script runs inside the <head>
  document.documentElement.appendChild(loader);

  // stop the page from scrolling behind the loading screen
  document.documentElement.style.overflow = "hidden";

  const ringFill = document.querySelector("#ring-fill");
  const messageText = document.querySelector("#loader-message");
  const percentText = document.querySelector("#loader-percent");

  // ----- loading logic -----
  const startTime = Date.now();
  let pageLoaded = false;
  let messageNumber = 0;

  // the browser tells us when everything (images too) has loaded
  window.addEventListener("load", function () {
    pageLoaded = true;
  });

  // if something is very slow, do not make people wait more than 8 seconds
  setTimeout(function () {
    pageLoaded = true;
  }, 8000);

  // change the message every 0.6 seconds and stay on the last one
  const messageTimer = setInterval(function () {
    if (messageNumber < messages.length - 1) {
      messageNumber = messageNumber + 1;
      messageText.textContent = messages[messageNumber];
    }
  }, 600);

  // every 30 milliseconds: work out the percent and update the circle and the number
  const progressTimer = setInterval(function () {
    const timePassed = Date.now() - startTime;
    let percent = Math.floor((timePassed / minimumTime) * 100);

    // wait at 90% until the page has really finished loading
    if (percent > 90 && pageLoaded === false) {
      percent = 90;
    }
    if (percent > 100) {
      percent = 100;
    }

    percentText.textContent = percent + "%";
    // 0% = the whole line is hidden (offset 503), 100% = nothing is hidden (offset 0)
    ringFill.style.strokeDashoffset = circleLength - (circleLength * percent) / 100;

    if (percent === 100) {
      clearInterval(progressTimer);
      clearInterval(messageTimer);
      finishLoading();
    }
  }, 30);

  // ----- leaving -----
  function finishLoading() {
    messageText.textContent = "Welcome";

    // 1. everything in the middle fades out
    setTimeout(function () {
      loader.classList.add("leaving");
    }, 500);

    // 2. the two curtains slide open
    setTimeout(function () {
      loader.classList.add("open");
      document.documentElement.style.overflow = "";
    }, 1000);

    // 3. when the curtains are gone, remove the loading screen completely
    setTimeout(function () {
      loader.remove();
    }, 2300);
  }
}