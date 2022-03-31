// Support class for managing Timeranges and availabilities
import moment from 'moment-timezone';

const getTimezonedMoment = timezone => date =>
  date ? moment.tz(date, timezone) : moment.tz(timezone);

class Timerange {
  // Default Timerange is starting from now and ending in a week from now
  // Default Timezone is Europe/Berlin
  constructor(from, to, timezone) {
    // We have to use the timezone, so we don't define the default values
    // in the arguments of the constructor, but here following
    const ignoreCache = true;
    this.timezone = timezone || moment.tz.guess(ignoreCache);

    const tzMoment = getTimezonedMoment(this.timezone);
    // Create a new instance in order to not messing up with the given input and make sure it is a moment object from now on
    this.from = (to && from) || tzMoment();
    // We don't want to rely on the server timezone. So we take the passed date for granted and we set the timezone.
    this.from = tzMoment(this.from);

    this.to = (from && to) || this.from.clone().add(1, 'week');
    this.to = tzMoment(this.to); // Create a new instance in order to not messing up with the given input and make sure it is a moment object from now on

    // If the to is not 999 milliseconds we have to remove 1 millisecond -> from 9:00 to 12:00 for us means from 9:00 to 11:59:59....
    if (this.to.get('millisecond') !== 999 && !this.to.isSame(this.from)) {
      this.to.subtract(1, 'millisecond');
    }

    if (this.from.isAfter(this.to)) {
      throw new Error('[Timerange] "from" cannot be before "to"');
    }
  }

  /**
   * It returns true if they are the same
   * @param timerange
   * @returns {*|boolean}
   */
  isSame(timerange) {
    return this.from.isSame(timerange.from) && this.to.isSame(timerange.to);
  }

  /**
   * Return true if the first timerange contains the second
   * It returns true if they are the same, too
   * @param timerange
   * @returns {*|boolean}
   */
  contains(timerange) {
    return this.from.isSameOrBefore(timerange.from) && this.to.isSameOrAfter(timerange.to);
  }

  /**
   * Return true if the first timerange contains the second
   * It returns false if from/to is equal to the other from/to
   * @param timerange
   * @returns {*|boolean}
   */
  strictlyContains(timerange) {
    return this.from.isBefore(timerange.from) && this.to.isAfter(timerange.to);
  }

  /**
   * Return true if the two Timeranges overlap
   * @param timerange
   * @returns {*|boolean}
   */
  overlaps(timerange) {
    const [firstTimerange, secondTimerange] = [this, timerange].sort(Timerange.comparatorAsc);
    return firstTimerange.to.isAfter(secondTimerange.from);
  }

  /**
   * Return true if this Timerange is before the second one
   * It is before if the from is before the from of the second one.
   * Or if the from is the same, then is before if the to is before the to of the second one
   * @param timerange
   * @returns {*|boolean}
   */
  isBefore(timerange) {
    if (this.from.isSame(timerange.from)) {
      return this.to.isBefore(timerange.to);
    }
    return this.from.isBefore(timerange.from);
  }

  /**
   * Return true if this Timerange is after the second one
   * It is after if the from is after the from of the second one.
   * Or if the from is the same, then is after if the to is after the to of the second one
   * @param timerange
   * @returns {*|boolean}
   */
  isAfter(timerange) {
    if (this.from.isSame(timerange.from)) {
      return this.to.isAfter(timerange.to);
    }
    return this.from.isAfter(timerange.from);
  }

  /**
   * Return true if this Timerange is adjacent to the second one
   * It returns true if this is before OR after the second one
   * @param timerange
   * @returns {*|boolean}
   */
  isAdjacent(timerange) {
    const fromMinusOneMs = timerange.from.clone().subtract(1, 'millisecond');
    const thisFromMinusOneMs = this.from.clone().subtract(1, 'millisecond');

    return (
      this.to.isSame(timerange.from) ||
      this.to.isSame(fromMinusOneMs) ||
      this.from.isSame(timerange.to) ||
      fromMinusOneMs.isSame(timerange.to)
    );
  }

  /**
   * Add two Timeranges
   * It returns an array of Timeranges if they don't overlap or are not adjacents
   * It returns a new Timerange if they overlap or they are adjacents
   */
  add(timerange) {
    const [firstTimerange, secondTimerange] = [this, timerange].sort(Timerange.comparatorAsc);

    if (firstTimerange.isAdjacent(secondTimerange) || firstTimerange.overlaps(secondTimerange)) {
      // They are adjacents or they overlap
      return new Timerange(firstTimerange.from, secondTimerange.to, this.timezone);
    }
    return [firstTimerange, secondTimerange];
  }

  /**
   * Subtract two Timeranges
   * It returns an error if they don't overlap
   * It returns a new Timerange or an array of Timeranges if they overlap
   */
  subtract(timerange) {
    const [firstTimerange, secondTimerange] = [this, timerange];

    if (!firstTimerange.overlaps(secondTimerange) || firstTimerange.isAdjacent(secondTimerange)) {
      throw new Error(`Impossible to subtract these two timeranges!
        'Timerange1: ${firstTimerange}
        'Timerange2: ${secondTimerange}`);
    }

    // If they are the same or the second is bigger and contains this, we return an empty array
    if (firstTimerange.isSame(secondTimerange) || secondTimerange.contains(this)) {
      return [];
    }

    let firstHalf;
    if (firstTimerange.from.isBefore(secondTimerange.from)) {
      firstHalf = new Timerange(
        firstTimerange.from,
        secondTimerange.from.clone().subtract(1, 'millisecond'),
        this.timezone
      );
    }

    let secondHalf;
    if (firstTimerange.to.isAfter(secondTimerange.to)) {
      secondHalf = new Timerange(
        secondTimerange.to.clone().add(1, 'millisecond'),
        firstTimerange.to,
        this.timezone
      );
    }

    if (firstHalf && secondHalf) {
      return [firstHalf, secondHalf];
    }
    if (firstHalf) {
      return firstHalf;
    }
    return secondHalf;
  }

  /**
   * Clone a Timerange (the moment objects are cloned in the constructor)
   * @returns {Timerange}
   */
  clone() {
    return new Timerange(this.from, this.to, this.timezone);
  }

  /**
   * Split a Timerange with blocks of a certain timeframe.
   * The removeLastIfSmaller argument will tell the function if
   * it shouldn't return the last piece in case this would be smaller than the specified timeframe
   * @returns [Timerange]
   */
  split(
    durationNum = 30,
    durationUnit = 'minute',
    removeLastIfSmaller,
    paceNum = durationNum,
    paceUnit = durationUnit
  ) {
    const result = [];
    const curr = this.from.clone();
    while (curr.isBefore(this.to)) {
      let to = curr
        .clone()
        .add(durationNum, durationUnit)
        .subtract(1, 'millisecond');

      const surpassed = to.isAfter(this.to);
      if (surpassed) {
        ({ to } = this);
      }

      if (!surpassed || !removeLastIfSmaller) {
        result.push(new Timerange(curr, to, this.timezone));
      }

      curr.add(paceNum, paceUnit);
    }
    return result;
  }

  toString() {
    return `${this.from.toDate()} - ${this.to.toDate()}`;
  }

  getDuration() {
    return moment.duration(this.to.diff(this.from));
  }

  static comparatorDesc(tr1, tr2) {
    if (tr1.isSame(tr2)) {
      return 0;
    }
    if (tr1.isBefore(tr2)) {
      return 1;
    }
    // is after
    return -1;
  }

  static comparatorAsc(tr1, tr2) {
    return Timerange.comparatorDesc(tr1, tr2) * -1;
  }
}

module.exports = Timerange;
