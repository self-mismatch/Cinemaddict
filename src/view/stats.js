import Smart from './smart';

import {MINUTES_IN_HOUR, StatsDate} from '../constants';

import {getWatchedFilmsAmount, getWatchedFilmsRuntime} from '../utils/film';
import {getSortedGenres, getTopGenre, getWatchedFilmsInDateRange} from '../utils/stats';
import {getRank} from '../utils/rank';

import Chart from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

const createTotalDurationTemplate = (runtime) => {
  const hours = Math.floor(runtime / MINUTES_IN_HOUR);
  const minutes = runtime - (hours * MINUTES_IN_HOUR);

  return `<p class="statistic__item-text">${hours} <span
    class="statistic__item-description">h</span> ${minutes} <span class="statistic__item-description">m</span></p>`;
};

const renderChart = (statsCtx, data) => {
  const BAR_HEIGHT = 50;

  const films = getWatchedFilmsInDateRange(data.films, data.dateFrom);

  if (films.length === 0) {
    return;
  }

  const sortedGenres = getSortedGenres(films);
  const labels = sortedGenres.map((genre) => genre[0]);
  const labelsValues = sortedGenres.map((genre) => genre[1]);

  statsCtx.height = BAR_HEIGHT * sortedGenres.length;

  return new Chart(statsCtx, {
    plugins: [ChartDataLabels],
    type: 'horizontalBar',
    data: {
      labels,
      datasets: [{
        data: labelsValues,
        backgroundColor: '#ffe800',
        hoverBackgroundColor: '#ffe800',
        anchor: 'start',
      }],
    },
    options: {
      plugins: {
        datalabels: {
          font: {
            size: 20,
          },
          color: '#ffffff',
          anchor: 'start',
          align: 'start',
          offset: 40,
        },
      },
      scales: {
        yAxes: [{
          ticks: {
            fontColor: '#ffffff',
            padding: 100,
            fontSize: 20,
          },
          gridLines: {
            display: false,
            drawBorder: false,
          },
        }],
        xAxes: [{
          ticks: {
            display: false,
            beginAtZero: true,
          },
          gridLines: {
            display: false,
            drawBorder: false,
          },
        }],
        dataset: [{
          barThickness: 24,
        }],
      },
      legend: {
        display: false,
      },
      tooltips: {
        enabled: false,
      },
    },
  });
};

const createStatsTemplate = (data) => {
  const rank = getRank(getWatchedFilmsAmount(data.films));

  const films = getWatchedFilmsInDateRange(data.films, data.dateFrom);
  const hasFilms = films.length > 0;
  const activeDateInput = data.activeDateInput;

  const watchedFilmsAmount = hasFilms ? getWatchedFilmsAmount(films) : 0;
  const watchedFilmsRuntime = hasFilms ? getWatchedFilmsRuntime(films) : 0;

  const totalDurationTemplate = createTotalDurationTemplate(watchedFilmsRuntime);
  const topGenre = hasFilms ? getTopGenre(films) : '';

  return `<section class="statistic">
    <p class="statistic__rank">
      Your rank
      <img class="statistic__img" src="images/bitmap@2x.png" alt="Avatar" width="35" height="35">
      <span class="statistic__rank-label">${rank}</span>
    </p>

    <form action="https://echo.htmlacademy.ru/" method="get" class="statistic__filters">
      <p class="statistic__filters-description">Show stats:</p>

      <input type="radio" class="statistic__filters-input visually-hidden" name="statistic-filter" id="statistic-all-time" value="${StatsDate.ALL_TIME}" ${StatsDate.ALL_TIME === activeDateInput ? 'checked' : ''}>
      <label for="statistic-all-time" class="statistic__filters-label">All time</label>

      <input type="radio" class="statistic__filters-input visually-hidden" name="statistic-filter" id="statistic-today" value="${StatsDate.TODAY}" ${StatsDate.TODAY === activeDateInput ? 'checked' : ''}>
      <label for="statistic-today" class="statistic__filters-label">Today</label>

      <input type="radio" class="statistic__filters-input visually-hidden" name="statistic-filter" id="statistic-week" value="${StatsDate.WEEK}" ${StatsDate.WEEK === activeDateInput ? 'checked' : ''}>
      <label for="statistic-week" class="statistic__filters-label">Week</label>

      <input type="radio" class="statistic__filters-input visually-hidden" name="statistic-filter" id="statistic-month" value="${StatsDate.MONTH}" ${StatsDate.MONTH === activeDateInput ? 'checked' : ''}>
      <label for="statistic-month" class="statistic__filters-label">Month</label>

      <input type="radio" class="statistic__filters-input visually-hidden" name="statistic-filter" id="statistic-year" value="${StatsDate.YEAR}" ${StatsDate.YEAR === activeDateInput ? 'checked' : ''}>
      <label for="statistic-year" class="statistic__filters-label">Year</label>
    </form>

    <ul class="statistic__text-list">
      <li class="statistic__text-item">
        <h4 class="statistic__item-title">You watched</h4>
        <p class="statistic__item-text">${watchedFilmsAmount} <span class="statistic__item-description">movies</span></p>
      </li>
      <li class="statistic__text-item">
        <h4 class="statistic__item-title">Total duration</h4>
        ${totalDurationTemplate}
      </li>
      <li class="statistic__text-item">
        <h4 class="statistic__item-title">Top genre</h4>
        <p class="statistic__item-text">${topGenre}</p>
      </li>
    </ul>

    <div class="statistic__chart-wrap">
      <canvas class="statistic__chart" width="1000"></canvas>
    </div>

  </section>`;
};

export default class Stats extends Smart {
  constructor(films) {
    super();

    this._data = {
      films,
      dateFrom: StatsDate.ALL_TIME,
      activeDateInput: StatsDate.ALL_TIME,
    };

    this._chart = null;
    this._setChart();

    this._dateChangeHandler = this._dateChangeHandler.bind(this);

    this._setDateChangeHandler();
  }

  getTemplate() {
    return createStatsTemplate(this._data);
  }

  restoreHandlers() {
    this._setChart();
    this._setDateChangeHandler();
  }

  removeElement() {
    super.removeElement();

    if (this._chart !== null) {
      this._chart = null;
    }
  }

  _setChart() {
    if (this._chart !== null) {
      this._chart = null;
    }

    const statsCtx = this.getElement().querySelector('.statistic__chart');

    this._chart = renderChart(statsCtx, this._data);
  }

  _setDateChangeHandler() {
    this.getElement().querySelector('.statistic__filters').addEventListener('change', this._dateChangeHandler);
  }

  _dateChangeHandler(evt) {
    if (evt.target.tagName !== 'INPUT') {
      return;
    }

    evt.preventDefault();

    const dateFrom = evt.target.value;
    const activeDateInput = evt.target.value;

    this.updateData({
      dateFrom,
      activeDateInput,
    });
  }
}
