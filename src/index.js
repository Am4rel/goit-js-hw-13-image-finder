import './styles.css';
import './pnotifyStyles.css';
import "../node_modules/@pnotify/core/dist/PNotify.css";
import "../node_modules/@pnotify/core/dist/BrightTheme.css";

import getImages from "./js/apiService.js";
import makeImageListTpl from "./templates/imagelist.hbs";
import { error, defaultModules } from'@pnotify/core';
import * as PNotifyMobile from '../node_modules/@pnotify/mobile/dist/PNotifyMobile.js';

defaultModules.set(PNotifyMobile, {});

const debounce = require('lodash.debounce');
const API_KEY = "21313402-781cc09b241e8b58cb3e12855";


let page;
let searchQuery;

const refs = {
    "inputField": document.querySelector(".search-form"),
    "gallery": document.querySelector(".gallery"),
    "loadMore": document.querySelector(".loadMore-btn"),
    "modal": document.querySelector(".modal"),
    "body": document.querySelector("body"),
    "modalCloseBtn": document.querySelector(".close-modal"),
    "firFullsizeImg": document.querySelector(".for-fullsize-img"),
}

refs.inputField.addEventListener("input", debounce(onInput, 500))
refs.loadMore.addEventListener("click", onLoadMore)
refs.gallery.addEventListener("click", onImageClick)
refs.modalCloseBtn.addEventListener("click", onCloseModalClick)


async function onInput(event) {
    page = 1;
    searchQuery = event.target.value;
    const markup = await makeImageListMarkup(searchQuery, page, API_KEY);

    if (markup === "") {
        sendErrorMessage("I can't find anything.", "Maybe you missspelled something, try again.");
        return
    } else if (!markup.includes("technical error")) {
        refs.loadMore.removeAttribute("hidden")
    }

    refs.gallery.innerHTML = markup;
    
}

async function onLoadMore(event) {
    page += 1;
    const markup = await makeImageListMarkup(searchQuery, page, API_KEY);
    const buttonCoordinatesY = event.pageY

    if (markup === "") {
        sendErrorMessage("I can't find anything.", "You've got all the images I have.");
        refs.loadMore.setAttribute("hidden", true)
        return
    }

    refs.gallery.insertAdjacentHTML("beforeend", markup);

    setTimeout(() => {
        window.scrollTo({
        top: buttonCoordinatesY,
        left: 0,
        behavior: 'smooth'
    });
    }, 500);
    
}

async function makeImageListMarkup (searchQuery, page, API_KEY) {
    const response = await getImages(searchQuery, page, API_KEY);
    if (response === "error") {
        sendErrorMessage("Service error", "Sorry, I can't send you any image now, try gain later, please.")
        return '<img src="https://i.pinimg.com/originals/96/f2/bb/96f2bb94fcc9d64ca1fba04a1cf45a5e.png" alt="technical error" class="error-img"/>'
    }
    const images = response.hits;
    const markup = makeImageListTpl(images);
    return markup;
}

function onImageClick(event) {
    event.preventDefault();
    const target = event.target;
    const targetClass = target.className;
    if (targetClass === "photo-card_image") {
        const newLink = target.dataset.largeimageurl;
        const newAlt = target.alt;

        const newImgMarkup = `<img src="${newLink}" alt="${newAlt}" class="modal-image_fullsize">`
        refs.modal.classList.add("is-open");
        refs.firFullsizeImg.innerHTML = newImgMarkup;
    }
}

function onCloseModalClick() {
    refs.modal.classList.remove("is-open");
}

function sendErrorMessage(title, text) {
    error({
        title: title,
        text: text,
        type: 'error',
        delay: 3000,
        sticker: false,

    });
}