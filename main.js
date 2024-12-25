//проще лучше
function createEl(tag, className) {
  let el = document.createElement(tag);
  if (className) el.classList.add(className);
  return el;
}

//находим все нужное
let searchIn = document.querySelector(".search-input");
let searchUl = document.querySelector(".search-results");
let savedBox = document.querySelector(".saved-box");

//Переменные для запроса на сервер
const perPageValue = 5;
let numberPage = 1; //не особо нужно, но вдруг пригодиться

//дебоунс
const debounce = (fn, debounceTime) => {
  let idTimeout;
  return function () {
    const currentFn = () => {
      fn.apply(this, arguments);
    };

    clearTimeout(idTimeout);

    idTimeout = setTimeout(currentFn, debounceTime);
  };
};

//пришлось вынести это что бы потом удалить
function addNewResult(e) {
  if (e.target.classList.contains("search-element")) {
    let result = createEl("div", "saved-element");
    let textBlock = createEl("div", "saved-element_text");
    let savedDelBut = createEl("div", "delete");
    let currentEl = e.target;
    console.log(currentEl);
    textBlock.textContent = `Name: ${currentEl.getAttribute(
      "name"
    )}\nOwner: ${currentEl.getAttribute(
      "owner"
    )}\nStars: ${currentEl.getAttribute("stars")}`;
    result.append(textBlock);
    result.append(savedDelBut);
    savedBox.append(result);
    searchIn.value = "";
    clearResults();
  }
}
//тут самая важная, запрос на серв
async function fetching() {
  //если пустое или пробел игнорим
  if (searchIn.value && searchIn.value !== " ") {
    return await fetch(
      `https://api.github.com/search/repositories?q=${searchIn.value}&sort=stars&per_page=${perPageValue}&page=${numberPage}`
    )
      .then((res) =>
        res.json().then((data) => {
          //вытащил результаты
          let repos = data.items;
          //чтото вроде автокомплита
          for (let repo of repos) {
            let el = createEl("li", "search-element");
            el.textContent = repo.name;
            //понадобятся некоторые данные, придам так но думаю можно лучше
            el.setAttribute("name", repo.name);
            el.setAttribute("owner", repo.owner.login);
            el.setAttribute("stars", repo.stargazers_count);

            searchUl.append(el);
          }
          //добавил сюда что бы не заморачиваться с выводом данных
          //Нажимаем, добавляем
          searchUl.addEventListener("click", addNewResult);
        })
      )
      .catch((err) => console.log(err));
  } else {
    clearResults();
  }
  //отработал? уходи
  searchUl.removeEventListener("click", addNewResult);
}
//убери за собой
function clearResults() {
  searchUl.textContent = "";
}
//обернул
const debounceFetching = debounce(fetching, 600);

//запускается движ здесь
searchIn.addEventListener("keyup", (e) => {
  debounceFetching();
  clearResults();
});

//удаляем
savedBox.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete")) {
    let parent = e.target.parentElement;
    parent.remove();
  }
});
