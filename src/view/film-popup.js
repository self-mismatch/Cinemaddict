import he from 'he';
import Smart from './smart';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {Key, MINUTES_IN_HOUR} from '../constants';

dayjs.extend(relativeTime);

const Emotion = {
  SMILE: 'smile',
  SLEEPING: 'sleeping',
  PUKE: 'puke',
  ANGRY: 'angry',
};

const formatReleaseDate = (releaseDate) => dayjs(releaseDate).format('DD MMMM YYYY');

const formatRuntime = (runtime) => {
  const hours = Math.floor(runtime / MINUTES_IN_HOUR);
  const minutes = runtime - (hours * MINUTES_IN_HOUR);

  return `${hours}h ${minutes}m`;
};

const formatCommentDate = (date) => dayjs().to(dayjs(date));

const createGenresTemplate = (genres) => genres.map((genre) => `<span class="film-details__genre">${genre}</span>`).join('');

const createCommentTemplate = (comment, deletingCommentId, isDeleting) => {
  const {
    author,
    content,
    date,
    emotion,
    id,
  } = comment;

  const formattedDate = formatCommentDate(date);
  const isCommentDeleting = isDeleting && deletingCommentId === id;
  const isDeleteButtonDisabled = isCommentDeleting ? 'disabled' : '';
  const deleteButtonText = isCommentDeleting ? 'Deleting...' : 'Delete';

  return `<li class="film-details__comment" data-comment-id="${id}">
    <span class="film-details__comment-emoji">
      <img src="./images/emoji/${emotion}.png" width="55" height="55" alt="emoji-${emotion}">
    </span>
    <div>
      <p class="film-details__comment-text">${content}</p>
      <p class="film-details__comment-info">
        <span class="film-details__comment-author">${author}</span>
        <span class="film-details__comment-day">${formattedDate}</span>
        <button class="film-details__comment-delete" data-comment-id="${id}" ${isDeleteButtonDisabled}>${deleteButtonText}</button>
      </p>
    </div>
  </li>`;
};

const createCommentsTemplate = (comments, deletingCommentId, isDeleting) => {
  const commentsItemsTemplate = comments.map((comment) => createCommentTemplate(comment, deletingCommentId, isDeleting)).join('');

  return comments.length > 0 ? `<ul class="film-details__comments-list">${commentsItemsTemplate}</ul>` : '<p>Failed to load comments</p>';
};

const createSelectedEmotionTemplate = (selectedEmotion) => selectedEmotion ? `<img src="images/emoji/${selectedEmotion}.png" width="55" height="55" alt="emoji-${selectedEmotion}">` : '';

const createEmotionItemTemplate = (emotion, selectedEmotion, isSaving) => {
  const isInputChecked = emotion === selectedEmotion ? 'checked' : '';
  const isInputDisabled = isSaving ? 'disabled' : '';

  return `<input class="film-details__emoji-item visually-hidden" name="comment-emoji" type="radio" id="emoji-${emotion}" value="${emotion}" ${isInputChecked} ${isInputDisabled}>
    <label class="film-details__emoji-label" for="emoji-${emotion}">
      <img src="./images/emoji/${emotion}.png" width="30" height="30" alt="emoji">
    </label>`;
};

const createEmotionListTemplate = (selectedEmotion, isSaving) => `<div class="film-details__emoji-list">
      ${Object.values(Emotion).map((emotion) => createEmotionItemTemplate(emotion, selectedEmotion, isSaving)).join('')}
    </div>`;

