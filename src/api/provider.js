import FilmsModel from '../model/films';

import {isOnline} from '../utils/common';

const getSyncedFilms = (items) => items.filter(({success}) => success)
  .map(({payload}) => payload.film);

const createStoreStructure = (items) => items.reduce((acc, current) => Object.assign({}, acc, {
  [current.id]: current,
}), {});

export default class Provider {
  constructor(api, store) {
    this._api = api;
    this._store = store;
  }

  getFilms() {
    if (isOnline()) {
      return this._api.getFilms()
        .then((films) => {
          const items = createStoreStructure(films);
          this._store.setItems(items);
          return films;
        });
    }

    const storeFilms = Object.values(this._store.getItems());

    return Promise.resolve(storeFilms);
  }

  updateFilm(film) {
    if (isOnline()) {
      return this._api.updateFilm(film)
        .then((updatedFilm) => {
          this._store.setItem(updatedFilm.id, updatedFilm);
          return updatedFilm;
        });
    }

    this._store.setItem(film.id, Object.assign({}, film));

    return Promise.resolve(film);
  }

  getComments(filmId) {
    if (isOnline()) {
      return this._api.getComments(filmId)
        .then((comments) => comments);
    }

    return Promise.resolve([]);
  }

  addComment(film, comment) {
    if (isOnline()) {
      return this._api.addComment(film, comment)
        .then((response) => response);
    }

    return Promise.reject();
  }

  deleteComment(commentId) {
    if (isOnline()) {
      return this._api.deleteComment(commentId)
        .then((response) => response);
    }

    return Promise.reject();
  }

  sync() {
    if (isOnline()) {
      const values = Object.values(this._store.getItems());
      const storeFilms = values.map(FilmsModel.adaptToServer);

      return this._api.sync(storeFilms)
        .then((response) => {
          const updatedFilms = getSyncedFilms(response.updated);

          const items = createStoreStructure(updatedFilms.map(FilmsModel.adaptToClient));

          this._store.setItems(items);
        });
    }

    return Promise.reject(new Error('Sync data failed'));
  }
}
