import {StatsDate} from '../constants';

import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrBefore);

const getWatchedFilms = (films) => films.filter((film) => film.userDetails.alreadyWatched);

const getFormattedDateFrom = (dateFrom) => {
  switch (dateFrom) {
    case StatsDate.ALL_TIME:
      return null;
    case StatsDate.TODAY:
      return dayjs().startOf('day');
    default:
      return dayjs().subtract(1, dateFrom);
  }
};

const getWatchedFilmsInDateRange = (films, dateFrom) => {
  const watchedFilms = getWatchedFilms(films);

  const formattedDateFrom = getFormattedDateFrom(dateFrom);

  return formattedDateFrom ? watchedFilms.filter((film) => formattedDateFrom.isSameOrBefore(dayjs(film.userDetails.watchingDate))) : watchedFilms;
};

const getGenres = (films) => {
  const FilmGenre = {};

  const watchedFilms = getWatchedFilms(films);

  watchedFilms.forEach((film) => {
    film.filmInfo.genres.forEach((genre) => {
      if (genre in FilmGenre) {
        FilmGenre[genre] += 1;
      } else {
        FilmGenre[genre] = 1;
      }
    });
  });

  return FilmGenre;
};

const getSortedGenres = (films) => {
  const FilmGenre = getGenres(films);

  return Object.entries(FilmGenre).sort((firstGenre, secondGenre) => secondGenre[1] - firstGenre[1]);
};

const getTopGenre = (films) => getSortedGenres(films)[0][0];

export {getWatchedFilmsInDateRange, getSortedGenres, getTopGenre};
