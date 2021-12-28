import Abstract from './abstract';

const createNotificationTemplate = (text, className = '') => `<div class="notification ${className}">${text}</div>`;

export default class Notification extends Abstract {
  constructor(text, className) {
    super();

    this._text = text;
    this._className = className;
  }

  getTemplate() {
    return createNotificationTemplate(this._text, this._className);
  }
}
