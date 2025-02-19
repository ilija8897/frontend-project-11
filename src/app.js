import './style.scss';
import 'bootstrap';
import { string, object } from 'yup';
import { v4 as uuidv4 } from 'uuid';
import i18next from 'i18next';
import axios from 'axios';
import getState from './state.js';
import { PROCESS_STATUS } from './constants.js';
import rssParser from './parser.js';

const appInit = () => {
  const initState = {
    feeds: [],
    posts: [],
    error: false,
    status: PROCESS_STATUS.INIT,
  };

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    errorLabel: document.querySelector('.feedback'),
    feedsList: document.querySelector('.feeds-list'),
    postsList: document.querySelector('.posts-list'),
    button: document.querySelector('form button[type=submit]'),
    title: document.querySelector('.title'),
    modal: document.querySelector('.modal'),
  };

  i18next.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru: {
        translation: {
          succesFeed: 'RSS успешно загружен',
          errors: {
            exist: 'RSS уже существует',
            required: 'Обязательное поле',
            invalidUrl: 'Ссылка должна быть валидным URL',
            invalidRSS: 'Ресурс не содержит валидный RSS',
            networkError: 'Ошибка сети',
            unknownError: 'Неизвестная ошибка. Что-то пошло не так.',
          },
          postButton: 'Просмотр',
        },
      },
    },
  });
  const state = getState(initState, i18next, elements);
  const getProxyUrl = (url) => {
    const urlWithProxy = new URL('/get', 'https://allorigins.hexlet.app');
    urlWithProxy.searchParams.set('url', url);
    urlWithProxy.searchParams.set('disableCache', 'true');
    return urlWithProxy.toString();
  };

  const getRssData = (url) => axios
    .get(getProxyUrl(url))
    .then((res) => {
      const { title, description, items } = rssParser(res.data.contents);
      const feed = {
        url,
        id: uuidv4(),
        title,
        description,
      };
      const postsItems = items.map((item) => ({
        ...item,
        parentFeed: feed.id,
        id: uuidv4(),
      }));
      state.posts.unshift(...postsItems);
      state.feeds.unshift(feed);
      state.error = false;
      state.status = PROCESS_STATUS.SUCCESS;
    })
    .catch((e) => {
      if (e.message === 'Network Error') {
        state.error = 'errors.networkError';
      } else {
        state.error = e.message || 'errors.networkError';
      }

      state.status = PROCESS_STATUS.ERROR;
    });

  const validateUrl = async (url, oldUrlArray) => {
    const formSchema = object({
      url: string()
        .required('errors.required')
        .url('errors.invalidUrl')
        .notOneOf(oldUrlArray, 'errors.exist'),
    });

    return formSchema.validate({ url });
  };

  function updatePosts() {
    const runningUpdates = state.feeds.map((feed) => axios
      .get(getProxyUrl(feed.url))
      .then((res) => {
        const { posts } = rssParser(res.data.contents);
        const updatedPosts = posts.map((post) => ({
          ...post,
          parentFeed: feed.id,
          id: uuidv4(),
        }));
        const oldPosts = state.posts.filter(
          (post) => post.parentFeed === feed.id,
        );
        const newPosts = updatedPosts.filter(
          (updPost) => !oldPosts.some((oldPost) => updPost.title === oldPost.title),
        );
        state.posts.unshift(...newPosts);
      })
      .catch((e) => {
        console.log(e);
      }));

    Promise.all(runningUpdates).finally(() => {
      setTimeout(() => updatePosts(), 5000);
    });
  }

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(e.target);
    const url = data.get('url');
    const oldUrlArray = state.feeds.map((feed) => feed.url);
    validateUrl(url, oldUrlArray)
      .then(async () => {
        state.status = PROCESS_STATUS.SUBMIT;
        await getRssData(url);
      })
      .catch((error) => {
        state.error = error.message;
        state.status = PROCESS_STATUS.ERROR;
      });
  });
  setTimeout(updatePosts, 5000);
};

export default appInit;
