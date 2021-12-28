import Abstract from './abstract';
import {getWatchedFilmsAmount} from '../utils/film';
import {getRank} from '../utils/rank';

const createRatingTemplate = (watchedFilmsAmount) => {
  const rank = getRank(watchedFilmsAmount);

  return rank ? `<p class="profile__rating">${rank}</p>` : '';
};

const createUserProfileTemplate = (films) => {
  const watchedFilmsAmount = getWatchedFilmsAmount(films);

  if (!watchedFilmsAmount) {
    return ' ';
  }

  const ratingTemplate = createRatingTemplate(watchedFilmsAmount);

  return `<section class="header__profile profile">
    ${ratingTemplate}
    <img class="profile__avatar" src="images/bitmap@2x.png" alt="Avatar" width="35" height="35">
  </section>`;
};

export default class UserProfile extends Abstract {
  constructor(films) {
    super();

    this._films = films;
  }

  getTemplate() {
    return createUserProfileTemplate(this._films);
  }
}
