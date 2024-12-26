import onChange from "on-change";
import { elements } from './common.js';

const handleFeeds = (state) => {
    const newFeed = document.createElement('li');

    newFeed.textContent = state.feeds[state.feeds.length - 1];

    elements.feedsList.appendChild(newFeed);

}

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
    feeds: [],
    form: {},
}

const appState = () => {
    return onChange(state, (path) => {
        switch (path) {
        case 'feeds':
            handleFeeds(state);
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