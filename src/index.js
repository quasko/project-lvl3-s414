import '@babel/polyfill';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import validator from 'validator';

const state = {
  channels: [],
  posts: []
};

const getTitle = (node) => node.querySelector('title').textContent;
const getDescription = (node) => node.querySelector('description').textContent;
const getLink = (node) => node.querySelector('link').textContent;


const getNodeData = (node) => {
  //console.log(node);
  return {
    title: getTitle(node),
    description: getDescription(node),
    link: getLink(node),
  }
}

const onInput = (event) => {
  const target = event.target;
  if(validator.isURL(target.value)) {
    console.log('url')
  } else {
    console.log('hz')
  }
  
};

const inputURL = document.getElementById('input');
const submitButton = document.getElementById('button');
const form = document.getElementById('form');
const error = document.getElementById('error');
const feedList = document.getElementById('feed-list');
const postList = document.getElementById('post-list');
const feedback = document.getElementById('feedback');

const checkDuplicationURL = (url) => {
  //console.log(state.channels.includes(url));
  return state.channels.filter(channel => channel.url === url).length > 0;
}

const disableButton = () => {
  submitButton.disabled = true;
  submitButton.textContent = "Loading...";
}

const enableButton = () => {
  submitButton.disabled = false;
  submitButton.textContent = 'Add';
}

const onSubmit = (event) => {
  event.preventDefault();
  disableButton();
  const url = inputURL.value;
  if(checkDuplicationURL(url)) {
    inputURL.classList.remove('is-valid');
    inputURL.classList.add('is-invalid');
    feedback.textContent = 'URL already Added';
    feedback.classList.add('invalid-feedback');
    enableButton();
    return;
  }

  if (validator.isURL(url)) {
    inputURL.classList.remove('is-invalid');
    inputURL.classList.add('is-valid');
    getRss(url);
    
  } else {
    inputURL.classList.remove('is-valid');
    inputURL.classList.add('is-invalid');
  }
   
};

input.addEventListener('input', onInput);
form.addEventListener('submit', onSubmit, false);

const getChannelElement = ({ title, description }) => {
  const channelElement = document.createElement('li');
  channelElement.classList.add('list-group-item');
  const channelTitle = document.createElement('h5');
  channelTitle.textContent = title;
  const channelDescription = document.createElement('p');
  channelDescription.textContent = description;
  channelElement.append(channelTitle, channelDescription);
  return channelElement;
}

const getPostElement = ({ title, link }) => {
  const postElement = document.createElement('li');
  postElement.classList.add('list-group-item');
  const postLink = document.createElement('a');
  postLink.textContent = title;
  postLink.href = link;
  postElement.append(postLink);
  return postElement;
}

const render = () => {
  state.channels.forEach(channel => feedList.append(getChannelElement(channel)));
  state.posts.forEach(post => postList.append(getPostElement(post)));

}

const getRss = (url) => {
  const CORSProxy = 'https://cors.io/?';
  //const url = 'http://lorem-rss.herokuapp.com/feed';
  const parser = new DOMParser();
  

  axios.get(`${CORSProxy}${url}`).then((response) => {
    enableButton();
    const { data } = response;
    const doc = parser.parseFromString(data, 'text/xml');
    //console.log(doc);
    //const channelTitle = getChannelTitle(doc);
    const { title, description, link } = getNodeData(doc);
    window.xml = doc;
    const channelItems = [...doc.querySelectorAll('item')].map(getNodeData);
    
    state.channels.push({
      title,
      description,
      url
    });
    state.posts = state.posts.concat(channelItems);
    console.log(state);
    render();
  }).catch(e => {
    enableButton();
    feedback.textContent = e;
  });
};

const showError = (e) => {
  error.textContent = e;
}




