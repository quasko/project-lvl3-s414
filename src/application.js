import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/js/dist/modal';
import axios from 'axios';
import validator from 'validator';
import { watch } from 'melanke-watchjs';
import maxBy from 'lodash/maxBy';
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

  const updateInterval = 5000;

  const disableForm = () => {
    submitButton.disabled = true;
    submitButton.textContent = 'Loading...';
    input.readOnly = true;
    input.classList.remove('is-valid');
  };

  const enableForm = () => {
    submitButton.disabled = false;
    submitButton.textContent = 'Add';
    input.readOnly = false;
  };

  const updateChannel = (channelId, currentPosts) => {
    const channelPosts = state.posts.filter(post => post.channelId === channelId);
    const lastOldPost = maxBy(channelPosts, post => post.pubDate);
    const newPosts = currentPosts
      .filter(({ pubDate }) => Date.parse(pubDate) > Date.parse(lastOldPost.pubDate));
    state.posts = state.posts
      .reduce((acc, post) => acc.concat({ ...post, isNew: false }), newPosts);
  };

  const parse = (url, updateChannelId = false) => {
    const CORSProxy = 'https://cors.io/?';

    axios.get(`${CORSProxy}${url}`).then((response) => {
      const { data } = response;
      const doc = parser(data, updateChannelId);
      if (!doc) {
        state.url.valid = false;
        state.form.enabled = true;
        state.form.errorText = 'Invalid URL, no RSS data';
        return;
      }

      const {
        title, description, channelItems, channelId,
      } = doc;

      if (updateChannelId) {
        updateChannel(updateChannelId, channelItems);
        setTimeout(() => {
          parse(url, updateChannelId);
        }, updateInterval);
        return;
      }

      state.channels.push({
        channelId,
        title,
        description,
        url,
      });

      state.posts = state.posts.concat(channelItems);

      setTimeout(() => {
        parse(url, channelId);
      }, updateInterval);

      state.form.enabled = true;
      state.url.value = '';
    }).catch((err) => {
      console.log(err);
      state.form.enabled = true;
      state.form.errorText = err;
    });
  };

  watch(state, 'channels', () => render(state.channels, 'channel'));
  watch(state, 'posts', () => render(state.posts.filter(post => post.isNew), 'post'));

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

    modalTitle.textContent = modal.title;
    modalBody.textContent = modal.body;
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

    if (valid) {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
    } else {
      input.classList.remove('is-valid');
      input.classList.add('is-invalid');
    }
  });

  const checkDuplicationURL = url => state.channels
    .filter(channel => channel.url === url).length > 0;

  const onInput = (event) => {
    const { value } = event.target;
    state.url.value = value;

    if (value === '') {
      state.form.errorText = null;
      return;
    }
    if (checkDuplicationURL(value)) {
      state.form.enabled = true;
      state.form.errorText = 'URL already added';
      state.url.valid = false;
      return;
    }

    if (validator.isURL(value)) {
      state.url.valid = true;
      state.form.errorText = '';
    } else {
      state.url.valid = false;
      state.form.errorText = 'Invalid URL';
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const url = state.url.value;
    if (validator.isURL(state.url.value)) {
      parse(url);
      state.form.enabled = false;
    }
  };

  input.addEventListener('input', onInput);
  form.addEventListener('submit', onSubmit, false);

  const postList = document.getElementById('post-list');

  postList.addEventListener('click', (event) => {
    const { target } = event;
    if (target.type === 'button') {
      const postTitle = target.previousSibling.textContent;
      const { channelId } = target.parentNode.dataset;
      const postDescription = state.posts
        .find(post => post.title === postTitle && post.channelId === channelId).description;
      state.modal = {
        title: postTitle,
        body: postDescription,
      };
    }
  });
};
