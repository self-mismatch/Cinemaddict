import Abstract from './abstract';

const createFooterStatisticTemplate = (films) => `<p>${films.length} movies inside</p>`;

export default class FooterStatistic extends Abstract {
  constructor(films) {
    super();

    this._films = films;
  }

  getTemplate() {
    return createFooterStatisticTemplate(this._films);
  }
}
