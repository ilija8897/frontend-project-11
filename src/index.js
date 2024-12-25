import './style.scss';
import { string, object } from 'yup';
import state from './state.js';
import i18next from 'i18next';

i18next.init({
    lng: 'en',
    debug: true,
    resources: {
        en: {
        translation: {
            "key": "hello world"
        }
        }
    }
});
const form = document.querySelector('form');
let formSchema = object({
    url: string().required().url(),
});

const validateNewFeed = async (url) => {
    const createdFeeds = state.feeds.map((feed) => feed);

    const alredyExist = createdFeeds.includes(url);
    if (alredyExist) throw new Error(`Feed ${url} already exists`);

    return formSchema.validate({ url });
};

form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const data = new FormData(e.target);

    const url = data.get('url');
    validateNewFeed(url)
    .then(() => {
        state.form = {...state.form, isValid: true};
        state.feeds = [...state.feeds, url];
    })
    .catch((error) => {
        state.form = {...state.form, error, isValid: false};
    });
});