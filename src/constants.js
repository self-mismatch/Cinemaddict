const MINUTES_IN_HOUR = 60;

const MOST_COMMENTED_FILM_AMOUNT = 2;
const TOP_RATED_FILM_AMOUNT = 2;

const FilterType = {
  ALL: 'all',
  WATCHLIST: 'watchlist',
  HISTORY: 'history',
  FAVORITES: 'favorites',
};

const MenuItem = {
  ALL: 'all',
  WATCHLIST: 'watchlist',
  HISTORY: 'history',
  FAVORITES: 'favorites',
  STATS: 'stats',
};

const Key = {
  ENTER: 'Enter',
  ESCAPE: 'Escape',
};

const SortingType = {
  DEFAULT: 'default',
  DATE: 'date',
  RATING: 'rating',
};

const StatsDate = {
  ALL_TIME: 'all',
  TODAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
};

const UpdateType = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
  INIT: 'INIT',
  COMMENT: 'COMMENT',
};

const UserAction = {
  ADD_COMMENT: 'ADD_COMMENT',
  DELETE_COMMENT: 'DELETE_COMMENT',
  UPDATE_FILM: 'UPDATE_FILM',
};

export {MINUTES_IN_HOUR, MOST_COMMENTED_FILM_AMOUNT, TOP_RATED_FILM_AMOUNT, FilterType, MenuItem, Key, SortingType, StatsDate, UpdateType, UserAction};
