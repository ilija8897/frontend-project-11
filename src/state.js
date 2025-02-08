import onChange from 'on-change';
import { formFeedbackReaction, renderFeedReaction, renderPostReaction } from './reactions.js';

const handleFeeds = (state, i18next, elements) => {
  const { feedsList } = elements;
  feedsList
    .replaceChildren(...state.feeds.map((feed) => renderFeedReaction(feed, i18next, elements)));
};

const handlePosts = (state, i18next, elements) => {
  const { posts } = state;

  const postsListItems = posts.map((post) => renderPostReaction(state, i18next, post));

  elements.postsList.replaceChildren(...postsListItems);
};
const handleForm = (state, i18next, elements) => {
  formFeedbackReaction(state, i18next, elements);
};

const appState = (state, i18next, elements) => onChange(state, (path) => {
  switch (path) {
    case 'feeds':
      handleFeeds(state, i18next, elements);
      break;
    case 'posts':
      handlePosts(state, i18next, elements);
      break;
    case 'status':
      handleForm(state, i18next, elements);
      break;
    default:
      break;
  }
});

export default appState;
