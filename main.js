//проще лучше
function createEl(tag, className) {
  let el = document.createElement(tag);
  if (className) el.classList.add(className);
  return el;
}

//находим все нужное
let searchInput = document.querySelector(".search-input");
let searchResults = document.querySelector(".search-results");
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
  console.log("vvv");
  console.log(e);
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
    searchInput.value = "";
    clearResults();
  }
}

async function autoResults(repos) {
  const currentAutoResults = searchResults.childElementCount;
  if (currentAutoResults) {
    clearResults();
  }
  for (let repo of repos) {
    let el = createEl("li", "search-element");
    el.textContent = repo.name;
    el.setAttribute("name", repo.name);
    el.setAttribute("owner", repo.owner.login);
    el.setAttribute("stars", repo.stargazers_count);
    searchResults.append(el);
  }
}

//тут самая важная, запрос на серв
async function fetching(e) {
  searchResults.removeEventListener("click", addNewResult);
  const currentValue = e.target.value;
  if (currentValue) {
    const res = await fetch(
      `https://api.github.com/search/repositories?q=${currentValue}&sort=stars&per_page=${perPageValue}&page=${numberPage}`
    );
    const data = await res.json();
    const repos = await data.items;
    autoResults(repos);
    console.log(searchResults);
    searchResults.addEventListener("click", addNewResult);
  } else {
    clearResults();
  }
}
//убери за собой
function clearResults() {
  searchResults.textContent = "";
}
//обернул
const debounceFetching = debounce(fetching, 300);

//запускается движ здесь
searchInput.addEventListener("keyup", (e) => {
  if (e.key !== " ") {
    debounceFetching(e);
  }
  clearResults();
});

searchResults.addEventListener("click", addNewResult);

//удаляем
savedBox.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete")) {
    let parent = e.target.parentElement;
    parent.remove();
  }
});
