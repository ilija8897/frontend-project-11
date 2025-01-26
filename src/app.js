import './style.scss';
import 'bootstrap';
import { string, object } from 'yup';
import { v4 as uuidv4 } from 'uuid';
import i18next from 'i18next';
import axios from 'axios';
import getState from './state.js';
import elements from './common.js';
import rssParser from './parser.js';

const appInit = () => {
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
          buttonSubmit: 'Добавить',
          title: 'RSS агрегатор',
        },
      },
    },
  });
  const state = getState(i18next);
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

        state.loadRssStatus.error = false;
      })
      .catch((e) => {
        console.log(e);

        if (e.message === 'Parser error') {
          state.loadRssStatus.invalidRSS = true;
        }

        if (e.isAxiosError) {
          state.loadRssStatus.networkError = true;
        }
        throw new Error(e);
      });

  elements.button.textContent = i18next.t('buttonSubmit');
  elements.title.textContent = i18next.t('title');

  const validateNewFeed = async (url) => {
    const createdFeeds = state.feeds.map((feed) => feed.url);
    const formSchema = object({
      url: string()
        .required(i18next.t('errors.required'))
        .url(i18next.t('errors.invalidUrl'))
        .notOneOf(createdFeeds, i18next.t('errors.exist')),
    });

    return formSchema.validate({ url });
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(e.target);

    const url = data.get('url');
    validateNewFeed(url)
      .then(async () => {
        await getRssData(url);
        state.form = { ...state.form, isValid: true };
      })
      .catch((error) => {
        state.form = { ...state.form, error, isValid: false };
      });
  });

  function updatePosts() {
    setTimeout(() => {
      state.feeds.forEach((feed) => axios
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
            state.loadRssStatus.error = false;
          })
          .catch((e) => {
            state.loadRssStatus.error = true;
            throw new Error(e);
          }));
    }, 5000);
  }
  updatePosts();
};

export default appInit;
