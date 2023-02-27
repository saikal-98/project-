let API = "http://localhost:8000/products";
console.log("Han from Tokyo Drift");

// ?переменные для инпутов: добавление товаров
let title = document.querySelector("#title");
let price = document.querySelector("#price");
let descr = document.querySelector("#descr");
let image = document.querySelector("#image");
let btnAdd = document.querySelector("#btn-add");

// ? переменные для инпутов: редактирование товаров
let editTitle = document.querySelector("#edit-title");
let editPrice = document.querySelector("#edit-price");
let editDescr = document.querySelector("#edit-descr");
let editImage = document.querySelector("#edit-image");
let editSaveBtn = document.querySelector("#btn-save-edit");
let exampleModal = document.querySelector("#exampleModal");

// ?блок, куда добавляются карточки
let list = document.querySelector("#product-list");

// ?пагинация

let paginationList = document.querySelector(".pagination-list");
let prev = document.querySelector(".prev");
let next = document.querySelector(".next");

let currentPage = 1;
let pageTotalCount = 1; //? общее количество страниц

// ?search
let search = document.querySelector("#search");
let searchVal = "";

btnAdd.addEventListener("click", async () => {
  // ? формируем объект с данными из инпута
  let obj = {
    title: title.value,
    price: price.value,
    descr: descr.value,
    image: image.value,
  };
  // ? проверка на заполненность
  if (
    !obj.title.trim() ||
    !obj.price.trim() ||
    !obj.descr.trim() ||
    !obj.image.trim()
  ) {
    alert("заполните поля!");
    return;
  }
  // ? отправляем POST запрос
  await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(obj),
  });
  // ? очищаем инпуты после добавление
  title.value = "";
  price.value = "";
  descr.value = "";
  image.value = "";
  render();
});

// ?функция для отображения карточек продукта

async function render() {
  // ?получаем список продуктов с сервера
  let res = await fetch(`${API}?q=${searchVal}&_page=${currentPage}&_limit=3`);
  let products = await res.json();

  drawPaginationButtons();

  // ? очищаем list
  list.innerHTML = "";

  // ? перебираем массив products
  products.forEach((element) => {
    // ? создаем новый div
    let newElem = document.createElement("div");
    // ? задаем Id новому div
    newElem.id = element.id;

    // ? помещаем карточку из bootstrap в созданный div
    newElem.innerHTML = `<div class="card m-5 " style="width: 18rem;">
    <img src="${element.image}" class="card-img-top" alt="...">
    <div class="card-body">
      <h5 class="card-title">${element.title}</h5>
      <p class="card-text">${element.descr}</p>
      <p class="card-text">${element.price}</p>

      <a href="#" id=${element.id} class="btn btn-danger btn-delete">DELETE</a>
      <a href="#" id=${element.id} class="btn btn-warning btn-edit " data-bs-toggle="modal" data-bs-target="#exampleModal">EDIT</a>
    </div>
  </div>
    `;

    // ?добавляем созданный div с карточкой внутри в list
    list.append(newElem);
  });
}
render();

// ? удаление продукта

// ?вешаем слушатель событий на весь document
document.addEventListener("click", (e) => {
  // ? делаем проверку для того чтобы отлавливать клик именно по эл-ту с классом btn-delete
  if (e.target.classList.contains("btn-delete")) {
    //  ? вытаскиваем id
    let id = e.target.id;
    // ? делаем запрос на удаление
    fetch(`${API}/${id}`, { method: "DELETE" }).then(() => render()); //? вызываем render для отображения актуальных данных
  }
});

// ?редактирование продукта

// ? оплавливаем клик по кнопке edit
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn-edit")) {
    // ?вытаскиваем id
    let id = e.target.id;

    // ?получаем данные редактируемого продукта
    fetch(`${API}/${id}`)
      .then((res) => res.json())
      .then((data) => {
        // ? заполняем инпуты модального окна данными которые стянули с сервера
        editTitle.value = data.title;
        editPrice.value = data.price;
        editDescr.value = data.descr;
        editImage.value = data.image;

        // ? задаем id кнопке save changes
        editSaveBtn.setAttribute("id", data.id);
      });
  }
});

// ? функция для отправки отредактированных данных на сервер

editSaveBtn.addEventListener("click", function () {
  let id = this.id;

  // ? вытаскиваем данные из инпутов модального окна
  let title = editTitle.value;
  let price = editPrice.value;
  let descr = editDescr.value;
  let image = editImage.value;

  // ?проаерка на заполненность
  if (!title.trim() || !descr.trim() || !price.trim() || !image.trim()) {
    alert("заполните поля");
    return;
  }

  // ? формируем обьект на основе данных из инпута
  let editedProduct = {
    title: title,
    price: price,
    descr: descr,
    image: image,
  };

  // ?вызываем функцию для сохранения на сервере
  saveEdit(editedProduct, id);
});

// ?функция для сохранения на сервере
function saveEdit(editedProduct, id) {
  fetch(`${API}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(editedProduct),
  }).then(() => render());

  // ?закрываем модальное окно
  let modal = bootstrap.Modal.getInstance(exampleModal);
  modal.hide();
}

// ?pagination

// ?функция для отрисовки кнопок пагинации
function drawPaginationButtons() {
  // ? отправляем запрос для получения общего кол-во продуктов
  fetch(`${API}?q=${searchVal}`)
    .then((res) => res.json())
    .then((data) => {
      // ? расчитываем общее кол-во страниц
      pageTotalCount = Math.ceil(data.length / 3);

      console.log(pageTotalCount);
      paginationList.innerHTML = ""; //? очищаем
      for (let i = 1; i <= pageTotalCount; i++) {
        // ? создаем кнопки с  цифрами и для текущей страницы задаем класс active
        if (currentPage == i) {
          let page1 = document.createElement("li");
          page1.innerHTML = `<li class="page-item active"><a class="page-link page_number" href="#">${i}</a></li>`;

          paginationList.append(page1);
        } else {
          let page1 = document.createElement("li");
          page1.innerHTML = `<li class="page-item "><a class="page-link page_number" href="#">${i}</a></li>`;

          paginationList.append(page1);
        }
      }
      // ?красим в серый цвет prev/next кнопки

      if (currentPage == 1) {
        prev.classList.add("disabled");
      } else {
        prev.classList.remove("disabled");
      }

      if (currentPage == pageTotalCount) {
        next.classList.add("disabled");
      } else {
        next.classList.remove("disabled");
      }
    });
}

//? слушатель событий для кнопки prev
prev.addEventListener("click", () => {
  // ? делаем проверку на то не находимся ли мы на первой странице
  if (currentPage <= 1) {
    return;
  }
  // ? если не находимся на первой странице то перезаписываем currentPage и вызываем render
  currentPage--;
  render();
});

next.addEventListener("click", () => {
  if (currentPage >= pageTotalCount) {
    return;
  }
  currentPage++;
  render();
});

// ? отлавливаем клик по цифре из пагинации
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("page_number")) {
    // ? перезаписываем currentPage на то заничение которое содержит эл-т на который нажали
    currentPage = e.target.innerText;
    // ? вызываем render с перезаписанным currentPage
    render();
  }
});

// ?search

search.addEventListener("input", () => {
  searchVal = search.value;
  render();
});
