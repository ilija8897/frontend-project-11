const rssParser = (rss) => {
  const domParser = new DOMParser();
  const rssHtml = domParser.parseFromString(rss, 'text/xml');

  const isError = rssHtml.querySelector('parsererror');
  if (isError) {
    throw new Error('Parser error');
  }

  const titleText = rssHtml.querySelector('channel > title').textContent;
  const descriptionText = rssHtml.querySelector(
    'channel > description',
  ).textContent;

  const itemElements = rssHtml.querySelectorAll('channel item');
  const posts = [...itemElements].map((post) => {
    const titleElement = post.querySelector('title');
    const title = titleElement.textContent;
    const linkElement = post.querySelector('link');
    const link = linkElement.textContent;
    const descriptionElement = post.querySelector('description');
    const description = descriptionElement.textContent;
    return { title, link, description };
  });
  return { title: titleText, description: descriptionText, posts };
};

export default rssParser;
