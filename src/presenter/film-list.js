import ExtraFilmView from '../view/extra-film';
import FilmListView from '../view/film-list';
import LoadingView from '../view/loading';
import NoFilmView from '../view/no-film';
import ShowMoreButtonView from '../view/show-more-button';
import SortingView from '../view/sorting';
import UserProfileView from '../view/user-profile';

import FilmPresenter, {State as FilmPresenterViewState, AbortingElementClass as FilmPresenterAbortingElementClass} from './film';

import {SortingType, UpdateType, UserAction} from '../constants';

import {getMostCommentedFilms, getTopRatedFilms, getSortedFilmsByDate, getSortedFilmsByRating} from '../utils/film';
import {remove, render, RenderPosition} from '../utils/render';
import {filter} from '../utils/filter';

const FILM_COUNT_PER_STEP = 5;

const ID_PREFIX = {
  TOP_RATED: 'topRated',
  MOST_COMMENTED: 'mostCommented',
};

export default class FilmList {
  constructor(userProfileContainer, filmListContainer, filmsModel, filterModel, commentsModel, api) {
    this._userProfileContainer = userProfileContainer;
    this._filmListContainer = filmListContainer;
    this._filmsModel = filmsModel;
    this._filterModel = filterModel;
    this._commentsModel = commentsModel;

    this._userProfile = null;
    this._filmList = null;
    this._loading = new LoadingView();
    this._noFilm = new NoFilmView();
    this._showMoreButton = null;
    this._sorting = null;

    this._mainFilmsList = null;
    this._mainFilmsContainer = null;

    this._topRatedFilms = null;
    this._mostCommentedFilms = null;

    this._handleViewAction = this._handleViewAction.bind(this);
    this._handleModelEvent = this._handleModelEvent.bind(this);
    this._handleCommentModelEvent = this._handleCommentModelEvent.bind(this);

    this._handleModeChange = this._handleModeChange.bind(this);
    this._handleSortingTypeChange = this._handleSortingTypeChange.bind(this);
    this._handleShowMoreButtonClick = this._handleShowMoreButtonClick.bind(this);

    this._filmPresenter = {};

    this._api = api;

    this._currentSortingType = SortingType.DEFAULT;
    this._renderedFilmCount = FILM_COUNT_PER_STEP;

    this._isLoading = true;
  }

  init() {
    this._filmList = new FilmListView();
    this._mainFilmsList = this._filmList.getElement().querySelector('.films-list');
    this._mainFilmsContainer = this._mainFilmsList.querySelector('.films-list__container');

    this._filmsModel.addObserver(this._handleModelEvent);
    this._filterModel.addObserver(this._handleModelEvent);
    this._commentsModel.addObserver(this._handleCommentModelEvent);
  }

  destroy() {
    this._clearFilmList({resetRenderedFilmCount: true, resetSortingType: true});

    remove(this._filmList);
    this._mainFilmsList = null;
    this._mainFilmsContainer = null;

    this._filmsModel.removeObserver(this._handleModelEvent);
    this._filterModel.removeObserver(this._handleModelEvent);
    this._commentsModel.removeObserver(this._handleCommentModelEvent);
  }

  _getFilms() {
    const filterType = this._filterModel.getFilter();
    const films = this._filmsModel.getFilms();
    const filteredFilms = filter[filterType](films);

    switch (this._currentSortingType) {
      case SortingType.DATE:
        return getSortedFilmsByDate(filteredFilms);
      case SortingType.RATING:
        return getSortedFilmsByRating(filteredFilms);
    }

    return filteredFilms;
  }

  _updateFilm(film, needToResetPopupState = false) {
    if (film.id in this._filmPresenter) {
      this._filmPresenter[film.id].init(film, needToResetPopupState);
    }

    if (`${ID_PREFIX.TOP_RATED}_${film.id}` in this._filmPresenter) {
      this._filmPresenter[`${ID_PREFIX.TOP_RATED}_${film.id}`].init(film, needToResetPopupState);
    }

    if (`${ID_PREFIX.MOST_COMMENTED}_${film.id}` in this._filmPresenter) {
      this._filmPresenter[`${ID_PREFIX.MOST_COMMENTED}_${film.id}`].init(film, needToResetPopupState);
    }
  }

  _setFilmSavingState(film) {
    if (film.id in this._filmPresenter) {
      this._filmPresenter[film.id].setViewState(FilmPresenterViewState.SAVING);
    }

    if (`${ID_PREFIX.TOP_RATED}_${film.id}` in this._filmPresenter) {
      this._filmPresenter[`${ID_PREFIX.TOP_RATED}_${film.id}`].setViewState(FilmPresenterViewState.SAVING);
    }

    if (`${ID_PREFIX.MOST_COMMENTED}_${film.id}` in this._filmPresenter) {
      this._filmPresenter[`${ID_PREFIX.MOST_COMMENTED}_${film.id}`].setViewState(FilmPresenterViewState.SAVING);
    }
  }

