const createChannelElement = ({ title, description }) => {
  const channelElement = document.createElement('li');
  channelElement.classList.add('list-group-item');
  const channelTitle = document.createElement('h5');
  channelTitle.textContent = title;
  const channelDescription = document.createElement('p');
  channelDescription.textContent = description;
  channelElement.append(channelTitle, channelDescription);
  return channelElement;
};

const createPostElement = ({ title, link }) => {
  const postElement = document.createElement('li');
  postElement.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
  const postLink = document.createElement('a');
  postLink.textContent = title;
  postLink.href = link;
  const postDescription = document.createElement('button');
  postDescription.type = 'button';
  postDescription.classList.add('btn', 'btn-info', 'btn-sm');
  postDescription.dataset.target = '#modal';
  postDescription.dataset.toggle = 'modal';

  postDescription.textContent = 'Описание';
  postElement.append(postLink, postDescription);
  return postElement;
};

const feedList = document.getElementById('feed-list');
const postList = document.getElementById('post-list');

export default (state) => {
  feedList.innerHTML = '';
  postList.innerHTML = '';
  state.channels.forEach(channel => feedList.append(createChannelElement(channel)));
  state.posts.forEach(post => postList.append(createPostElement(post)));
};
