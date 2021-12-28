import FilmCardView from '../view/film-card';
import FilmPopupView from '../view/film-popup';

import {FilterType, Key, UserAction, UpdateType} from '../constants';

import {remove, render, replace} from '../utils/render';

const Mode = {
  DEFAULT: 'DEFAULT',
  POPUP: 'POPUP',
};

export const State = {
  ABORTING: 'ABORTING',
  DELETING: 'DELETING',
  SAVING: 'SAVING',
};

export const AbortingElementClass = {
  DELETING_COMMENT: 'film-details__comment',
  ADDING_COMMENT: 'film-details__new-comment',
};

export default class Film {
  constructor(filmListContainer, changeData, changeMode, filterModel, commentsModel, api) {
    this._filmListContainer = filmListContainer;
    this._changeData = changeData;
    this._changeMode = changeMode;
    this._filterModel = filterModel;
    this._commentsModel = commentsModel;
    this._api = api;

    this._siteBody = document.body;

    this._filmCard = null;
    this._filmPopup = null;

    this._mode = Mode.DEFAULT;

    this._handleWatchlistButtonClick = this._handleWatchlistButtonClick.bind(this);
    this._handleWatchedButtonClick = this._handleWatchedButtonClick.bind(this);
    this._handleFavoriteButtonClick = this._handleFavoriteButtonClick.bind(this);
    this._handleFilmCardClick = this._handleFilmCardClick.bind(this);
    this._handlePopupCloseButtonClick = this._handlePopupCloseButtonClick.bind(this);
    this._handlePopupDeleteCommentButtonClick = this._handlePopupDeleteCommentButtonClick.bind(this);
    this._handleCommentFormSubmit = this._handleCommentFormSubmit.bind(this);
    this._escKeyDownHandler = this._escKeyDownHandler.bind(this);

    this._film = null;
  }

  init(film, needToResetPopupState) {
    this._film = film;

    const prevFilmCard = this._filmCard;
    this._filmCard = new FilmCardView(this._film);

    this._setFilmCardHandlers();

    if (prevFilmCard === null) {
      render(this._filmListContainer, this._filmCard);
    } else {
      replace(this._filmCard, prevFilmCard);
      remove(prevFilmCard);
    }

    if (this._mode === Mode.DEFAULT) {
      return;
    }

    const updatedDataForPopup = needToResetPopupState ? Object.assign(
      {},
      this._film,
      {
        'state': {
          commentText: '',
          deletingCommentId: null,
          emotion: null,
          isDisabled: false,
          isDeleting: false,
          isSaving: false,
        },
      }) :
      this._film;

    this._filmPopup.updateData(updatedDataForPopup);
  }

  destroy() {
    remove(this._filmCard);

    if (this._filmPopup) {
      remove(this._filmPopup);
    }
  }

  resetView() {
    if (this._mode === Mode.POPUP) {
      this._hidePopup();
    }
  }

  setViewState(state, deletingCommentId, shakingElementSelector) {
    if (this._mode === Mode.DEFAULT) {
      return;
    }

    const resetFormState = () => {
      this._filmPopup.updateData({
        'state': {
          deletingCommentId: null,
          isSaving: false,
          isDeleting: false,
          isDisabled: false,
        },
      });
    };

    switch (state) {
      case State.SAVING:
        this._filmPopup.updateData({
          'state': {
            isDisabled: true,
            isSaving: true,
          },
        });
        break;
      case State.DELETING:
        this._filmPopup.updateData({
          'state': {
            isDisabled: true,
            isDeleting: true,
            deletingCommentId,
          },
        });
        break;
      case State.ABORTING:
        this._filmPopup.shake(resetFormState, shakingElementSelector);
        break;
    }
  }

