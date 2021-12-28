import Abstract from './abstract';

import {SortingType} from '../constants';

const createSortingTemplate = (currentSortingType) => `<ul class="sort">
    <li><a href="#" class="sort__button ${currentSortingType === SortingType.DEFAULT ? 'sort__button--active' : ''}" data-sorting-type="${SortingType.DEFAULT}">Sort by default</a></li>
    <li><a href="#" class="sort__button ${currentSortingType === SortingType.DATE ? 'sort__button--active' : ''}" data-sorting-type="${SortingType.DATE}">Sort by date</a></li>
    <li><a href="#" class="sort__button ${currentSortingType === SortingType.RATING ? 'sort__button--active' : ''}" data-sorting-type="${SortingType.RATING}">Sort by rating</a></li>
  </ul>`;

export default class Sorting extends Abstract {
  constructor(currentSortingType) {
    super();

    this._currentSortingType = currentSortingType;

    this._sortingTypeChangeHandler = this._sortingTypeChangeHandler.bind(this);
  }

  getTemplate() {
    return createSortingTemplate(this._currentSortingType);
  }

  setSortingTypeChangeHandler(callback) {
    this._callback.sortingTypeChange = callback;
    this.getElement().addEventListener('click', this._sortingTypeChangeHandler);
  }

  _sortingTypeChangeHandler(evt) {
    if (evt.target.tagName !== 'A') {
      return;
    }

    evt.preventDefault();
    this._callback.sortingTypeChange(evt.target.dataset.sortingType);
  }
}