const createFilmPopupTemplate = (data, comments) => {
  const {
    filmInfo,
    userDetails,
  } = data;

  const {
    state,
  } = data;

  const {
    actors,
    ageRating,
    alternativeTitle,
    country,
    description,
    director,
    genres,
    poster,
    releaseDate,
    runtime,
    title,
    totalRating,
    writers,
  } = filmInfo;

  const {
    alreadyWatched,
    favorite,
    watchlist,
  } = userDetails;

  const {
    commentText,
    deletingCommentId,
    emotion,
    isDeleting,
    isSaving,
  } = state;

  const formattedWriters = writers.join(', ');
  const formattedActors = actors.join(', ');
  const formattedReleaseDate = formatReleaseDate(releaseDate);
  const formattedRuntime = formatRuntime(runtime);

  const genresTemplate = createGenresTemplate(genres);

  const watchlistInputCheck = watchlist ? 'checked' : '';
  const watchedInputCheck = alreadyWatched ? 'checked' : '';
  const favoriteInputCheck = favorite ? 'checked' : '';

  const commentsCount = comments.length;
  const commentsTemplate = createCommentsTemplate(comments, deletingCommentId, isDeleting);

  const selectedEmotionTemplate = createSelectedEmotionTemplate(emotion);
  const emotionListTemplate = createEmotionListTemplate(emotion, isSaving);

  return `<section class="film-details">
    <form class="film-details__inner" action="" method="get">
      <div class="film-details__top-container">
        <div class="film-details__close">
          <button class="film-details__close-btn" type="button">close</button>
        </div>
        <div class="film-details__info-wrap">
          <div class="film-details__poster">
            <img class="film-details__poster-img" src="${poster}" alt="">

            <p class="film-details__age">${ageRating}+</p>
          </div>

          <div class="film-details__info">
            <div class="film-details__info-head">
              <div class="film-details__title-wrap">
                <h3 class="film-details__title">${title}</h3>
                <p class="film-details__title-original">Original: ${alternativeTitle}</p>
              </div>

              <div class="film-details__rating">
                <p class="film-details__total-rating">${totalRating}</p>
              </div>
            </div>

            <table class="film-details__table">
              <tr class="film-details__row">
                <td class="film-details__term">Director</td>
                <td class="film-details__cell">${director}</td>
              </tr>
              <tr class="film-details__row">
                <td class="film-details__term">Writers</td>
                <td class="film-details__cell">${formattedWriters}</td>
              </tr>
              <tr class="film-details__row">
                <td class="film-details__term">Actors</td>
                <td class="film-details__cell">${formattedActors}</td>
              </tr>
              <tr class="film-details__row">
                <td class="film-details__term">Release Date</td>
                <td class="film-details__cell">${formattedReleaseDate}</td>
              </tr>
              <tr class="film-details__row">
                <td class="film-details__term">Runtime</td>
                <td class="film-details__cell">${formattedRuntime}</td>
              </tr>
              <tr class="film-details__row">
                <td class="film-details__term">Country</td>
                <td class="film-details__cell">${country}</td>
              </tr>
              <tr class="film-details__row">
                <td class="film-details__term">Genre${genres.length > 1 ? 's' : ''}</td>
                <td class="film-details__cell">${genresTemplate}</td>
              </tr>
            </table>

            <p class="film-details__film-description">${description}</p>
          </div>
        </div>

        <section class="film-details__controls">
          <input type="checkbox" class="film-details__control-input visually-hidden" id="watchlist" name="watchlist" ${watchlistInputCheck}>
          <label for="watchlist" class="film-details__control-label film-details__control-label--watchlist">Add to watchlist</label>

          <input type="checkbox" class="film-details__control-input visually-hidden" id="watched" name="watched" ${watchedInputCheck}>
          <label for="watched" class="film-details__control-label film-details__control-label--watched">Already watched</label>

          <input type="checkbox" class="film-details__control-input visually-hidden" id="favorite" name="favorite" ${favoriteInputCheck}>
          <label for="favorite" class="film-details__control-label film-details__control-label--favorite">Add to favorites</label>
        </section>
      </div>

      <div class="film-details__bottom-container">
        <section class="film-details__comments-wrap">
          <h3 class="film-details__comments-title">Comments <span class="film-details__comments-count">${commentsCount}</span></h3>

          ${commentsTemplate}

          <div class="film-details__new-comment">
            <div class="film-details__add-emoji-label">
              ${selectedEmotionTemplate}
            </div>

            <label class="film-details__comment-label">
              <textarea class="film-details__comment-input" placeholder="Select reaction below and write comment here" name="comment" ${isSaving ? 'disabled' : ''}>${commentText}</textarea>
            </label>

            ${emotionListTemplate}
          </div>
        </section>
      </div>
    </form>
  </section>`;
};

export default class FilmPopup extends Smart {
  constructor(film, commentsModel) {
    super();

    this._data = FilmPopup.parseFilmToData(film);
    this._commentsModel = commentsModel;

    this._watchlistButtonClickHandler = this._watchlistButtonClickHandler.bind(this);
    this._watchedButtonClickHandler = this._watchedButtonClickHandler.bind(this);
    this._favoriteButtonClickHandler = this._favoriteButtonClickHandler.bind(this);
    this._closeButtonClickHandler = this._closeButtonClickHandler.bind(this);
    this._deleteCommentButtonClickHandler = this._deleteCommentButtonClickHandler.bind(this);
    this._commentFormSubmitHandler = this._commentFormSubmitHandler.bind(this);
    this._commentInputHandler = this._commentInputHandler.bind(this);
    this._commentEmotionChangeHandler = this._commentEmotionChangeHandler.bind(this);

    this._setInnerHandlers();
  }

