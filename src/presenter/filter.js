import FilterView from '../view/filter.js';

import {FilterType, UpdateType} from '../constants.js';

import {RenderPosition, remove, render, replace} from '../utils/render.js';
import {filter} from '../utils/filter.js';

export default class Filter {
  constructor(filterContainer, filmsModel, filterModel) {
    this._filterContainer = filterContainer;
    this._filmsModel = filmsModel;
    this._filterModel = filterModel;

    this._filter = null;

    this._handleModelEvent = this._handleModelEvent.bind(this);
    this._handleFilterTypeChange = this._handleFilterTypeChange.bind(this);

    this._filmsModel.addObserver(this._handleModelEvent);
    this._filterModel.addObserver(this._handleModelEvent);
  }

  init() {
    const filters = this._getFilters();
    const prevFilter = this._filter;

    this._filter = new FilterView(filters, this._filterModel.getFilter());
    this._filter.setFilterTypeChangeHandler(this._handleFilterTypeChange);

    if (prevFilter === null) {
      render(this._filterContainer, this._filter, RenderPosition.AFTERBEGIN);
      return;
    }

    replace(this._filter, prevFilter);
    remove(prevFilter);
  }

  _getFilters() {
    const films = this._filmsModel.getFilms();

    return [
      {
        count: filter[FilterType.ALL](films).length,
        name: 'All movies',
        type: FilterType.ALL,
      },
      {
        count: filter[FilterType.WATCHLIST](films).length,
        name: 'Watchlist',
        type: FilterType.WATCHLIST,
      },
      {
        count: filter[FilterType.HISTORY](films).length,
        name: 'History',
        type: FilterType.HISTORY,
      },
      {
        count: filter[FilterType.FAVORITES](films).length,
        name: 'Favorites',
        type: FilterType.FAVORITES,
      },
    ];
  }

  _handleModelEvent() {
    this.init();
  }

  _handleFilterTypeChange(filterType) {
    if (this._filterModel.getFilter() === filterType) {
      return;
    }

    this._filterModel.setFilter(UpdateType.MAJOR, filterType);
  }
}
