import FooterStatisticView from './view/footer-statistic';
import NotificationView from './view/notification';
import SiteMenuView from './view/site-menu';
import StatsView from './view/stats';

import FilmListPresenter from './presenter/film-list';
import FilterPresenter from './presenter/filter';

import CommentModel from './model/comments';
import FilmsModel from './model/films';
import FilterModel from './model/filter';

import {FilterType, MenuItem, UpdateType} from './constants';

import Api from './api/api';
import Store from './api/store';
import Provider from './api/provider';

import {remove, render, RenderPosition} from './utils/render';

const AUTHORIZATION = 'Basic x8zj1qbe6pzt6en';
const END_POINT = 'https://14.ecmascript.pages.academy/cinemaddict';
const STORE_PREFIX = 'cinemaddict-localstorage';
const STORE_VER = 'v14';
const STORE_NAME = `${STORE_PREFIX}-${STORE_VER}`;

const PageMode = {
  FILMS: 'FILMS',
  STATS: 'STATS',
};

const api = new Api(END_POINT, AUTHORIZATION);
const store = new Store(STORE_NAME, window.localStorage);
const apiWithProvider = new Provider(api, store);

const filmsModel = new FilmsModel();
const filterModel = new FilterModel();
const commentsModel = new CommentModel();

const noInternetNotification = new NotificationView('No internet connection', 'notification--error');

const siteBody = document.body;
const siteHeader = siteBody.querySelector('.header');
const siteMain = siteBody.querySelector('.main');
const siteFooter = siteBody.querySelector('.footer');

const siteMenu = new SiteMenuView();
render(siteMain, siteMenu);

const filterPresenter = new FilterPresenter(siteMenu, filmsModel, filterModel);
filterPresenter.init();

const filmListPresenter = new FilmListPresenter(siteHeader, siteMain, filmsModel, filterModel, commentsModel, apiWithProvider);
filmListPresenter.init();

let currentPageMode = PageMode.FILMS;
let stats = null;

const handleSiteMenuClick = (menuItem) => {
  if (menuItem === MenuItem.STATS && currentPageMode === PageMode.FILMS) {
    currentPageMode = PageMode.STATS;

    filmListPresenter.destroy();
    filterModel.setFilter(UpdateType.MAJOR, FilterType.ALL);

    stats = new StatsView(filmsModel.getFilms());
    render(siteMain, stats);
  } else if (menuItem !== MenuItem.STATS && currentPageMode === PageMode.STATS) {

    currentPageMode = PageMode.FILMS;

    remove(stats);

    filmListPresenter.init();
    filterModel.setFilter(UpdateType.MAJOR, FilterType[menuItem.toUpperCase()]);
  }
};

const footerStatisticsContainer = siteFooter.querySelector('.footer__statistics');

apiWithProvider.getFilms()
  .then((films) => {
    filmsModel.setFilms(UpdateType.INIT, films);
  })
  .catch(() => {
    filmsModel.setFilms(UpdateType.INIT, []);
  })
  .finally(() => {
    siteMenu.setMenuClickHandler(handleSiteMenuClick);

    render(footerStatisticsContainer, new FooterStatisticView(filmsModel.getFilms()));
  });

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', {scope: './'}).then((registration) => {
      // eslint-disable-next-line no-console
      console.log('Service worker зарегистрирован:', registration);
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.log('Ошибка при регистрации service worker-а:', error);
    });
  } else {
    // eslint-disable-next-line no-console
    console.log('Текущий браузер не поддерживает service worker-ы.');
  }
});

window.addEventListener('online', () => {
  document.title = document.title.replace(' [offline]', '');
  siteBody.classList.remove('has-notification');
  remove(noInternetNotification);

  apiWithProvider.sync();
});

window.addEventListener('offline', () => {
  document.title += ' [offline]';
  siteBody.classList.add('has-notification');
  render(siteBody, noInternetNotification, RenderPosition.AFTERBEGIN);
});
