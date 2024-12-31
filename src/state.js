import onChange from "on-change";
import { elements } from './common.js';

const handleFeeds = (state) => {
    console.log(state.feeds);
    
    state.feeds.forEach(feed => {
        const newFeed = document.createElement('li');
        const feedTitle = document.createElement('h5');
        feedTitle.textContent = feed.title;
        const feedDescr = document.createElement('p');
        feedDescr.textContent = feed.description;
        newFeed.append(feedTitle)
        newFeed.append(feedDescr);
        elements.feedsList.append(newFeed)
    })
}

const handlePosts = (state, i18next) => {
    const { posts } = state;

    const postsListItems = posts.map((post) => {
        const postElement = document.createElement('li');
        postElement.classList.add('d-flex');
        const postLink = document.createElement('a');
        postLink.setAttribute('href', post.link);

        postLink.dataset.id = post.id;
        postLink.textContent = post.title;
        postLink.setAttribute('target', '_blank');
        postElement.append(postLink);
        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
        button.dataset.id = post.id;
        button.dataset.bsToggle = 'modal';
        button.dataset.bsTarget = '#modal';
        button.textContent = i18next.t('postButton');
        postElement.append(button);
        return postElement;
    });

    elements.postsList.append(...postsListItems);
};

const handleForm = (state) => {
    if (!state.form.isValid) {
        elements.input.classList.add('is-invalid');
        elements.errorLabel.textContent = state.form.error;
    }
    if (state.form.isValid) {
        elements.input.value = '';
        elements.input.classList.remove('is-invalid');
        elements.input.focus()
    }
}

const state = {
    loadRssStatus: {
        error: false,
        loading: false,
    },
    feeds: [],
    posts: [],
    form: {},
}

const appState = (i18next) => {
    return onChange(state, (path) => {
        switch (path) {
        case 'feeds':
            handleFeeds(state);
            break;
        case 'posts':
            handlePosts(state, i18next);
            break;
        case 'form':
            handleForm(state);
            break;
        default:
            break;
        }
    });
}

export default appState;