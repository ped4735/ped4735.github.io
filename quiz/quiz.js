// https://stackoverflow.com/questions/7394748/whats-the-right-way-to-decode-a-string-that-has-special-html-entities-in-it/7394787#7394787
function decodeHtml(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

var question;
let current_category = "";
let current_difficulty = "";
let activeQuestionRequest = 0;
let nextQuestionTimer = null;

const question_display = document.querySelector(".question");
const alternatives = document.querySelectorAll(".answer-button");
const status_display = document.querySelector(".quiz-status");
const next_button = document.querySelector(".button-next");
const refresh_button = document.querySelector(".button-refresh");

window.onload = function () {
  getQuestionFromAPI();
  getCategoriesFromAPI();
};

next_button.onclick = function () {
  getQuestionFromAPI();
};

refresh_button.onclick = function () {
  getQuestionFromAPI();
};

$("select#my-select-dif").change(function () {
  current_difficulty = this.value;
  getQuestionFromAPI();
});

$("select#my-select-cat").change(function () {
  current_category = this.value;
  getQuestionFromAPI();
});

$(".answer-button").click(function () {
  if (!question || this.disabled) {
    return;
  }

  setAnswersDisabled(true);
  $(".button-next").attr("disabled", "disabled");

  $(".answer-button").each((i, e) => {
    if (decodeHtml(question.correct_answer) == e.dataset.answer) {
      $(e).addClass("success");
    } else {
      $(e).addClass("error");
    }
  });

  setStatus("Proxima pergunta em instantes...");
  nextQuestionTimer = setTimeout(getQuestionFromAPI, 2000);
});

function setStatus(message, isError) {
  status_display.textContent = message || "";
  status_display.classList.toggle("error", Boolean(isError));
}

function setAnswersDisabled(disabled) {
  $(".answer-button").prop("disabled", disabled);
}

function resetDefaultBtns() {
  $(".button-next").removeAttr("disabled");
  $(".button-refresh").removeAttr("disabled");
  $(".answer-button").removeClass("success error loading");
  question_display.classList.remove("loading");
  setAnswersDisabled(false);
}

function setLoadingState() {
  window.clearTimeout(nextQuestionTimer);
  question = null;
  question_display.textContent = "Carregando pergunta...";
  question_display.classList.add("loading");
  alternatives.forEach((alternative) => {
    alternative.textContent = "";
    alternative.dataset.answer = "";
    alternative.classList.add("loading");
  });
  setAnswersDisabled(true);
  $(".button-next").attr("disabled", "disabled");
  $(".button-refresh").removeAttr("disabled");
  setStatus("");
}

function getQuestionFromAPI() {
  let requestId = activeQuestionRequest + 1;
  activeQuestionRequest = requestId;
  setLoadingState();

  $.ajax({
    url: `https://opentdb.com/api.php?amount=1&category=${current_category}&difficulty=${current_difficulty}&type=multiple`,
    context: document.body,
    success: function (data) {
      if (requestId !== activeQuestionRequest) {
        return;
      }

      if (!data.results || !data.results.length) {
        showEmptyState();
        return;
      }

      resetDefaultBtns();
      showQuestion(data);
    },
    error: function () {
      if (requestId !== activeQuestionRequest) {
        return;
      }

      showErrorState();
    },
  });
}

function getCategoriesFromAPI() {
  $.ajax({
    url: "https://opentdb.com/api_category.php",
    context: document.body,
    success: function (data) {
      loadCategories(data);
    },
  });
}

function loadCategories(data) {
  let select = document.querySelector("#my-select-cat");
  let categories = data.trivia_categories;

  for (let i = 0; i < categories.length; i++) {
    let opt = document.createElement("option");

    let name = categories[i].name;
    if (name.indexOf(":") > 0) {
      name = name.slice(name.indexOf(":") + 1);
    }
    opt.value = categories[i].id;
    opt.innerHTML = name;
    select.appendChild(opt);
  }
}

function showQuestion(data) {
  question = data.results[0];
  question_display.innerHTML = decodeHtml(data.results[0].question);

  let answers = data.results[0].incorrect_answers.slice();
  answers.push(data.results[0].correct_answer);
  shuffleArray(answers);

  for (let i = 0; i < alternatives.length; i++) {
    alternatives[i].textContent = decodeHtml(answers[i]);
    alternatives[i].dataset.answer = decodeHtml(answers[i]);
  }
}

function showEmptyState() {
  clearLoadingState();
  question_display.textContent = "Nenhuma pergunta encontrada para estes filtros.";
  setStatus("Tente outra categoria ou dificuldade.", true);
  setAnswersDisabled(true);
  $(".button-next").removeAttr("disabled");
  $(".button-refresh").removeAttr("disabled");
}

function showErrorState() {
  clearLoadingState();
  question_display.textContent = "Nao foi possivel carregar a pergunta.";
  setStatus("Use Recarregar para tentar buscar outra pergunta.", true);
  setAnswersDisabled(true);
  $(".button-next").removeAttr("disabled");
  $(".button-refresh").removeAttr("disabled");
}

function clearLoadingState() {
  question_display.classList.remove("loading");
  $(".answer-button").removeClass("loading success error");
}
