import uniqueId from 'lodash/uniqueId';

export default (data, updateChannelId) => {
  const getTag = (node, tag) => node.querySelector(tag).textContent;
  const id = updateChannelId || uniqueId();

  const getNodeData = node => ({
    title: getTag(node, 'title'),
    description: getTag(node, 'description'),
    link: getTag(node, 'link'),
    pubDate: getTag(node, 'pubDate'),
    isNew: true,
    channelId: id,
  });

  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'text/xml');

  if (doc.firstChild.tagName !== 'rss') {
    return false;
  }

  const { title, description, channelId } = getNodeData(doc);
  const channelItems = [...doc.querySelectorAll('item')].map(getNodeData);

  return {
    channelId,
    title,
    description,
    channelItems,
  };
};
