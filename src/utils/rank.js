const Rank = new Map([
  [21, 'Movie Buff'],
  [11, 'Fan'],
  [1, 'Novice'],
]);

const getRank = (watchedFilmsAmount) => {
  for (const key of Rank.keys()) {
    if (watchedFilmsAmount >= key) {
      return Rank.get(key);
    }
  }

  return null;
};

export {getRank};