  _setFilmDeletingState(film, updateCommentId) {
    if (film.id in this._filmPresenter) {
      this._filmPresenter[film.id].setViewState(FilmPresenterViewState.DELETING, updateCommentId);
    }

    if (`${ID_PREFIX.TOP_RATED}_${film.id}` in this._filmPresenter) {
      this._filmPresenter[`${ID_PREFIX.TOP_RATED}_${film.id}`].setViewState(FilmPresenterViewState.DELETING, updateCommentId);
    }

    if (`${ID_PREFIX.MOST_COMMENTED}_${film.id}` in this._filmPresenter) {
      this._filmPresenter[`${ID_PREFIX.MOST_COMMENTED}_${film.id}`].setViewState(FilmPresenterViewState.DELETING, updateCommentId);
    }
  }

  _setFilmAbortingState(film, updateCommentId, abortingSelector) {
    if (film.id in this._filmPresenter) {
      this._filmPresenter[film.id].setViewState(FilmPresenterViewState.ABORTING, updateCommentId, abortingSelector);
    }

    if (`${ID_PREFIX.TOP_RATED}_${film.id}` in this._filmPresenter) {
      this._filmPresenter[`${ID_PREFIX.TOP_RATED}_${film.id}`].setViewState(FilmPresenterViewState.ABORTING, updateCommentId, abortingSelector);
    }

    if (`${ID_PREFIX.MOST_COMMENTED}_${film.id}` in this._filmPresenter) {
      this._filmPresenter[`${ID_PREFIX.MOST_COMMENTED}_${film.id}`].setViewState(FilmPresenterViewState.ABORTING, updateCommentId, abortingSelector);
    }
  }

  _handleViewAction(actionType, updateType, updateFilm, updateCommentId, updateComment) {
    switch (actionType) {
      case UserAction.UPDATE_FILM:
        this._api.updateFilm(updateFilm).then((response) => {
          this._filmsModel.updateFilm(updateType, response);
        });
        break;
      case UserAction.ADD_COMMENT:
        this._setFilmSavingState(updateFilm);

        this._api.addComment(updateFilm, updateComment)
          .then((response) => {
            this._commentsModel.addComment(updateType, response);
          })
          .catch(() => {
            this._setFilmAbortingState(updateFilm, null, `.${FilmPresenterAbortingElementClass.ADDING_COMMENT}`);
          });
        break;
      case UserAction.DELETE_COMMENT:
        this._setFilmDeletingState(updateFilm, updateCommentId);
        this._api.deleteComment(updateCommentId)
          .then(() => {
            this._commentsModel.deleteComment(updateType, updateFilm, updateCommentId);
          })
          .catch(() => {
            this._setFilmAbortingState(updateFilm, updateCommentId, `.${FilmPresenterAbortingElementClass.DELETING_COMMENT}[data-comment-id="${updateCommentId}"]`);
          });
        break;
    }
  }

  _handleModelEvent(updateType, data) {
    switch (updateType) {
      case UpdateType.PATCH:
        this._renderUserProfile();

        this._updateFilm(data);
        break;
      case UpdateType.MINOR:
        this._renderUserProfile();

        this._clearFilmList();
        this._renderFilmList();
        break;
      case UpdateType.MAJOR:
        this._clearFilmList({resetRenderedFilmCount: true, resetSortingType: true});
        this._renderFilmList();
        break;
      case UpdateType.INIT:
        this._renderUserProfile();

        this._isLoading = false;
        remove(this._loading);
        this._renderFilmList();
        break;
      case UpdateType.COMMENT:
        this._updateFilm(data, true);
        break;
    }
  }

  _handleCommentModelEvent(updateType, data) {
    switch (updateType) {
      case UpdateType.PATCH:
        this._filmsModel.updateFilm(updateType, data);
        break;
      case UpdateType.MINOR:
        this._filmsModel.updateFilm(updateType, data);
        break;
      case UpdateType.MAJOR:
        this._filmsModel.updateFilm(updateType, data);
        break;
      case UpdateType.COMMENT:
        this._filmsModel.updateFilm(updateType, data);
        break;
    }
  }

  _handleModeChange() {
    Object
      .values(this._filmPresenter)
      .forEach((presenter) => presenter.resetView());
  }

  _handleSortingTypeChange(sortingType) {
    if (sortingType === this._currentSortingType) {
      return;
    }

    this._currentSortingType = sortingType;

    this._clearFilmList({resetRenderedFilmCount: true});
    this._renderFilmList();
  }

