import {MOST_COMMENTED_FILM_AMOUNT, TOP_RATED_FILM_AMOUNT} from '../constants';

const getMostCommentedFilms = (films) => films.slice().sort((second, first) => first.comments.length - second.comments.length).slice(0, MOST_COMMENTED_FILM_AMOUNT);

const getTopRatedFilms = (films) => films.slice().sort((second, first) => first.filmInfo.totalRating - second.filmInfo.totalRating).slice(0, TOP_RATED_FILM_AMOUNT);

const getWatchedFilmsAmount = (films) => films.filter((film) => film.userDetails.alreadyWatched).length;

const getWatchedFilmsRuntime = (films) => films.reduce((accumulator, currentValue) => currentValue.userDetails.alreadyWatched ? accumulator + currentValue.filmInfo.runtime : accumulator, 0);

const getSortedFilmsByDate = (films) => films.slice().sort((firstFilm, secondFilm) => secondFilm.filmInfo.releaseDate - firstFilm.filmInfo.releaseDate);

const getSortedFilmsByRating = (films) => films.slice().sort((firstFilm, secondFilm) => secondFilm.filmInfo.totalRating - firstFilm.filmInfo.totalRating);

export {getMostCommentedFilms, getTopRatedFilms, getWatchedFilmsAmount, getWatchedFilmsRuntime, getSortedFilmsByDate, getSortedFilmsByRating};
