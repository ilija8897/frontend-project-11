const rssParser = (rss) => {
  const domParser = new DOMParser();
  const rssHtml = domParser.parseFromString(rss, 'text/xml');

  const isError = rssHtml.querySelector('parsererror');
  if (isError) {
    throw new Error('errors.invalidRSS');
  }

  const titleText = rssHtml.querySelector('channel > title').textContent;
  const descriptionText = rssHtml.querySelector(
    'channel > description',
  ).textContent;

  const itemElements = rssHtml.querySelectorAll('channel item');
  const items = [...itemElements].map((item) => {
    const titleElement = item.querySelector('title');
    const title = titleElement.textContent;
    const linkElement = item.querySelector('link');
    const link = linkElement.textContent;
    const descriptionElement = item.querySelector('description');
    const description = descriptionElement.textContent;
    return { title, link, description };
  });
  return { title: titleText, description: descriptionText, items };
};

export default rssParser;