  _renderUserProfile() {
    if (this._userProfile) {
      remove(this._userProfile);
      this._userProfile = null;
    }

    this._userProfile = new UserProfileView(this._filmsModel.getFilms());
    render(this._userProfileContainer, this._userProfile);
  }

  _renderLoading() {
    render(this._filmListContainer, this._loading);
  }

  _renderNoFilm() {
    render(this._filmListContainer, this._noFilm);
  }

  _renderSorting() {
    if (this._sorting !== null) {
      this._sorting = null;
    }

    this._sorting = new SortingView(this._currentSortingType);
    this._sorting.setSortingTypeChangeHandler(this._handleSortingTypeChange);

    render(this._filmList, this._sorting, RenderPosition.BEFOREBEGIN);
  }

  _renderFilm(container, film, prefix = '') {
    const filmPresenter = new FilmPresenter(container, this._handleViewAction, this._handleModeChange, this._filterModel, this._commentsModel, this._api);
    this._filmPresenter[prefix ? `${prefix}_${film.id}` : film.id] = filmPresenter;
    return filmPresenter.init(film);
  }

  _renderFilms(films, container, prefix = '') {
    films.forEach((film) => this._renderFilm(container, film, prefix));
  }

  _handleShowMoreButtonClick() {
    const filmCount = this._getFilms().length;
    const newRenderedFilmCount = Math.min(filmCount, this._renderedFilmCount + FILM_COUNT_PER_STEP);
    const films = this._getFilms().slice(this._renderedFilmCount, newRenderedFilmCount);

    this._renderFilms(films, this._mainFilmsContainer);
    this._renderedFilmCount = newRenderedFilmCount;

    if (this._renderedFilmCount >= filmCount) {
      remove(this._showMoreButton);
    }
  }

  _renderShowMoreButton() {
    if (this._showMoreButton !== null) {
      this._showMoreButton = null;
    }

    this._showMoreButton = new ShowMoreButtonView();
    this._showMoreButton.setClickHandler(this._handleShowMoreButtonClick);

    render(this._mainFilmsList, this._showMoreButton);
  }

  _renderMainFilms(films) {
    this._renderFilms(films, this._mainFilmsContainer);
  }

  _renderExtraFilms() {
    const topRatedFilms = getTopRatedFilms(this._filmsModel.getFilms());
    const mostCommentedFilms = getMostCommentedFilms(this._filmsModel.getFilms());

    if (topRatedFilms.every((film) => film.filmInfo.totalRating > 0)) {
      this._topRatedFilms = new ExtraFilmView('topRated', 'Top rated');
      render(this._filmList, this._topRatedFilms);

      const topRatedFilmsContainer = this._topRatedFilms.getElement().querySelector('.films-list__container');
      this._renderFilms(topRatedFilms, topRatedFilmsContainer, ID_PREFIX.TOP_RATED);
    }

    if (mostCommentedFilms.every((film) => film.comments.length > 0)) {
      this._mostCommentedFilms = new ExtraFilmView('mostCommented', 'Most commented');
      render(this._filmList, this._mostCommentedFilms);

      const mostCommentedFilmsContainer = this._mostCommentedFilms.getElement().querySelector('.films-list__container');
      this._renderFilms(mostCommentedFilms, mostCommentedFilmsContainer, ID_PREFIX.MOST_COMMENTED);
    }
  }

  _renderFilmList() {
    if (this._isLoading) {
      this._renderLoading();
      return;
    }

    const films = this._getFilms();
    const filmCount = films.length;

    if (filmCount === 0) {
      this._renderNoFilm();
      return;
    }

    render(this._filmListContainer, this._filmList);

    this._renderSorting();

    this._renderMainFilms(films.slice(0, Math.min(filmCount, this._renderedFilmCount)));

    if (filmCount > FILM_COUNT_PER_STEP) {
      this._renderShowMoreButton();
    }

    this._renderExtraFilms();
  }

  _clearFilmList({resetRenderedFilmCount = false, resetSortingType = false} = {}) {
    const filmCount = this._getFilms().length;

    Object
      .values(this._filmPresenter)
      .forEach((presenter) => presenter.destroy());
    this._filmPresenter = {};

    remove(this._sorting);
    remove(this._loading);
    remove(this._noFilm);
    remove(this._showMoreButton);

    remove(this._topRatedFilms);
    remove(this._mostCommentedFilms);

    this._topRatedFilms = null;
    this._mostCommentedFilms = null;

    if (resetRenderedFilmCount) {
      this._renderedFilmCount = FILM_COUNT_PER_STEP;
    } else {
      this._renderedFilmCount = Math.min(filmCount, this._renderedFilmCount);
    }

    if (resetSortingType) {
      this._currentSortingType = SortingType.DEFAULT;
    }
  }
}
