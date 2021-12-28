import Abstract from './abstract';

export default class Smart extends Abstract {
  constructor() {
    super();

    this._data = {};
  }

  updateElement() {
    const prevElement = this.getElement();
    const scrollTop = prevElement.scrollTop;
    const parent = prevElement.parentElement;
    this.removeElement();

    const newElement = this.getElement();

    parent.replaceChild(newElement, prevElement);

    this.restoreHandlers();

    this.getElement().scrollTop = scrollTop;
  }

  updateData(update, onlyDataUpdate = false) {
    if (!update) {
      return;
    }

    if ('state' in update) {
      this._data.state = Object.assign(
        {},
        this._data.state,
        update.state,
      );
    } else {
      this._data = Object.assign(
        {},
        this._data,
        update,
      );
    }

    if (onlyDataUpdate) {
      return;
    }

    this.updateElement();
  }

  restoreHandlers() {
    throw new Error('Abstract method not implemented: resetHandlers');
  }
}
