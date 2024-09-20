(() => {
  // Selectors
  const inputElm = document.querySelector(".inputText");
  const filteredInputElm = document.querySelector("#filter");
  const msgElm = document.querySelector(".msg");
  const collectionElm = document.querySelector(".collection");
  const wordLimitElm = document.querySelector(".word-limit");
  const submitBtnElm = document.querySelector(".submit-btn button");

  const form = document.querySelector("form");

  const MAX_CHAR_LIMIT = 250;
  wordLimitElm.textContent = `Characters left: ${MAX_CHAR_LIMIT}`;

  let tweets = JSON.parse(localStorage.getItem("storedTweets")) || [];
  let editingTweetId = null;

  function receivedInput() {
    return inputElm.value.trim();
  }

  function clearMessage() {
    msgElm.textContent = "";
  }

  function showMessage(msg, action = "success") {
    const textMsg = `<div class='alert alert-${action}' role='alert'>${msg}</div>`;
    msgElm.insertAdjacentHTML("afterbegin", textMsg);
    setTimeout(clearMessage, 2000);
  }
  function resetInput() {
    inputElm.value = "";
    editingTweetId = null;
    updateWordLimit();
  }

  function addOrUpdateTweet(tweet) {
    const timestamp = new Date().toLocaleString();
    if (editingTweetId) {
      const tweetIndex = tweets.findIndex((t) => t.id === editingTweetId);
      if (tweetIndex !== -1) {
        tweets[tweetIndex].tweet = tweet;
        submitBtnElm.textContent = "Submit";
        tweets[tweetIndex].timestamp = timestamp;
        showMessage("Tweet updated successfully!", "success");
      }
    } else {
      const tweetObj = {
        id: tweets.length ? tweets[tweets.length - 1].id + 1 : 1,
        tweet,
        timestamp,
      };
      tweets.push(tweetObj);
      showMessage("Tweet added successfully!", "success");
    }
  }

  function showTweetToUI(tweetInfo) {
    const { id, tweet, timestamp } = tweetInfo;
    const elm = `
    <li class="list-group-item collection-item d-flex flex-row justify-content-between" data-tweetid="${id}">
      <div class="tweet p-2 text-justify">
        ${tweet}
        <p class="text-muted small">Posted on: ${timestamp}</p> <!-- Display timestamp -->
      </div>
      <div class="action-btn p-2">
        <i class="fa fa-pencil-alt" data-id="${id}"></i>
        <i class="fa fa-trash-alt" data-id="${id}"></i>
      </div>
    </li>`;
    collectionElm.insertAdjacentHTML("afterbegin", elm);
  }

  function addTweetToStorage() {
    localStorage.setItem("storedTweets", JSON.stringify(tweets));
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const tweet = receivedInput();
    if (!tweet) {
      showMessage("Please enter a tweet!", "danger");
      return;
    }

    addOrUpdateTweet(tweet);
    addTweetToStorage();
    refreshTweetUI();
    resetInput();
  }

  function refreshTweetUI() {
    collectionElm.innerHTML = "";
    tweets.forEach(showTweetToUI);
  }

  function loadTweets() {
    refreshTweetUI();
  }

  function filterTweets() {
    const filterText = filteredInputElm.value.toLowerCase();
    const filteredTweets = tweets.filter((tweet) =>
      tweet.tweet.toLowerCase().includes(filterText)
    );

    collectionElm.innerHTML = "";
    filteredTweets.forEach(showTweetToUI);
  }

  function updateWordLimit() {
    const remainingChars = MAX_CHAR_LIMIT - inputElm.value.length;
    wordLimitElm.textContent = `Characters left: ${remainingChars}`;
  }

  function handleManipulateTweet(e) {
    const target = e.target;
    const tweetId = parseInt(target.dataset.id);

    if (target.classList.contains("fa-trash-alt")) {
      // Delete tweet logic
      tweets = tweets.filter((tweet) => tweet.id !== tweetId);
      addTweetToStorage(); // Update local storage
      refreshTweetUI(); // Reload tweets
      showMessage("Tweet deleted successfully!", "danger");
    } else if (target.classList.contains("fa-pencil-alt")) {
      // Edit tweet logic
      const tweetToEdit = tweets.find((tweet) => tweet.id === tweetId);
      if (tweetToEdit) {
        inputElm.value = tweetToEdit.tweet; // Populate input with tweet text
        editingTweetId = tweetToEdit.id; // Set the editing state
        updateWordLimit(); // Update character count for the editing state
        form.querySelector('button[type="submit"]').textContent = "Update Post"; // Change button text to "Update"
        showMessage("Edit your tweet!", "secondary");
      }
    }
  }

  loadTweets();
  updateWordLimit();
  function init() {
    // Event listeners
    form.addEventListener("submit", handleFormSubmit);
    filteredInputElm.addEventListener("input", filterTweets);
    inputElm.addEventListener("input", updateWordLimit);

    // Handle tweet actions (edit/delete)
    collectionElm.addEventListener("click", handleManipulateTweet);
  }
  init();
})();
