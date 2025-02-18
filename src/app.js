import './style.scss';
import 'bootstrap';
import { string, object } from 'yup';
import { v4 as uuidv4 } from 'uuid';
import i18next from 'i18next';
import axios from 'axios';
import getState from './state.js';
import { FORM_STATUS } from './constants.js';
import rssParser from './parser.js';

const appInit = () => {
  const initState = {
    feeds: [],
    posts: [],
    error: false,
    status: FORM_STATUS.INIT,
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
      const { title, description, posts } = rssParser(res.data.contents);
      const feed = {
        url,
        id: uuidv4(),
        title,
        description,
      };
      const postsItems = posts.map((item) => ({
        ...item,
        parentFeed: feed.id,
        id: uuidv4(),
      }));
      state.posts.unshift(...postsItems);
      state.feeds.unshift(feed);
      state.error = false;
      state.status = FORM_STATUS.SUCCESS;
    })
    .catch((e) => {
      console.log('res', e);
      console.log('res', e.message);
      console.log('res', e.isAxiosError);
      if (e.message === 'Network Error') {
        state.error = 'errors.networkError';
      } else {
        state.error = e.message || 'errors.networkError';
      }

      state.status = FORM_STATUS.ERROR;
    });

  const validateNewFeed = async (url, createdFeeds) => {
    const formSchema = object({
      url: string()
        .required(i18next.t('errors.required'))
        .url(i18next.t('errors.invalidUrl'))
        .notOneOf(createdFeeds, i18next.t('errors.exist')),
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
          state.error = false;
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
    const createdFeedsUrl = state.feeds.map((feed) => feed.url);
    validateNewFeed(url, createdFeedsUrl)
      .then(async () => {
        state.status = FORM_STATUS.SUBMIT;
        await getRssData(url);
        setTimeout(updatePosts, 5000);
      })
      .catch((error) => {
        state.error = error.message;
        state.status = FORM_STATUS.ERROR;
      });
  });
};

export default appInit;
