/*
 * Sonoma Miller
 * CSE 154 AB
 * 10/26/2024
 *
 * This is the js behavior for cp3. It uses the chicago art institute api to
 * get four random art pieces, display one, and four artist options to guess.
 */
"use strict";
(function() {
  const baseURL = "https://api.artic.edu/api/v1/artworks?fields=id,title,artist_display,date_start,date_end,has_not_been_viewed_much,image_id";
  const exhibitionsURL = "https://api.artic.edu/api/v1/exhibitions";
  window.addEventListener("load", init);
  let score = 0;
  id("content").innerHTML = "";
  let data;
  const oneSec = 1000;

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} id - element ID
   * @return {object} DOM object associated with id.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * sets score to 0, adds skip button functionality, generates first question
   */
  function init() {
    fetchRequest();
    id("skip-button").addEventListener("click", fetchNext);
    id("random-exhibition-button").addEventListener("click", fetchRandomExhibition);
  }

  /**
   * Fetches a random exhibition and redirects to its page
   */
  async function fetchRandomExhibition() {
    try {
      const response = await fetch(exhibitionsURL + "?limit=1&page=random");
      await statusCheck(response);
      const exhibitionData = await response.json();
      const exhibition = exhibitionData.data[0];

      const exhibitionURL = "https://www.artic.edu/exhibitions/" + exhibition.id;
      window.open(exhibitionURL, "_blank");
    } catch (err) {
      handleError("Could not fetch exhibition information :(");
    }
  }

  /**
   * gets the first four random art pieces as json
   */
  async function fetchRequest() {
    id("content").innerHTML = "";
    let url = baseURL + "&query[term][has_not_been_viewed_much]=false&limit=4&page=random";

    try {
      let response = await fetch(url);
      await statusCheck(response);
      data = await response.json();
      displayQ(data);
    } catch (err) {
      handleError("Could not fetch art and artists :(");
    }
  }

  /**
   * fetches four new objects and an image
   */
  async function fetchNext() {
    id("content").innerHTML = "";
    let url = data.pagination.next_url;

    try {
      let response = await fetch(url);
      await statusCheck(response);
      data = await response.json();
      displayQ(data);
    } catch (err) {
      handleError("Could not fetch art and artists :(");
    }
  }

  /**
   * uses the four paintings json to form the question with a correct 3 wrong answers
   * @param {JSON} dataJSON includes next_url to regenerate, and has four objects of paintings
   */
  function displayQ(dataJSON) {
    let paintingContainer = id("question");
    let img = paintingContainer.querySelector("img");

    if (img) {
      paintingContainer.removeChild(img);
    }

    const correctArt = dataJSON.data[0];
    const imgId = correctArt.image_id;
    const imgLink = "https://www.artic.edu/iiif/2/" + imgId + "/full/843,/0/default.jpg";
    img = document.createElement("img");
    img.src = imgLink;
    img.alt = correctArt.title;

    const content = id("content");
    paintingContainer.insertBefore(img, content);

    const correctButton = document.createElement("div");
    const correctArtist = correctArt.artist_display.split("\n")[0];
    correctButton.textContent = correctArtist;
    correctButton.classList.add("card-button", "correct-button");
    correctButton.addEventListener("click", correctClick);
    content.appendChild(correctButton);

    for (let i = 1; i <= 3; i++) {
      const cardButton = document.createElement("div");
      cardButton.classList.add("card-button");
      cardButton.textContent = dataJSON.data[i].artist_display.split("\n")[0];
      cardButton.addEventListener("click", wrongClick);
      content.appendChild(cardButton);
    }
    shuffle();
  }

  /**
   * creates array of buttons, calls shuffle, then displays shuffled buttons
   */
  function shuffle() {
    let container = id("content");
    let elementsArray = Array.prototype.slice.call(container.getElementsByClassName("card-button"));
    elementsArray.forEach(function(element) {
      container.removeChild(element);
    });
    shuffleArray(elementsArray);
    elementsArray.forEach(function(element) {
      container.appendChild(element);
    });
  }

  /**
   * shuffles the four buttons
   * @param {Array} array unshuffled four button divs
   * @returns {Array} shuffled array
   */
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  /**
   * if correct button clicked, +1 score and new question
   */
  function correctClick() {
    this.classList.add("correct");
    score++;
    id("count").textContent = score;
    setTimeout(() => this.classList.remove("correct"), oneSec);
    setTimeout(fetchNext, oneSec);
  }

  /**
   * if wrong button clicked, turn red and new question
   */
  function wrongClick() {
    this.classList.add("wrong");
    setTimeout(() => this.classList.remove("wrong"), oneSec);
    setTimeout(fetchNext, oneSec);
  }

  /**
   * handles error if fetch doesn't resolve
   * @param {Response} response request
   * @returns {Response} req if request is bad
   */
  async function statusCheck(response) {
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response;
  }

  /**
   * takes errors and displays them
   * @param {string} error message to display
   */
  function handleError(error) {
    let errorContainer = id("question").querySelector(".error");
    if (!errorContainer) {
      errorContainer = document.createElement("p");
      errorContainer.classList.add("error");
      id("question").appendChild(errorContainer);
    }
    errorContainer.textContent = error;
  }
})();