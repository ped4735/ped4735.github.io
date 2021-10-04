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

window.onload = function() {
    getQuestionFromAPI();
    getCategoriesFromAPI();
}

var question
let current_category = ""
let current_difficulty = ""
const question_display = document.querySelector('.question');
const alternatives = document.querySelectorAll('.form-control[type="button"]')


document.querySelector('.button-next').onclick = function () {
    getQuestionFromAPI()    
}


/*document.querySelectorAll('select#my-select-dif').forEach(element => {
    element.onchange = function() {
      console.log(this.value)
      current_difficulty = this.value
      getQuestionFromAPI()
    }
  });*/


$('select#my-select-dif').change(function () {
    // console.log(this.value)
    current_difficulty = this.value
    getQuestionFromAPI()
})


/*document.querySelectorAll('select#my-select-cat').forEach(element => {
    element.onchange = function() {
      console.log(this.value)
      current_category = this.value
      getQuestionFromAPI()
    }
  });*/

$('select#my-select-cat').change(function () {
    // console.log(this.value)
    current_category = this.value
    getQuestionFromAPI()
})

$('.form-control[type="button"]').click(function () {
  $('.button-next').attr('disabled','disabled')
  $('.form-control[type="button"]').each((i,e) =>{
    if(decodeHtml(question.correct_answer) == e.value){
      $(e).addClass('success')
    }else{
      $(e).addClass('error')
    }
  })
  setTimeout(getQuestionFromAPI,2000)
})

function resetDefaultBtns() {
  $('.button-next').removeAttr('disabled')
  $('.form-control[type="button"]').removeClass('success error')
}


function getQuestionFromAPI() {
    $.ajax({
        url: `https://opentdb.com/api.php?amount=1&category=${current_category}&difficulty=${current_difficulty}&type=multiple`,
        context: document.body,
        success: function(data){
          //console.log(data)
          resetDefaultBtns()
          showQuestion(data)
        }
    });
}

function getCategoriesFromAPI(){
    $.ajax({
        url: "https://opentdb.com/api_category.php",
        context: document.body,
        success: function(data){
          //console.log(data)
          loadCategories(data)
        }
    });
}

function loadCategories(data) {
    
    let select = document.querySelector('#my-select-cat')
    categories = data.trivia_categories

    for (let i = 0; i < categories.length; i++) {
        //console.log(`${categories[i].id} ${categories[i].name}`)
        let opt = document.createElement('option')

        let name = categories[i].name
        if(name.indexOf(':')>0){
            name = name.slice(name.indexOf(':')+1)
        }
        opt.value = categories[i].id
        opt.innerHTML = name
        select.appendChild(opt)
    }

}

function showQuestion(data) {
    question = data.results[0]
    question_display.innerHTML = decodeHtml(data.results[0].question)

    let answers = data.results[0].incorrect_answers
    answers.push(data.results[0].correct_answer)
    shuffleArray(answers)
    //console.log(question)


    for (let i = 0; i < alternatives.length; i++) {
        alternatives[i].value = decodeHtml(answers[i])
    }

}