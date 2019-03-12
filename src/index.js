import '@babel/polyfill';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const state = {
  channels: [],
};

const getChannelTitle = (node) => {
  return node.querySelector('title').textContent;
}

const getItemData = (node) => {
  console.log(node);
  return {
    title: node.querySelector('title').textContent,
    description: node.querySelector('description').textContent,
    link: node.querySelector('link').textContent,
  }
}


const createChannelContainer = ({ title, items }) => {
  const channelContainer = document.createElement('div');
  const channelTitle = document.createElement('h1');
  channelTitle.textContent = title;
  channelContainer.append(channelTitle);
  const list = document.createElement('ul');
  items.forEach((item) => {
    const listElement = document.createElement('li');
    listElement.textContent = item.description;
    
    listElement.append(item.link);
    listElement.append(item.title);
    list.append(listElement);

  });
  channelContainer.append(list);
  return channelContainer;  
};

const render = () => {
  const root = document.getElementById('root');
  
  
  const channelsData = state.channels[0];
  const container = createChannelContainer(channelsData);
  root.append(container);

}

const getRss = () => {
  const CORSProxy = 'https://cors.io/?';
  const RSSfake = 'http://lorem-rss.herokuapp.com/feed';
  const parser = new DOMParser();
  axios.get(`${CORSProxy}${RSSfake}`).then((response) => {
    const { data } = response;
    const doc = parser.parseFromString(data, 'text/xml');
    const channelTitle = getChannelTitle(doc);
    window.xml = doc;
    const channelItems = [...doc.querySelectorAll('item')].map(getItemData);
    
    state.channels.push({
      title: channelTitle,
      items: channelItems,
    });
    console.log(state);
    render();
  });
};

getRss();




