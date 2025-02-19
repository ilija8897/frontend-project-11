import { PROCESS_STATUS } from './constants.js';

export const formFeedbackReaction = (state, i18next, elements) => {
  const { input, button, errorLabel } = elements;

  if (state.error) {
    errorLabel.textContent = i18next.t(state.error);
  }
  switch (state.status) {
    case PROCESS_STATUS.SUBMIT:
      button.disabled = true;
      input.disabled = true;
      break;
    case PROCESS_STATUS.SUCCESS:
      input.disabled = false;
      button.disabled = false;
      input.value = '';
      input.focus();
      break;
    case PROCESS_STATUS.ERROR:
      input.disabled = false;
      button.disabled = false;
      input.value = '';
      input.focus();
      break;
    default:
      throw new Error(`Unknown status ${state.status}`);
  }
};

export const renderPostReaction = (state, i18next, post) => {
  const { posts } = state;
  const postElement = document.createElement('li');
  postElement.classList.add('d-flex', 'py-3');
  const postLink = document.createElement('a');
  postLink.classList.add(post.readed ? 'fw-normal' : 'fw-bold');
  postLink.textContent = post.title;
  postElement.append(postLink);
  const button = document.createElement('button');
  button.setAttribute('type', 'button');
  button.classList.add('btn', 'btn-outline-primary', 'btn-m');
  button.dataset.id = post.id;
  button.dataset.bsToggle = 'modal';
  button.dataset.bsTarget = '#modal';
  button.textContent = i18next.t('postButton');
  button.addEventListener('click', () => {
    posts.find((item) => item.id === post.id).readed = true;
    postLink.classList.remove('fw-bold');
    postLink.classList.add('fw-normal');
    const modal = document.getElementById('modal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = modal.querySelector('.modal-body');
    modalTitle.textContent = post.title;
    modalBody.textContent = post.description;
  });
  postElement.append(button);
  return postElement;
};

export const renderFeedReaction = (feed, i18next, state) => {
  const { errorLabel } = state;
  const newFeed = document.createElement('li');
  const feedTitle = document.createElement('h5');
  feedTitle.textContent = feed.title;
  const feedDescr = document.createElement('p');
  feedDescr.textContent = feed.description;
  newFeed.append(feedTitle);
  newFeed.append(feedDescr);
  errorLabel.textContent = i18next.t('succesFeed');
  return newFeed;
};
