import onChange from "on-change";

const handleFeeds = (state) => {
    const newFeed = document.createElement('li');
    console.log(state.feeds[state.feeds.length - 1]);
    // console.log(document.querySelector('.feed-list'));
    
    newFeed.textContent = state.feeds[state.feeds.length - 1];
    // console.log(newFeed);
    
    document.querySelector('.feeds-list').appendChild(newFeed);

}

const handleForm = (state) => {
    const input = document.querySelector('#url-input');

    if (!state.form.isValid) input.classList.add('is-invalid');
    if (state.form.isValid) {
        input.value = '';
        input.classList.remove('is-invalid');
        input.focus()
    }
}

const state = {
    feeds: [],
    form: {},
}

const watchedState = onChange(state, (path) => {
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

export default watchedState;