  _setFilmCardHandlers() {
    this._filmCard.setWatchlistButtonClickHandler(this._handleWatchlistButtonClick);
    this._filmCard.setWatchedButtonClickHandler(this._handleWatchedButtonClick);
    this._filmCard.setFavoriteButtonClickHandler(this._handleFavoriteButtonClick);
    this._filmCard.setOpenPopupClickHandler(this._handleFilmCardClick);
  }

  _setFilmPopupHandlers() {
    this._filmPopup.setWatchlistButtonClickHandler(this._handleWatchlistButtonClick);
    this._filmPopup.setWatchedButtonClickHandler(this._handleWatchedButtonClick);
    this._filmPopup.setFavoriteButtonClickHandler(this._handleFavoriteButtonClick);
    this._filmPopup.setCloseButtonClickHandler(this._handlePopupCloseButtonClick);
    this._filmPopup.setDeleteCommentButtonClickHandler(this._handlePopupDeleteCommentButtonClick);
    this._filmPopup.setCommentFormSubmitHandler(this._handleCommentFormSubmit);
  }

  _showPopup() {
    this._changeMode();
    this._mode = Mode.POPUP;

    this._api.getComments(this._film.id)
      .then((comments) => {
        this._commentsModel.setComments(comments);
      })
      .catch(() => {
        this._commentsModel.setComments([]);
      })
      .finally(() => {
        this._filmPopup = new FilmPopupView(this._film, this._commentsModel);
        this._setFilmPopupHandlers();

        this._siteBody.classList.add('hide-overflow');
        render(this._siteBody, this._filmPopup);

        document.addEventListener('keydown', this._escKeyDownHandler);
      });
  }

  _hidePopup() {
    this._mode = Mode.DEFAULT;

    this._siteBody.classList.remove('hide-overflow');
    remove(this._filmPopup);
    this._filmPopup = null;

    document.removeEventListener('keydown', this._escKeyDownHandler);
  }

  _handleWatchlistButtonClick() {
    const updateType = this._filterModel.getFilter() === FilterType.ALL ? UpdateType.PATCH : UpdateType.MINOR;

    this._changeData(
      UserAction.UPDATE_FILM,
      updateType,
      Object.assign(
        {},
        this._film,
        {
          userDetails: {
            ...this._film.userDetails,
            watchlist: !this._film.userDetails.watchlist,
          },
        },
      ),
    );
  }

  _handleWatchedButtonClick() {
    const updateType = this._filterModel.getFilter() === FilterType.ALL ? UpdateType.PATCH : UpdateType.MINOR;

    this._changeData(
      UserAction.UPDATE_FILM,
      updateType,
      Object.assign(
        {},
        this._film,
        {
          userDetails: {
            ...this._film.userDetails,
            alreadyWatched: !this._film.userDetails.alreadyWatched,
          },
        },
      ),
    );
  }

  _handleFavoriteButtonClick() {
    const updateType = this._filterModel.getFilter() === FilterType.ALL ? UpdateType.PATCH : UpdateType.MINOR;

    this._changeData(
      UserAction.UPDATE_FILM,
      updateType,
      Object.assign(
        {},
        this._film,
        {
          userDetails: {
            ...this._film.userDetails,
            favorite: !this._film.userDetails.favorite,
          },
        },
      ),
    );
  }

  _handleFilmCardClick() {
    this._showPopup();
  }

  _handlePopupCloseButtonClick() {
    this._hidePopup();
  }

  _handlePopupDeleteCommentButtonClick(commentId) {
    this._changeData(
      UserAction.DELETE_COMMENT,
      UpdateType.PATCH,
      Object.assign(
        {},
        this._film,
      ),
      commentId,
    );
  }

  _handleCommentFormSubmit(comment) {
    this._changeData(
      UserAction.ADD_COMMENT,
      UpdateType.COMMENT,
      Object.assign(
        {},
        this._film,
      ),
      null,
      comment,
    );
  }

  _escKeyDownHandler(evt) {
    if (evt.key === Key.ESCAPE) {
      evt.preventDefault();
      this._hidePopup();
    }
  }
}
