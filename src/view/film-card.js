import Abstract from './abstract';
import dayjs from 'dayjs';
import {MINUTES_IN_HOUR} from '../constants';

const POPUP_OPEN_CLASSES = ['film-card__poster', 'film-card__title', 'film-card__comments'];

const formatRuntime = (runtime) => {
  const hours = Math.floor(runtime / MINUTES_IN_HOUR);
  const minutes = runtime - (hours * MINUTES_IN_HOUR);

  return `${hours}h ${minutes}m`;
};

const formatDescription = (description) => description.length > 140 ? description.slice(0, 139).concat('…') : description;

const createFilmCardTemplate = (film) => {
  const {
    comments,
    filmInfo,
    userDetails,
  } = film;

  const {
    description,
    genres,
    poster,
    releaseDate,
    runtime,
    title,
    totalRating,
  } = filmInfo;

  const {
    alreadyWatched,
    favorite,
    watchlist,
  } = userDetails;

  const releaseYear = dayjs(releaseDate).format('YYYY');
  const formattedRuntime = formatRuntime(runtime);
  const formattedGenres = genres.join(', ');
  const formattedDescription = formatDescription(description);
  const commentsCount = comments.length;

  const watchlistButtonClass = watchlist ? 'film-card__controls-item--add-to-watchlist film-card__controls-item--active' : 'film-card__controls-item--add-to-watchlist';
  const watchedButtonClass = alreadyWatched ? 'film-card__controls-item--mark-as-watched film-card__controls-item--active' : 'film-card__controls-item--mark-as-watched';
  const favoriteButtonClass = favorite ? 'film-card__controls-item--favorite film-card__controls-item--active' : 'film-card__controls-item--favorite';

  return `<article class="film-card">
    <h3 class="film-card__title">${title}</h3>
    <p class="film-card__rating">${totalRating}</p>
    <p class="film-card__info">
      <span class="film-card__year">${releaseYear}</span>
      <span class="film-card__duration">${formattedRuntime}</span>
      <span class="film-card__genre">${formattedGenres}</span>
    </p>
    <img src="${poster}" alt="" class="film-card__poster">
    <p class="film-card__description">${formattedDescription}</p>
    <a class="film-card__comments">${commentsCount} comment${commentsCount > 1 ? 's' : ''}</a>
    <div class="film-card__controls">
      <button class="film-card__controls-item button ${watchlistButtonClass}" type="button">Add to watchlist</button>
      <button class="film-card__controls-item button ${watchedButtonClass}" type="button">Mark as watched</button>
      <button class="film-card__controls-item button ${favoriteButtonClass}" type="button">Mark as favorite</button>
    </div>
  </article>`;
};

export default class FilmCard extends Abstract {
  constructor(film) {
    super();

    this._film = film;

    this._watchlistButtonClickHandler = this._watchlistButtonClickHandler.bind(this);
    this._watchedButtonClickHandler = this._watchedButtonClickHandler.bind(this);
    this._favoriteButtonClickHandler = this._favoriteButtonClickHandler.bind(this);
    this._openPopupClickHandler = this._openPopupClickHandler.bind(this);
  }

  getTemplate() {
    return createFilmCardTemplate(this._film);
  }

  setWatchlistButtonClickHandler(callback) {
    this._callback.watchlistButtonClick = callback;
    this.getElement().querySelector('.film-card__controls-item--add-to-watchlist').addEventListener('click', this._watchlistButtonClickHandler);
  }

  setWatchedButtonClickHandler(callback) {
    this._callback.watchedButtonClick = callback;
    this.getElement().querySelector('.film-card__controls-item--mark-as-watched').addEventListener('click', this._watchedButtonClickHandler);
  }

  setFavoriteButtonClickHandler(callback) {
    this._callback.favoriteButtonClick = callback;
    this.getElement().querySelector('.film-card__controls-item--favorite').addEventListener('click', this._favoriteButtonClickHandler);
  }

  setOpenPopupClickHandler(callback) {
    this._callback.openPopupClick = callback;
    this.getElement().addEventListener('click', this._openPopupClickHandler);
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

  _openPopupClickHandler(evt) {
    if (!POPUP_OPEN_CLASSES.includes(evt.target.className)) {
      return;
    }

    evt.preventDefault();

    this._callback.openPopupClick();
  }
}
