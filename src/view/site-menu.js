import Abstract from './abstract';

const createSiteMenuTemplate = () => `<nav class="main-navigation">
    <a href="#stats" class="main-navigation__additional">Stats</a>
  </nav>`;

export default class SiteMenu extends Abstract {
  constructor() {
    super();

    this._statsMenuItem = this.getElement().querySelector('.main-navigation__additional');

    this._menuClickHandler = this._menuClickHandler.bind(this);
  }

  getTemplate() {
    return createSiteMenuTemplate();
  }

  setMenuClickHandler(callback) {
    this._callback.menuClick = callback;
    this.getElement().addEventListener('click', this._menuClickHandler);
  }

  _setStatsActive() {
    this._statsMenuItem.classList.add('main-navigation__additional--active');

    const currentActiveItem = this.getElement().querySelector('.main-navigation__item--active');
    if (currentActiveItem) {
      currentActiveItem.classList.remove('main-navigation__item--active');
    }
  }

  _unsetStatsActive() {
    this._statsMenuItem.classList.remove('main-navigation__additional--active');
  }

  _menuClickHandler(evt) {
    if (evt.target.tagName !== 'A') {
      return;
    }

    evt.preventDefault();

    const menuItem = evt.target.getAttribute('href').substr(1);
    this._callback.menuClick(menuItem);

    if (menuItem === 'stats') {
      this._setStatsActive();
    } else {
      this._unsetStatsActive();
    }
  }
}
