import './style.scss';
import { string, object } from 'yup';
import getState from './state.js';
import { elements } from './common.js';
import i18next from 'i18next';

const appInit = () => {
    i18next.init({
        lng: 'ru',
        debug: true,
        resources: {
            ru: {
                translation: {
                    loadingStatus: {
                        success: 'RSS загружен',
                    },
                    errors: {
                        exist: 'RSS уже существует',
                        required: 'Обязательное поле',
                        invalidUrl: 'Не верная ссылка',
                        unknownError: 'Неизвестная ошибка. Что-то пошло не так.',
                    },
                    feeds: 'Фиды',
                    posts: 'Посты',
                    preview: 'Просмотр',
                    buttonSubmit: 'Добавить',
                    title: 'RSS агрегатор'
                },
            }
        }
    });

    elements.button.textContent = i18next.t('buttonSubmit');
    elements.title.textContent = i18next.t('title');

    const state = getState(i18next)

    const validateNewFeed = async (url) => {
        const formSchema = object({
            url: string().required().url(),
        });
        const createdFeeds = state.feeds.map((feed) => feed);

        const alredyExist = createdFeeds.includes(url);
        if (alredyExist) throw new Error(i18next.t('errors.exist'));

        return formSchema.validate({ url });
    };

    elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const data = new FormData(e.target);

        const url = data.get('url');
        validateNewFeed(url)
        .then((e) => {
            console.log(e);
            
            state.form = {...state.form, isValid: true};
            state.feeds = [...state.feeds, url];
        })
        .catch((error) => {
            console.log(error);
            
            state.form = {...state.form, error, isValid: false};
        });
    });
};

export default appInit;