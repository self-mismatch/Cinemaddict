import Abstract from './abstract';

const createExtraFilmTemplate = (id, title) => `<section class="films-list films-list--extra" id="${id}">
    <h2 class="films-list__title">${title}</h2>
    <div class="films-list__container"></div>
  </section>`;

export default class ExtraFilm extends Abstract {
  constructor(id, title) {
    super();

    this._id = id;
    this._title = title;
  }

  getTemplate() {
    return createExtraFilmTemplate(this._id, this._title);
  }
}