  getTemplate() {
    return createFilmPopupTemplate(this._data, this._commentsModel.getComments());
  }

  restoreHandlers() {
    this._setInnerHandlers();

    this.setWatchlistButtonClickHandler(this._callback.watchlistButtonClick);
    this.setWatchedButtonClickHandler(this._callback.watchedButtonClick);
    this.setFavoriteButtonClickHandler(this._callback.favoriteButtonClick);
    this.setCloseButtonClickHandler(this._callback.closeButtonClick);
    this.setDeleteCommentButtonClickHandler(this._callback.deleteCommentButtonClick);
    this.setCommentFormSubmitHandler(this._callback.commentFormSubmit);
  }

  setWatchlistButtonClickHandler(callback) {
    this._callback.watchlistButtonClick = callback;
    this.getElement().querySelector('#watchlist').addEventListener('click', this._watchlistButtonClickHandler);
  }

  setWatchedButtonClickHandler(callback) {
    this._callback.watchedButtonClick = callback;
    this.getElement().querySelector('#watched').addEventListener('click', this._watchedButtonClickHandler);
  }

  setFavoriteButtonClickHandler(callback) {
    this._callback.favoriteButtonClick = callback;
    this.getElement().querySelector('#favorite').addEventListener('click', this._favoriteButtonClickHandler);
  }

  setCloseButtonClickHandler(callback) {
    this._callback.closeButtonClick = callback;
    this.getElement().querySelector('.film-details__close-btn').addEventListener('click', this._closeButtonClickHandler);
  }

  setDeleteCommentButtonClickHandler(callback) {
    this._callback.deleteCommentButtonClick = callback;

    const commentsList = this.getElement().querySelector('.film-details__comments-list');

    if (commentsList) {
      commentsList.addEventListener('click', this._deleteCommentButtonClickHandler);
    }
  }

  setCommentFormSubmitHandler(callback) {
    this._callback.commentFormSubmit = callback;
    this.getElement().addEventListener('keydown', this._commentFormSubmitHandler);
  }

  _setCommentInputHandler() {
    this.getElement().querySelector('.film-details__comment-input').addEventListener('input', this._commentInputHandler);
  }

  _setEmotionChangeHandler() {
    const inputs = this.getElement().querySelectorAll('.film-details__emoji-item');

    for (const input of inputs) {
      input.addEventListener('change', this._commentEmotionChangeHandler);
    }
  }

  _setInnerHandlers() {
    this._setCommentInputHandler();
    this._setEmotionChangeHandler();
  }

  _watchlistButtonClickHandler(evt) {
    evt.preventDefault();

    this._callback.watchlistButtonClick();
  }

  _watchedButtonClickHandler(evt) {
    evt.preventDefault();

    this._callback.watchedButtonClick();
  }

  _favoriteButtonClickHandler(evt) {
    evt.preventDefault();

    this._callback.favoriteButtonClick();
  }

  _closeButtonClickHandler(evt) {
    evt.preventDefault();

    this._callback.closeButtonClick();
  }

  _deleteCommentButtonClickHandler(evt) {
    if (evt.target.tagName !== 'BUTTON') {
      return;
    }

    evt.preventDefault();

    const deletingCommentId = evt.target.dataset.commentId;

    this._callback.deleteCommentButtonClick(deletingCommentId);
  }

  _commentFormSubmitHandler(evt) {
    if ((evt.metaKey || evt.ctrlKey) && evt.key === Key.ENTER) {
      evt.preventDefault();

      this._callback.commentFormSubmit(FilmPopup.parseDataToComment(this._data));
    }
  }

  _commentEmotionChangeHandler(evt) {
    evt.preventDefault();

    this.updateData({
      state: {
        ...this._data.state,
        emotion: evt.target.value,
      },
    });
  }

  _commentInputHandler(evt) {
    evt.preventDefault();

    this.updateData({
      state: {
        ...this._data.state,
        commentText: he.encode(evt.target.value),
      },
    },
    true,
    );
  }

  static parseFilmToData(film) {
    return Object.assign(
      {},
      film,
      {
        state: {
          commentText: '',
          deletingCommentId: null,
          emotion: null,
          isSaving: false,
          isDeleting: false,
          isDisabled: false,
        },
      },
    );
  }

  static parseDataToComment(data) {
    const localComment = {
      comment: data.state.commentText,
      emotion: data.state.emotion,
    };

    this._data = null;

    return localComment;
  }
}
