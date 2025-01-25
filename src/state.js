import onChange from "on-change";
import { elements } from './common.js';

const handleFeeds = (state, i18next) => {
    // console.log(state.feeds);
    
    state.feeds.forEach((feed) => {
        const newFeed = document.createElement('li');
        const feedTitle = document.createElement('h5');
        feedTitle.textContent = feed.title;
        const feedDescr = document.createElement('p');
        feedDescr.textContent = feed.description;
        newFeed.append(feedTitle)
        newFeed.append(feedDescr);
        elements.feedsList.append(newFeed)
        elements.errorLabel.textContent = i18next.t('succesFeed');
    })
}

const handlePosts = (state, i18next) => {
    const { posts } = state;

    const postsListItems = posts.map((post) => {
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
        button.addEventListener('click', (e) => {
            state.posts.find(item => item.id === post.id ).readed = true;
            postLink.classList.remove('fw-bold');
            postLink.classList.add('fw-normal');
            const modal = document.getElementById('modal');
            const modalTitle = modal.querySelector('.modal-title');
            const modalBody = modal.querySelector('.modal-body');
            modalTitle.textContent = post.title;
            modalBody.textContent = post.description;
            // modal.classList.add('show');
            // modal.style.display = 'block';
        });
        postElement.append(button);
        return postElement;
    });

    elements.postsList.replaceChildren(...postsListItems);
};

const handleForm = (state, i18next) => {
    if (!state.form.isValid) {
        elements.input.classList.add('is-invalid');
        elements.errorLabel.textContent = state.form.error;
    }
    if (state.form.isValid) {
        elements.input.value = '';
        elements.input.classList.remove('is-invalid');
        elements.input.focus()
    }
    if (state.loadRssStatus.invalidRSS) {
        elements.errorLabel.textContent = i18next.t('errors.invalidRSS');
    }
    if (state.loadRssStatus.networkError) {
        elements.errorLabel.textContent = i18next.t('errors.networkError');
    }
}

const state = {
    loadRssStatus: {
        invalidRSS: false,
        networkError: false,
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
            handleFeeds(state, i18next);
            break;
        case 'posts':
            handlePosts(state, i18next);
            break;
        case 'form':
            handleForm(state, i18next);
            break;
        case 'modal':
            handleModal(state);
            break;
        default:
            break;
        }
    });
}

export default appState;