import Observer from '../utils/observer';

export default class Films extends Observer {
  constructor() {
    super();

    this._films = [];
  }

  setFilms(updateType, films) {
    this._films = films.slice();

    this._notify(updateType);
  }

  getFilms() {
    return this._films.slice();
  }

  updateFilm(updateType, update) {
    const index = this._films.findIndex((film) => film.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting film');
    }

    this._films = [
      ...this._films.slice(0, index),
      update,
      ...this._films.slice(index + 1),
    ];

    this._notify(updateType, update);
  }

  static adaptToClient(film) {
    const adaptedFilm = Object.assign(
      {},
      film,
      {
        filmInfo: {
          ...film.film_info,
          ageRating: film.film_info.age_rating,
          alternativeTitle: film.film_info.alternative_title,
          country: film.film_info.release.release_country,
          genres: film.film_info.genre,
          releaseDate: new Date(film.film_info.release.date),
          totalRating: film.film_info.total_rating,
        },
        userDetails: {
          ...film.user_details,
          alreadyWatched: film.user_details.already_watched,
          watchingDate: film.user_details.watching_date,
        },
      },
    );

    delete adaptedFilm.film_info;
    delete adaptedFilm.filmInfo.age_rating;
    delete adaptedFilm.filmInfo.alternative_title;
    delete adaptedFilm.filmInfo.genre;
    delete adaptedFilm.filmInfo.release;
    delete adaptedFilm.filmInfo.total_rating;
    delete adaptedFilm.user_details;
    delete adaptedFilm.userDetails.already_watched;
    delete adaptedFilm.userDetails.watching_date;

    return adaptedFilm;
  }

  static adaptToServer(film) {
    const date = film.filmInfo.releaseDate instanceof Date ? film.filmInfo.releaseDate.toISOString() : new Date(film.filmInfo.releaseDate).toISOString();

    const adaptedFilm = Object.assign(
      {},
      film,
      {
        'film_info': {
          ...film.filmInfo,
          'age_rating': film.filmInfo.ageRating,
          'alternative_title': film.filmInfo.alternativeTitle,
          genre: film.filmInfo.genres,
          release: {
            'release_country': film.filmInfo.country,
            date,
          },
          'total_rating': film.filmInfo.totalRating,
        },
        'user_details': {
          ...film.userDetails,
          'already_watched': film.userDetails.alreadyWatched,
          'watching_date': film.userDetails.watchingDate,
        },
      },
    );

    delete adaptedFilm.filmInfo;
    delete adaptedFilm.film_info.ageRating;
    delete adaptedFilm.film_info.alternativeTitle;
    delete adaptedFilm.film_info.country;
    delete adaptedFilm.film_info.genres;
    delete adaptedFilm.film_info.releaseDate;
    delete adaptedFilm.film_info.totalRating;
    delete adaptedFilm.userDetails;
    delete adaptedFilm.user_details.alreadyWatched;
    delete adaptedFilm.user_details.watchingDate;

    return adaptedFilm;
  }
}
