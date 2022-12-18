const cafes = cafesForCards
const cardContainer = document.getElementById("card-container");
const cardCountElem = document.getElementById("card-count");
const cardTotalElem = document.getElementById("card-total");
const loader = document.getElementById("loader");

//global limit of loaded cards
const cardLimit = 240;
cardTotalElem.innerHTML = cardLimit;

//increase per step
const cardIncrease = 12;

//how many times might increase happen
const increaseCount = Math.ceil(cardLimit / cardIncrease);

//current page/increase
let currentPage = 1;


//function to create cards (index wil be data)
const createCard = (index) => {
    const colDiv = document.createElement("div");
    colDiv.classList.add("col-lg-4")
    colDiv.classList.add("col-md-6")
    
    const container =  document.createElement("div");
    container.classList.add("container");
    container.classList.add("mt-3");

    const card = document.createElement("div");
    card.classList.add("card");
    card.classList.add("mb-3");


    const row = document.createElement("div");
    row.classList.add("row");

    const colOne = document.createElement("div");
    colOne.classList.add("col-12");

    const img = document.createElement("img")
    img.setAttribute("src", cafes[index].images[0].url);
    img.setAttribute("alt", "img");
    img.classList.add("img-fluid");
    colOne.appendChild(img);
    row.appendChild(colOne);

    const colTwo = document.createElement("div");
    colOne.classList.add("col-12");

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const title = document.createElement("h5");
    title.classList.add("card-title");
    title.style.fontSize = "2rem";
    title.innerHTML = cafes[index].title;
    cardBody.appendChild(title);

    const location = document.createElement("p");
    location.classList.add("card-text");
    location.innerHTML = cafes[index].location;
    cardBody.appendChild(location);

    const desc = document.createElement("p");
    desc.classList.add("card-text");
    
    const small = document.createElement("small");
    small.classList.add("text-muted");
    small.setAttribute("id", "description");
    small.innerHTML = cafes[index].description.slice(0,200) + "...";
    desc.appendChild(small);
    cardBody.appendChild(desc);

    const button = document.createElement("a");
    button.classList.add("btn");
    button.setAttribute("href", "/cafes/" + cafes[index]._id);
    button.innerHTML = "View" + cafes[index].title;
    cardBody.appendChild(button);

    colTwo.appendChild(cardBody)
    row.appendChild(colTwo)
    card.appendChild(row);
    container.appendChild(card);
    colDiv.appendChild(container);
    cardContainer.appendChild(colDiv);
}

//adding cards function
const addCards = (currentPage) => {
    const start = (currentPage - 1) * cardIncrease;
    const end = currentPage == increaseCount ? cardLimit : currentPage * cardIncrease; //if last page then end = cardLimit

    cardCountElem.innerHTML = end; //displays how many cards are being displayed

    for (let i = start + 1; i <= end; i++) {
        createCard(i-1);
    }
}

//diplay first cards on page load
window.onload = () => {
    addCards(currentPage);
}

//removing infinite scroll when everything is loaded
const removeInfinite = () => {
    loader.remove(); //removes loader div
    window.removeEventListener("scroll", infiniteScroll); //removes event listener
}

//slowing down for performance
let throttleTimer = false;

const throttle = (callback, time) => {
    if (throttleTimer) return; //finishes

    throttleTimer = true; //turns to true and waits

    setTimeout(() => {
        callback(); //executes function
        throttleTimer = false; //turns back to false
    }, time);
}

//infinite scrolling
const infiniteScroll = () => {
    throttle(() => {
        //calulates when page ends
        let rows;
        if (window.innerWidth >= 992) {
            rows = cardIncrease/3;
        } else if (window.innerWidth >= 768)  {
            rows = cardIncrease/2;
        }else {
            rows = cardIncrease;
        }
        const pageEnd = window.innerHeight + window.pageYOffset >= document.body.offsetHeight + currentPage * 550 * rows  - window.innerHeight * 0.2 ; 

        //if pageEnd reached add cards
        if (pageEnd) {
            currentPage++;
            addCards(currentPage)
        }

        //if last page remove listener
        if (currentPage == increaseCount) {
            removeInfinite();
        }
    }, 1500)
};

window.addEventListener("scroll", infiniteScroll)

const skeleCard1 = document.createElement("div");
skeleCard1.classList.add("skeleton-card");
const loaderIcon1 = document.createElement("div");
loaderIcon1.classList.add("loader-icon");
const loaderIcon2 = document.createElement("div");
loaderIcon2.classList.add("loader-icon");
const skeleCard2 = document.createElement("div");
skeleCard2.classList.add("skeleton-card");
skeleCard1.appendChild(loaderIcon1);
skeleCard2.appendChild(loaderIcon2);

if (window.innerWidth >= 992) {
    loader.appendChild(skeleCard1);
    loader.appendChild(skeleCard2);
} else if (window.innerWidth >= 768)  {
    loader.appendChild(skeleCard1);
}