import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/js/dist/modal';
import axios from 'axios';
import validator from 'validator';
import { watch } from 'melanke-watchjs';
import render from './render';
import parser from './parser';

export default () => {
  const state = {
    channels: [],
    posts: [],
    form: {
      enabled: true,
      errorText: null,
    },
    modal: {
      title: null,
      body: null,
    },
    url: {
      value: null,
      valid: null,
    },
  };

  const input = document.getElementById('input');
  const submitButton = document.getElementById('button');
  const form = document.getElementById('form');
  const feedback = document.getElementById('feedback');

  const disableForm = () => {
    submitButton.disabled = true;
    submitButton.textContent = 'Loading...';
    input.readOnly = true;
    input.classList.remove('is-valid');
  };

  const enableForm = () => {
    input.classList.remove('is-valid');
    submitButton.disabled = false;
    submitButton.textContent = 'Add';
    input.readOnly = false;
  };

  const parse = (url) => {
    const CORSProxy = 'https://cors.io/?';

    axios.get(`${CORSProxy}${url}`).then((response) => {
      const { data } = response;
      const doc = parser(data);
      if (!doc) {
        state.url.valid = false;
        state.form.enabled = true;
        state.form.errorText = 'Invalid URL, no RSS data';
        return;
      }

      const { title, description, channelItems } = doc;
      state.channels.push({
        title,
        description,
        url,
      });
      state.posts = state.posts.concat(channelItems);
      state.form.enabled = true;
      state.url.value = '';
    }).catch((err) => {
      state.form.enabled = true;
      state.form.errorText = err;
    });
  };

  watch(state, 'channels', () => render(state.channels, 'channel'));
  watch(state, 'posts', () => render(state.posts, 'post'));

  watch(state, 'form', () => {
    const formState = {
      true: enableForm,
      false: disableForm,
    };
    formState[state.form.enabled]();
    const { errorText } = state.form;
    feedback.textContent = errorText;
    if (errorText !== '') {
      feedback.classList.add('text-danger');
    } else {
      feedback.classList.remove('text-danger');
    }
  });

  watch(state, 'modal', () => {
    const modalBody = document.querySelector('.modal-body');
    const modalTitle = document.querySelector('.modal-title');
    const { modal } = state;
    const findPostDescription = title => state.posts.find(post => post.title === title).description;
    modalTitle.textContent = modal;
    modalBody.textContent = findPostDescription(modal);
  });

  watch(state, 'url', () => {
    input.value = state.url.value;
    const { value, valid } = state.url;
    if (value === '') {
      input.classList.remove('is-valid', 'is-invalid');
      feedback.classList.remove('text-danger');
      feedback.textContent = '';
      return;
    }

    if (validator.isURL(value)) {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
    } else {
      input.classList.remove('is-valid');
    }

    if (!valid) {
      input.classList.add('is-invalid');
    } else {
      input.classList.remove('is-invalid');
    }
  });

  const onInput = (event) => {
    state.url.value = event.target.value;
    state.url.valid = true;
    state.form.errorText = null;
  };

  const checkDuplicationURL = url => state.channels
    .filter(channel => channel.url === url).length > 0;

  const onSubmit = (event) => {
    event.preventDefault();
    const url = state.url.value;
    if (checkDuplicationURL(url)) {
      state.form.enabled = true;
      state.form.errorText = 'URL already added';
      return;
    }

    if (validator.isURL(url)) {
      state.form.enabled = false;
      state.url.valid = true;
      parse(url);
    } else {
      state.url.valid = false;
      state.form.errorText = 'Invalid URL';
    }
  };

  input.addEventListener('input', onInput);
  form.addEventListener('submit', onSubmit, false);

  const postList = document.getElementById('post-list');

  postList.addEventListener('click', (event) => {
    const { target } = event;
    if (target.type === 'button') {
      const postTitle = target.previousSibling.textContent;
      state.modal = postTitle;
    }
  });
};
