import '@babel/polyfill';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/js/dist/modal';
import axios from 'axios';
import validator from 'validator';
import WatchJS from 'melanke-watchjs';
import render from './render';

const state = {
  channels: [],
  posts: [],
};

const inputURL = document.getElementById('input');
const submitButton = document.getElementById('button');
const form = document.getElementById('form');
const feedback = document.getElementById('feedback');

const disableForm = () => {
  submitButton.disabled = true;
  submitButton.textContent = 'Loading...';
  inputURL.readOnly = true;
  inputURL.classList.remove('is-valid');
};

const enableForm = () => {
  inputURL.classList.remove('is-valid');
  submitButton.disabled = false;
  submitButton.textContent = 'Add';
  inputURL.readOnly = false;
};

const getTitle = node => node.querySelector('title').textContent;
const getDescription = node => node.querySelector('description').textContent;
const getLink = node => node.querySelector('link').textContent;

const getNodeData = node => ({
  title: getTitle(node),
  description: getDescription(node),
  link: getLink(node),
});

const parse = (url) => {
  const CORSProxy = 'https://cors.io/?';
  const parser = new DOMParser();

  axios.get(`${CORSProxy}${url}`).then((response) => {
    enableForm();
    inputURL.value = '';
    const { data } = response;
    const doc = parser.parseFromString(data, 'text/xml');
    const { title, description } = getNodeData(doc);
    window.xml = doc;
    const channelItems = [...doc.querySelectorAll('item')].map(getNodeData);

    state.channels.push({
      title,
      description,
      url,
    });
    state.posts = state.posts.concat(channelItems);
  }).catch((err) => {
    enableForm();
    feedback.textContent = err;
    feedback.classList.add('text-danger');
  });
};

const { watch } = WatchJS;

watch(state, 'channels', () => render(state));

const onInput = () => {
  if (inputURL.value === '') {
    inputURL.classList.remove('is-valid', 'is-invalid');
    feedback.classList.remove('text-danger');
    feedback.textContent = '';
  }
};

const checkDuplicationURL = url => state.channels.filter(channel => channel.url === url).length > 0;

const onSubmit = (event) => {
  event.preventDefault();
  const url = inputURL.value;
  if (checkDuplicationURL(url)) {
    inputURL.classList.remove('is-valid');
    inputURL.classList.add('is-invalid');
    feedback.textContent = 'URL already added';
    feedback.classList.add('text-danger');
    enableForm();
    return;
  }

  if (validator.isURL(url)) {
    disableForm();
    inputURL.classList.remove('is-invalid');
    inputURL.classList.add('is-valid');
    parse(url);
  } else {
    inputURL.classList.remove('is-valid');
    inputURL.classList.add('is-invalid');
  }
};

inputURL.addEventListener('input', onInput);
form.addEventListener('submit', onSubmit, false);

const modalBody = document.querySelector('.modal-body');
const modalTitle = document.querySelector('.modal-title');
const findPostDescription = title => state.posts.find(post => post.title === title).description;

const postList = document.getElementById('post-list');

postList.addEventListener('click', (event) => {
  const { target } = event;
  if (target.type === 'button') {
    const postTitle = target.previousSibling.textContent;
    const description = findPostDescription(postTitle);
    modalTitle.textContent = postTitle;
    modalBody.textContent = description;
  }
});
