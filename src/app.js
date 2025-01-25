import './style.scss';
import 'bootstrap';
import { string, object } from 'yup';
import getState from './state.js';
import { elements } from './common.js';
import i18next from 'i18next';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import rssParser from './parser.js';

const appInit = () => {
    i18next.init({
        lng: 'ru',
        debug: true,
        resources: {
            ru: {
                translation: {
                    errors: {
                        exist: 'RSS уже существует',
                        required: 'Обязательное поле',
                        invalidUrl: 'Не верная ссылка',
                        unknownError: 'Неизвестная ошибка. Что-то пошло не так.',
                    },
                    postButton: 'Просмотр',
                    buttonSubmit: 'Добавить',
                    title: 'RSS агрегатор'
                },
            }
        }
    });
    const state = getState(i18next);
    const getProxyUrl = (url) => {
        const urlWithProxy = new URL('/get', 'https://allorigins.hexlet.app');
        urlWithProxy.searchParams.set('url', url);
        urlWithProxy.searchParams.set('disableCache', 'true');
        return urlWithProxy.toString();
    };

    const getRssData = (url) => {
        return axios.get(getProxyUrl(url))
        .then((res) => {
            const { title, description, posts } = rssParser(res.data.contents);
            
            const feed = {
                url, id: uuidv4(), title, description,
            };
            const postsItems = posts.map((item) => ({ ...item, parentFeed: feed.id, id: uuidv4() }));
            state.posts.unshift(...postsItems);
            state.feeds.unshift(feed);

            state.loadRssStatus.error = false;
            })
            .catch((e) => {
                state.loadRssStatus.error = true;
                throw new Error(e);
            });

    }

    elements.button.textContent = i18next.t('buttonSubmit');
    elements.title.textContent = i18next.t('title');

    const validateNewFeed = async (url) => {
        const formSchema = object({
            url: string().required().url(),
        });
        const createdFeeds = state.feeds.map((feed) => feed);

        const alredyExist = createdFeeds.includes(url);
        if (alredyExist) throw new Error(i18next.t('errors.exist'));
        updatePosts();
        return formSchema.validate({ url });
    };

    elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const data = new FormData(e.target);

        const url = data.get('url');
        validateNewFeed(url)
        .then(async (e) => {
            await getRssData(url);
            state.form = {...state.form, isValid: true};
        })
        .catch((error) => {
            console.log('error1', error);
            
            state.form = {...state.form, error, isValid: false};
        });
    });

    function updatePosts() {
        setTimeout(() => {
            state.feeds.forEach(feed => {
                return axios.get(getProxyUrl(feed.url))
                .then((res) => {
                    const { posts } = rssParser(res.data.contents);
                    const updatedPosts = posts.map((post) => ({ ...post, parentFeed: feed.id, id: uuidv4() }));

                    const oldPosts = state.posts.filter((post) => post.parentFeed === feed.id);
                    const newPosts = updatedPosts.filter(updPost => {
                        return !oldPosts.some(oldPost => updPost.title === oldPost.title)
                    });

                    state.posts.unshift(...newPosts);
                    state.loadRssStatus.error = false;
                    })
                    .catch((e) => {
                        state.loadRssStatus.error = true;
                        throw new Error(e);
                    });
            })
            updatePosts();
        }, 5000);
    };
    // elements.postsList.addEventListener('click', (e) => {
    //     // e.preventDefault();
    //     // if (!('id' in evt.target.dataset)) {
    //     //     return;
    //     // }
    //     // console.log(e.target.dataset);
    //     // console.log(123123123);
        

    //     // const { id } = evt.target.dataset;
    //     // watchedState.modal.postId = String(id);
    //     // watchedState.ui.seenPosts.add(id);
    // });

};

export default appInit;