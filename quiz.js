//https://stackoverflow.com/questions/247483/http-get-request-in-javascript
var HttpClient = function () {
  this.get = function (aUrl, aCallback) {
    var anHttpRequest = new XMLHttpRequest();
    anHttpRequest.onreadystatechange = function () {
      if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
        aCallback(anHttpRequest.responseText);
    };

    anHttpRequest.open("GET", aUrl, true);
    anHttpRequest.send(null);
  };
};

//https://stackoverflow.com/questions/7394748/whats-the-right-way-to-decode-a-string-that-has-special-html-entities-in-it/7394787#7394787
function decodeHtml(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const body = document.querySelector("body");
const container = document.querySelector(".container");
const display = document.querySelector(".display");
const ol = document.querySelector("ol");
const statusResp = document.querySelector(".status");

display.style.display = "none";
var resposta;

//Consome API Trivia - HTTP GET
//https://opentdb.com/api_config.php
const client = new HttpClient();
getQuestion();
function getQuestion() { 
  client.get("https://opentdb.com/api.php?amount=1&category=15&type=multiple", function (response) {
    resposta = JSON.parse(response);
    showQuestion(resposta);
  });
}

function showQuestion(questions) {
  display.style.display = "block";
  ol.style.display = "block";
  display.textContent = decodeHtml(questions.results[0].question);
  // console.log(decodeHtml(questions.results[0].question))
  //console.log(questions.results[0])
  //(questions.results[0].correct_answer)
  options = questions.results[0].incorrect_answers;
  options.push(questions.results[0].correct_answer);
  shuffleArray(options);
  for (const question of options) {
    //console.log(question)
    let li = document.createElement("li");
    li.appendChild(document.createTextNode(decodeHtml(question)));
    li.onclick = () => {
      handleChoise(li, questions.results[0].correct_answer);
    };
    ol.appendChild(li);
  }

  function handleChoise(li, correct_answer) {
    if (li.textContent === correct_answer) {
      corretResp();
    } else {
      incorretResp();
    }
    console.log(li.innerHTML);

    setTimeout(getQuestionAfterTime, 1500);
  }

  function corretResp() {
    console.log("correct!");
    Array.from(body.getElementsByClassName("esconder")).forEach((element) => {
      element.style.display = "none";
    });
    statusResp.innerHTML = "CORRETO";
  }

  function incorretResp() {
    console.log("errado!");
    Array.from(body.getElementsByClassName("esconder")).forEach((element) => {
      element.style.display = "none";
    });
    statusResp.innerHTML = "INCORRETO";
  }

  function getQuestionAfterTime() {
    statusResp.innerHTML = "";

    while (ol.firstChild) {
      ol.removeChild(ol.lastChild);
    }

    getQuestion();
  }
}
