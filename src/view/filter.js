import Abstract from './abstract';
import {FilterType} from '../constants';

const createFilterTemplate = (filter, currentFilterType) => {
  const {count, name, type} = filter;

  const filterActiveClass = type === currentFilterType ? 'main-navigation__item--active' : '';

  const filterCountTemplate = count !== null && type !== FilterType.ALL ? `<span class="main-navigation__item-count">${count}</span>` : '';

  return `<a href="#${type}" class="main-navigation__item ${filterActiveClass}">${name} ${filterCountTemplate}</a>`;
};

const createFiltersTemplate = (filters, currentFilterType) => {
  const filtersTemplate = filters
    .map((filter) => createFilterTemplate(filter, currentFilterType))
    .join('');

  return `<div class="main-navigation__items">
    ${filtersTemplate}
  </div>`;
};

export default class Filter extends Abstract {
  constructor(filters, currentFilterType) {
    super();

    this._filters = filters;
    this._currentFilterType = currentFilterType;

    this._filterTypeChangeHandler = this._filterTypeChangeHandler.bind(this);
  }

  getTemplate() {
    return createFiltersTemplate(this._filters, this._currentFilterType);
  }

  setFilterTypeChangeHandler(callback) {
    this._callback.filterTypeChange = callback;
    this.getElement().addEventListener('click', this._filterTypeChangeHandler);
  }

  _filterTypeChangeHandler(evt) {
    if (evt.target.tagName !== 'A' && evt.target.tagName !== 'SPAN') {
      return;
    }

    evt.preventDefault();

    const filterLink = evt.target.tagName === 'A' ? evt.target : evt.target.parentElement;

    this._callback.filterTypeChange(filterLink.getAttribute('href').substr(1));
  }
}
