
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

const createPostElement = ({ channelId, title, link }) => {
  const postElement = document.createElement('li');
  postElement.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
  postElement.dataset.channelId = channelId;
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

export default (data, type) => {
  const createElementFunction = {
    channel: createChannelElement,
    post: createPostElement,
  };

  const listId = {
    channel: 'feed-list',
    post: 'post-list',
  };

  const list = document.getElementById(listId[type]);

  if (type !== 'post') {
    list.innerHTML = '';
  }

  data.forEach((item) => {
    list.prepend(createElementFunction[type](item));
  });
};
