import moment from 'moment-timezone';
import Timerange from './Timerange';

const berlinTimezone = 'Europe/Berlin';
const nyTimezone = 'America/New_York';

const dates = {
  fourthOfJuly2018: {
    date: '2018-07-04 13:00',
    berlinTimestamp: 1530702000000,
    nyTimestamp: 1530723600000
  },
  twelfthOfJuly2018: {
    date: '2018-07-12 15:00',
    berlinTimestamp: 1531400400000,
    nyTimestamp: 1531422000000
  },
  fourteenthOfJuly2018: {
    date: '2018-07-14 18:00',
    berlinTimestamp: 1531584000000,
    nyTimestamp: 1531605600000
  },
  eighteenthOfJuly2018: {
    date: '2018-07-18 09:00',
    berlinTimestamp: 1531897200000,
    nyTimestamp: 1531918800000
  }
};

const checkTimerange = (timerange, timestampFrom, timestampTo, timezone) => {
  expect(timerange).toBeInstanceOf(Timerange);
  expect(timerange.from).toBeInstanceOf(moment);
  expect(timerange.to).toBeInstanceOf(moment);
  expect(timerange.from.valueOf()).toBe(timestampFrom);
  expect(timerange.to.valueOf()).toBe(timestampTo);
  expect(timerange.timezone).toBe(timezone);
};

const originalTimezoneGuess = moment.tz.guess;
describe('Europe/Berlin Timezone Tests', () => {
  beforeAll(() => {
    const m = require.requireActual('moment-timezone');
    m.tz.guess = () => berlinTimezone;
  });

  afterAll(() => {
    const m = require.requireActual('moment-timezone');
    m.tz.guess = originalTimezoneGuess;
  });

  describe('Creation', () => {
    it('Should create a correct Timerange object', done => {
      const timerange = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.twelfthOfJuly2018.date,
        berlinTimezone
      );

      checkTimerange(
        timerange,
        dates.fourthOfJuly2018.berlinTimestamp,
        dates.twelfthOfJuly2018.berlinTimestamp - 1,
        berlinTimezone
      );

      done();
    });

    it('Should fail to create a Timerange object', done => {
      expect(() => {
        const timerange = new Timerange(
          dates.twelfthOfJuly2018.date,
          dates.fourthOfJuly2018.date,
          berlinTimezone
        );
      }).toThrow(Error, "[Timerange] 'from' cannot be before 'to'");
      done();
    });
  });

  describe('Add', () => {
    it('Should add two disjointed Timeranges, added in order', done => {
      const timerange1 = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.twelfthOfJuly2018.date,
        berlinTimezone
      );
      const timerange2 = new Timerange(
        dates.fourteenthOfJuly2018.date,
        dates.eighteenthOfJuly2018.date,
        berlinTimezone
      );

      const timerange3 = timerange1.add(timerange2);

      expect(Array.isArray(timerange3)).toBe(true);
      expect(timerange3.length).toBe(2);
      checkTimerange(
        timerange3[0],
        dates.fourthOfJuly2018.berlinTimestamp,
        dates.twelfthOfJuly2018.berlinTimestamp - 1,
        berlinTimezone
      );
      checkTimerange(
        timerange3[1],
        dates.fourteenthOfJuly2018.berlinTimestamp,
        dates.eighteenthOfJuly2018.berlinTimestamp - 1,
        berlinTimezone
      );

      done();
    });

    it('Should add two disjointed Timeranges, added in reverse order', done => {
      const timerange1 = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.twelfthOfJuly2018.date,
        berlinTimezone
      );
      const timerange2 = new Timerange(
        dates.fourteenthOfJuly2018.date,
        dates.eighteenthOfJuly2018.date,
        berlinTimezone
      );

      const timerange3 = timerange2.add(timerange1);

      expect(Array.isArray(timerange3)).toBe(true);
      expect(timerange3.length).toBe(2);
      checkTimerange(
        timerange3[0],
        dates.fourthOfJuly2018.berlinTimestamp,
        dates.twelfthOfJuly2018.berlinTimestamp - 1,
        berlinTimezone
      );
      checkTimerange(
        timerange3[1],
        dates.fourteenthOfJuly2018.berlinTimestamp,
        dates.eighteenthOfJuly2018.berlinTimestamp - 1,
        berlinTimezone
      );

      done();
    });

    it('Should add two overlapping Timeranges, producing one timerange as sum', done => {
      const timerange1 = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.fourteenthOfJuly2018.date,
        berlinTimezone
      );
      const timerange2 = new Timerange(
        dates.fourteenthOfJuly2018.date,
        dates.eighteenthOfJuly2018.date,
        berlinTimezone
      );

      const timerange3 = timerange1.add(timerange2);
      checkTimerange(
        timerange3,
        dates.fourthOfJuly2018.berlinTimestamp,
        dates.eighteenthOfJuly2018.berlinTimestamp - 1,
        berlinTimezone
      );

      done();
    });

    it('Should add two overlapping Timeranges, producing one timerange as sum (added in reverse order)', done => {
      const timerange1 = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.fourteenthOfJuly2018.date,
        berlinTimezone
      );
      const timerange2 = new Timerange(
        dates.fourteenthOfJuly2018.date,
        dates.eighteenthOfJuly2018.date,
        berlinTimezone
      );

      const timerange3 = timerange2.add(timerange1);
      checkTimerange(
        timerange3,
        dates.fourthOfJuly2018.berlinTimestamp,
        dates.eighteenthOfJuly2018.berlinTimestamp - 1,
        berlinTimezone
      );

      done();
    });
  });

  describe('Subtract', () => {
    it('Should not subtract a not overlapping Timerange to another one', done => {
      const timerange1 = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.twelfthOfJuly2018.date,
        berlinTimezone
      );
      const timerange2 = new Timerange(
        dates.fourteenthOfJuly2018.date,
        dates.eighteenthOfJuly2018.date,
        berlinTimezone
      );

      expect(() => {
        const timerange3 = timerange1.subtract(timerange2);
      }).toThrow(Error, 'Impossible to subtract these two timeranges!');

      done();
    });

    it('Should subtract two overlapping Timeranges', done => {
      const timerange1 = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.fourteenthOfJuly2018.date,
        berlinTimezone
      );
      const timerange2 = new Timerange(
        dates.twelfthOfJuly2018.date,
        dates.eighteenthOfJuly2018.date,
        berlinTimezone
      );

      const timerange3 = timerange1.subtract(timerange2);

      checkTimerange(
        timerange3,
        dates.fourthOfJuly2018.berlinTimestamp,
        dates.twelfthOfJuly2018.berlinTimestamp - 1,
        berlinTimezone
      );

      done();
    });

    it('Should subtract two Timeranges, the second contained in the first one. Producing an array of Timeranges', done => {
      const timerange1 = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.eighteenthOfJuly2018.date,
        berlinTimezone
      );
      const timerange2 = new Timerange(
        dates.twelfthOfJuly2018.date,
        dates.fourteenthOfJuly2018.date,
        berlinTimezone
      );

      const timerange3 = timerange1.subtract(timerange2);

      expect(Array.isArray(timerange3)).toBe(true);
      expect(timerange3.length).toBe(2);

      checkTimerange(
        timerange3[0],
        dates.fourthOfJuly2018.berlinTimestamp,
        dates.twelfthOfJuly2018.berlinTimestamp - 1,
        berlinTimezone
      );
      checkTimerange(
        timerange3[1],
        dates.fourteenthOfJuly2018.berlinTimestamp,
        dates.eighteenthOfJuly2018.berlinTimestamp - 1,
        berlinTimezone
      );

      done();
    });

    it('Should subtract two Timeranges, the second contained in the first one, with the same from, producing a new Timerange', done => {
      const timerange1 = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.eighteenthOfJuly2018.date,
        berlinTimezone
      );
      const timerange2 = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.fourteenthOfJuly2018.date,
        berlinTimezone
      );

      const timerange3 = timerange1.subtract(timerange2);

      expect(Array.isArray(timerange3)).toBe(false);

      checkTimerange(
        timerange3,
        dates.fourteenthOfJuly2018.berlinTimestamp,
        dates.eighteenthOfJuly2018.berlinTimestamp - 1,
        berlinTimezone
      );

      done();
    });
  });

  describe('Split', () => {
    describe('Split with same pace as split size', () => {
      it('Should split 2+ days in 1 hour Timeranges', done => {
        const timerange1 = new Timerange(
          dates.twelfthOfJuly2018.date,
          dates.fourteenthOfJuly2018.date,
          berlinTimezone
        );
        const splitted = timerange1.split(1, 'hour');

        expect(Array.isArray(splitted)).toBe(true);
        expect(splitted.length).toBe(51);
        checkTimerange(
          splitted[0],
          dates.twelfthOfJuly2018.berlinTimestamp,
          moment(dates.twelfthOfJuly2018.berlinTimestamp)
            .add(1, 'h')
            .subtract(1, 'ms')
            .valueOf(),
          berlinTimezone
        );

        const controlEndFrom = moment
          .tz(dates.fourteenthOfJuly2018.date, berlinTimezone)
          .subtract(1, 'hour')
          .valueOf();

        const controlEndTo = moment
          .tz(dates.fourteenthOfJuly2018.date, berlinTimezone)
          .subtract(1, 'millisecond')
          .valueOf();

        checkTimerange(splitted[50], controlEndFrom, controlEndTo, berlinTimezone);

        done();
      });

      it('Should not split a 2 days Timerange in 4 days Timeranges', done => {
        const timerange1 = new Timerange(
          dates.twelfthOfJuly2018.date,
          dates.fourteenthOfJuly2018.date,
          berlinTimezone
        );
        const splitted = timerange1.split(4, 'day');
        expect(Array.isArray(splitted)).toBe(true);
        expect(splitted.length).toBe(1);

        checkTimerange(
          splitted[0],
          dates.twelfthOfJuly2018.berlinTimestamp,
          dates.fourteenthOfJuly2018.berlinTimestamp - 1,
          berlinTimezone
        );

        done();
      });
    });

    describe('Split with pace different to split size', () => {
      it('Should split 2+ days in 1 hour Timeranges, with pace of 30 minutes', done => {
        const timerange1 = new Timerange(
          dates.twelfthOfJuly2018.date,
          dates.fourteenthOfJuly2018.date,
          berlinTimezone
        );
        const splitted = timerange1.split(1, 'hour', false, 30, 'minutes');

        expect(Array.isArray(splitted)).toBe(true);
        expect(splitted.length).toBe(102);

        const controlStartTo = moment
          .tz(dates.twelfthOfJuly2018.date, berlinTimezone)
          .add(1, 'hour')
          .subtract(1, 'millisecond')
          .valueOf();

        checkTimerange(
          splitted[0],
          dates.twelfthOfJuly2018.berlinTimestamp,
          controlStartTo,
          berlinTimezone
        );

        const controlStartSecondElement = moment
          .tz(dates.twelfthOfJuly2018.date, berlinTimezone)
          .add(30, 'minutes')
          .valueOf();

        const controlEndSecondElement = moment(controlStartSecondElement)
          .add(1, 'h')
          .subtract(1, 'ms')
          .valueOf();

        checkTimerange(
          splitted[1],
          controlStartSecondElement,
          controlEndSecondElement,
          berlinTimezone
        );

        const controlEndFrom = moment
          .tz(dates.fourteenthOfJuly2018.date, berlinTimezone)
          .subtract(30, 'minutes')
          .valueOf();

        const controlEndTo = moment
          .tz(dates.fourteenthOfJuly2018.date, berlinTimezone)
          .subtract(1, 'millisecond')
          .valueOf();

        checkTimerange(splitted[101], controlEndFrom, controlEndTo, berlinTimezone);

        done();
      });
    });
  });

  describe('Clone', () => {
    it('Should clone a Timerange object', done => {
      const timerange1 = new Timerange(
        dates.twelfthOfJuly2018.date,
        dates.fourteenthOfJuly2018.date,
        berlinTimezone
      );

      const timerange2 = timerange1.clone();

      // They are not the same objects
      expect(timerange2).not.toBe(timerange1);
      expect(timerange2.from).not.toBe(timerange1.from);
      expect(timerange2.to).not.toBe(timerange1.to);

      // They have the same value
      expect(Array.isArray(timerange2)).toBe(false);
      checkTimerange(
        timerange2,
        timerange1.from.valueOf(),
        timerange1.to.valueOf(),
        berlinTimezone
      );
      expect(timerange2.to.valueOf()).toEqual(dates.fourteenthOfJuly2018.berlinTimestamp - 1);

      done();
    });
  });
});

describe('America/New_York Timezone Tests', () => {
  beforeAll(() => {
    const m = require.requireActual('moment-timezone');
    m.tz.guess = () => nyTimezone;
  });

  afterAll(() => {
    const m = require.requireActual('moment-timezone');
    m.tz.guess = originalTimezoneGuess;
  });

  describe('Creation', () => {
    it('Should create a correct Timerange object', done => {
      const timerange = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.twelfthOfJuly2018.date,
        nyTimezone
      );

      checkTimerange(
        timerange,
        dates.fourthOfJuly2018.nyTimestamp,
        dates.twelfthOfJuly2018.nyTimestamp - 1,
        nyTimezone
      );

      done();
    });

    it('Should fail to create a Timerange object', done => {
      expect(() => {
        const timerange = new Timerange(
          dates.twelfthOfJuly2018.date,
          dates.fourthOfJuly2018.date,
          nyTimezone
        );
      }).toThrow(Error, "[Timerange] 'from' cannot be before 'to'");
      done();
    });
  });

  describe('Add', () => {
    it('Should add two disjointed Timeranges, added in order', done => {
      const timerange1 = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.twelfthOfJuly2018.date,
        nyTimezone
      );
      const timerange2 = new Timerange(
        dates.fourteenthOfJuly2018.date,
        dates.eighteenthOfJuly2018.date,
        nyTimezone
      );

      const timerange3 = timerange1.add(timerange2);

      expect(Array.isArray(timerange3)).toBe(true);
      expect(timerange3.length).toBe(2);
      checkTimerange(
        timerange3[0],
        dates.fourthOfJuly2018.nyTimestamp,
        dates.twelfthOfJuly2018.nyTimestamp - 1,
        nyTimezone
      );
      checkTimerange(
        timerange3[1],
        dates.fourteenthOfJuly2018.nyTimestamp,
        dates.eighteenthOfJuly2018.nyTimestamp - 1,
        nyTimezone
      );

      done();
    });

    it('Should add two disjointed Timeranges, added in reverse order', done => {
      const timerange1 = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.twelfthOfJuly2018.date,
        nyTimezone
      );
      const timerange2 = new Timerange(
        dates.fourteenthOfJuly2018.date,
        dates.eighteenthOfJuly2018.date,
        nyTimezone
      );

      const timerange3 = timerange2.add(timerange1);

      expect(Array.isArray(timerange3)).toBe(true);
      expect(timerange3.length).toBe(2);
      checkTimerange(
        timerange3[0],
        dates.fourthOfJuly2018.nyTimestamp,
        dates.twelfthOfJuly2018.nyTimestamp - 1,
        nyTimezone
      );
      checkTimerange(
        timerange3[1],
        dates.fourteenthOfJuly2018.nyTimestamp,
        dates.eighteenthOfJuly2018.nyTimestamp - 1,
        nyTimezone
      );

      done();
    });

    it('Should add two overlapping Timeranges, producing one timerange as sum', done => {
      const timerange1 = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.fourteenthOfJuly2018.date,
        nyTimezone
      );
      const timerange2 = new Timerange(
        dates.fourteenthOfJuly2018.date,
        dates.eighteenthOfJuly2018.date,
        nyTimezone
      );

      const timerange3 = timerange1.add(timerange2);
      checkTimerange(
        timerange3,
        dates.fourthOfJuly2018.nyTimestamp,
        dates.eighteenthOfJuly2018.nyTimestamp - 1,
        nyTimezone
      );

      done();
    });

    it('Should add two overlapping Timeranges, producing one timerange as sum (added in reverse order)', done => {
      const timerange1 = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.fourteenthOfJuly2018.date,
        nyTimezone
      );
      const timerange2 = new Timerange(
        dates.fourteenthOfJuly2018.date,
        dates.eighteenthOfJuly2018.date,
        nyTimezone
      );

      const timerange3 = timerange2.add(timerange1);
      checkTimerange(
        timerange3,
        dates.fourthOfJuly2018.nyTimestamp,
        dates.eighteenthOfJuly2018.nyTimestamp - 1,
        nyTimezone
      );

      done();
    });
  });

  describe('Subtract', () => {
    it('Should not subtract a not overlapping Timerange to another one', done => {
      const timerange1 = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.twelfthOfJuly2018.date,
        nyTimezone
      );
      const timerange2 = new Timerange(
        dates.fourteenthOfJuly2018.date,
        dates.eighteenthOfJuly2018.date,
        nyTimezone
      );

      expect(() => {
        const timerange3 = timerange1.subtract(timerange2);
      }).toThrow(Error, 'Impossible to subtract these two timeranges!');

      done();
    });

    it('Should subtract two overlapping Timeranges', done => {
      const timerange1 = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.fourteenthOfJuly2018.date,
        nyTimezone
      );
      const timerange2 = new Timerange(
        dates.twelfthOfJuly2018.date,
        dates.eighteenthOfJuly2018.date,
        nyTimezone
      );

      const timerange3 = timerange1.subtract(timerange2);

      checkTimerange(
        timerange3,
        dates.fourthOfJuly2018.nyTimestamp,
        dates.twelfthOfJuly2018.nyTimestamp - 1,
        nyTimezone
      );

      done();
    });

    it('Should subtract two Timeranges, the second contained in the first one. Producing an array of Timeranges', done => {
      const timerange1 = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.eighteenthOfJuly2018.date,
        nyTimezone
      );
      const timerange2 = new Timerange(
        dates.twelfthOfJuly2018.date,
        dates.fourteenthOfJuly2018.date,
        nyTimezone
      );

      const timerange3 = timerange1.subtract(timerange2);

      expect(Array.isArray(timerange3)).toBe(true);
      expect(timerange3.length).toBe(2);

      checkTimerange(
        timerange3[0],
        dates.fourthOfJuly2018.nyTimestamp,
        dates.twelfthOfJuly2018.nyTimestamp - 1,
        nyTimezone
      );
      checkTimerange(
        timerange3[1],
        dates.fourteenthOfJuly2018.nyTimestamp,
        dates.eighteenthOfJuly2018.nyTimestamp - 1,
        nyTimezone
      );

      done();
    });

    it('Should subtract two Timeranges, the second contained in the first one, with the same from, producing a new Timerange', done => {
      const timerange1 = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.eighteenthOfJuly2018.date,
        nyTimezone
      );
      const timerange2 = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.fourteenthOfJuly2018.date,
        nyTimezone
      );

      const timerange3 = timerange1.subtract(timerange2);

      expect(Array.isArray(timerange3)).toBe(false);

      checkTimerange(
        timerange3,
        dates.fourteenthOfJuly2018.nyTimestamp,
        dates.eighteenthOfJuly2018.nyTimestamp - 1,
        nyTimezone
      );

      done();
    });
  });

  describe('Split', () => {
    describe('Split with same pace as split size', () => {
      it('Should split 2+ days in 1 hour Timeranges', done => {
        const timerange1 = new Timerange(
          dates.twelfthOfJuly2018.date,
          dates.fourteenthOfJuly2018.date,
          nyTimezone
        );
        const splitted = timerange1.split(1, 'hour');

        expect(Array.isArray(splitted)).toBe(true);
        expect(splitted.length).toBe(51);
        checkTimerange(
          splitted[0],
          dates.twelfthOfJuly2018.nyTimestamp,
          moment(dates.twelfthOfJuly2018.nyTimestamp)
            .add(1, 'h')
            .subtract(1, 'ms')
            .valueOf(),
          nyTimezone
        );

        const controlEndFrom = moment
          .tz(dates.fourteenthOfJuly2018.date, nyTimezone)
          .subtract(1, 'hour')
          .valueOf();

        const controlEndTo = moment
          .tz(dates.fourteenthOfJuly2018.date, nyTimezone)
          .subtract(1, 'millisecond')
          .valueOf();

        checkTimerange(splitted[50], controlEndFrom, controlEndTo, nyTimezone);

        done();
      });

      it('Should not split a 2 days Timerange in 4 days Timeranges', done => {
        const timerange1 = new Timerange(
          dates.twelfthOfJuly2018.date,
          dates.fourteenthOfJuly2018.date,
          nyTimezone
        );
        const splitted = timerange1.split(4, 'day');
        expect(Array.isArray(splitted)).toBe(true);
        expect(splitted.length).toBe(1);

        checkTimerange(
          splitted[0],
          dates.twelfthOfJuly2018.nyTimestamp,
          dates.fourteenthOfJuly2018.nyTimestamp - 1,
          nyTimezone
        );

        done();
      });
    });

    describe('Split with pace different to split size', () => {
      it('Should split 2+ days in 1 hour Timeranges, with pace of 30 minutes', done => {
        const timerange1 = new Timerange(
          dates.twelfthOfJuly2018.date,
          dates.fourteenthOfJuly2018.date,
          nyTimezone
        );
        const splitted = timerange1.split(1, 'hour', false, 30, 'minutes');

        expect(Array.isArray(splitted)).toBe(true);
        expect(splitted.length).toBe(102);

        const controlStartTo = moment
          .tz(dates.twelfthOfJuly2018.date, nyTimezone)
          .add(1, 'hour')
          .subtract(1, 'millisecond')
          .valueOf();

        checkTimerange(
          splitted[0],
          dates.twelfthOfJuly2018.nyTimestamp,
          controlStartTo,
          nyTimezone
        );

        const controlStartSecondElement = moment
          .tz(dates.twelfthOfJuly2018.date, nyTimezone)
          .add(30, 'minutes')
          .valueOf();

        const controlEndSecondElement = moment(controlStartSecondElement)
          .add(1, 'h')
          .subtract(1, 'ms')
          .valueOf();

        checkTimerange(splitted[1], controlStartSecondElement, controlEndSecondElement, nyTimezone);

        const controlEndFrom = moment
          .tz(dates.fourteenthOfJuly2018.date, nyTimezone)
          .subtract(30, 'minutes')
          .valueOf();

        const controlEndTo = moment
          .tz(dates.fourteenthOfJuly2018.date, nyTimezone)
          .subtract(1, 'millisecond')
          .valueOf();

        checkTimerange(splitted[101], controlEndFrom, controlEndTo, nyTimezone);

        done();
      });
    });
  });

  describe('Clone', () => {
    it('Should clone a Timerange object', done => {
      const timerange1 = new Timerange(
        dates.twelfthOfJuly2018.date,
        dates.fourteenthOfJuly2018.date,
        nyTimezone
      );

      const timerange2 = timerange1.clone();

      // They are not the same objects
      expect(timerange2).not.toBe(timerange1);
      expect(timerange2.from).not.toBe(timerange1.from);
      expect(timerange2.to).not.toBe(timerange1.to);

      // They have the same value
      expect(Array.isArray(timerange2)).toBe(false);
      checkTimerange(timerange2, timerange1.from.valueOf(), timerange1.to.valueOf(), nyTimezone);
      expect(timerange2.to.valueOf()).toEqual(dates.fourteenthOfJuly2018.nyTimestamp - 1);

      done();
    });
  });
});

describe('Passing Europe/Berlin as timezone, being in America/New_York', () => {
  beforeAll(() => {
    const m = require.requireActual('moment-timezone');
    m.tz.guess = () => nyTimezone;
  });

  afterAll(() => {
    const m = require.requireActual('moment-timezone');
    m.tz.guess = originalTimezoneGuess;
  });

  describe('Creation', () => {
    it('Should create a correct Timerange object', done => {
      const timerange = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.twelfthOfJuly2018.date,
        berlinTimezone
      );

      checkTimerange(
        timerange,
        dates.fourthOfJuly2018.berlinTimestamp,
        dates.twelfthOfJuly2018.berlinTimestamp - 1,
        berlinTimezone
      );

      done();
    });

    it('Should fail to create a Timerange object', done => {
      expect(() => {
        const timerange = new Timerange(
          dates.twelfthOfJuly2018.date,
          dates.fourthOfJuly2018.date,
          berlinTimezone
        );
      }).toThrow(Error, "[Timerange] 'from' cannot be before 'to'");
      done();
    });
  });

  describe('Add', () => {
    it('Should add two disjointed Timeranges, added in order', done => {
      const timerange1 = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.twelfthOfJuly2018.date,
        berlinTimezone
      );
      const timerange2 = new Timerange(
        dates.fourteenthOfJuly2018.date,
        dates.eighteenthOfJuly2018.date,
        berlinTimezone
      );

      const timerange3 = timerange1.add(timerange2);

      expect(Array.isArray(timerange3)).toBe(true);
      expect(timerange3.length).toBe(2);
      checkTimerange(
        timerange3[0],
        dates.fourthOfJuly2018.berlinTimestamp,
        dates.twelfthOfJuly2018.berlinTimestamp - 1,
        berlinTimezone
      );
      checkTimerange(
        timerange3[1],
        dates.fourteenthOfJuly2018.berlinTimestamp,
        dates.eighteenthOfJuly2018.berlinTimestamp - 1,
        berlinTimezone
      );

      done();
    });

    it('Should add two disjointed Timeranges, added in reverse order', done => {
      const timerange1 = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.twelfthOfJuly2018.date,
        berlinTimezone
      );
      const timerange2 = new Timerange(
        dates.fourteenthOfJuly2018.date,
        dates.eighteenthOfJuly2018.date,
        berlinTimezone
      );

      const timerange3 = timerange2.add(timerange1);

      expect(Array.isArray(timerange3)).toBe(true);
      expect(timerange3.length).toBe(2);
      checkTimerange(
        timerange3[0],
        dates.fourthOfJuly2018.berlinTimestamp,
        dates.twelfthOfJuly2018.berlinTimestamp - 1,
        berlinTimezone
      );
      checkTimerange(
        timerange3[1],
        dates.fourteenthOfJuly2018.berlinTimestamp,
        dates.eighteenthOfJuly2018.berlinTimestamp - 1,
        berlinTimezone
      );

      done();
    });

    it('Should add two overlapping Timeranges, producing one timerange as sum', done => {
      const timerange1 = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.fourteenthOfJuly2018.date,
        berlinTimezone
      );
      const timerange2 = new Timerange(
        dates.fourteenthOfJuly2018.date,
        dates.eighteenthOfJuly2018.date,
        berlinTimezone
      );

      const timerange3 = timerange1.add(timerange2);
      checkTimerange(
        timerange3,
        dates.fourthOfJuly2018.berlinTimestamp,
        dates.eighteenthOfJuly2018.berlinTimestamp - 1,
        berlinTimezone
      );

      done();
    });

    it('Should add two overlapping Timeranges, producing one timerange as sum (added in reverse order)', done => {
      const timerange1 = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.fourteenthOfJuly2018.date,
        berlinTimezone
      );
      const timerange2 = new Timerange(
        dates.fourteenthOfJuly2018.date,
        dates.eighteenthOfJuly2018.date,
        berlinTimezone
      );

      const timerange3 = timerange2.add(timerange1);
      checkTimerange(
        timerange3,
        dates.fourthOfJuly2018.berlinTimestamp,
        dates.eighteenthOfJuly2018.berlinTimestamp - 1,
        berlinTimezone
      );

      done();
    });
  });

  describe('Subtract', () => {
    it('Should not subtract a not overlapping Timerange to another one', done => {
      const timerange1 = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.twelfthOfJuly2018.date,
        berlinTimezone
      );
      const timerange2 = new Timerange(
        dates.fourteenthOfJuly2018.date,
        dates.eighteenthOfJuly2018.date,
        berlinTimezone
      );

      expect(() => {
        const timerange3 = timerange1.subtract(timerange2);
      }).toThrow(Error, 'Impossible to subtract these two timeranges!');

      done();
    });

    it('Should subtract two overlapping Timeranges', done => {
      const timerange1 = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.fourteenthOfJuly2018.date,
        berlinTimezone
      );
      const timerange2 = new Timerange(
        dates.twelfthOfJuly2018.date,
        dates.eighteenthOfJuly2018.date,
        berlinTimezone
      );

      const timerange3 = timerange1.subtract(timerange2);

      checkTimerange(
        timerange3,
        dates.fourthOfJuly2018.berlinTimestamp,
        dates.twelfthOfJuly2018.berlinTimestamp - 1,
        berlinTimezone
      );

      done();
    });

    it('Should subtract two Timeranges, the second contained in the first one. Producing an array of Timeranges', done => {
      const timerange1 = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.eighteenthOfJuly2018.date,
        berlinTimezone
      );
      const timerange2 = new Timerange(
        dates.twelfthOfJuly2018.date,
        dates.fourteenthOfJuly2018.date,
        berlinTimezone
      );

      const timerange3 = timerange1.subtract(timerange2);

      expect(Array.isArray(timerange3)).toBe(true);
      expect(timerange3.length).toBe(2);

      checkTimerange(
        timerange3[0],
        dates.fourthOfJuly2018.berlinTimestamp,
        dates.twelfthOfJuly2018.berlinTimestamp - 1,
        berlinTimezone
      );
      checkTimerange(
        timerange3[1],
        dates.fourteenthOfJuly2018.berlinTimestamp,
        dates.eighteenthOfJuly2018.berlinTimestamp - 1,
        berlinTimezone
      );

      done();
    });

    it('Should subtract two Timeranges, the second contained in the first one, with the same from, producing a new Timerange', done => {
      const timerange1 = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.eighteenthOfJuly2018.date,
        berlinTimezone
      );
      const timerange2 = new Timerange(
        dates.fourthOfJuly2018.date,
        dates.fourteenthOfJuly2018.date,
        berlinTimezone
      );

      const timerange3 = timerange1.subtract(timerange2);

      expect(Array.isArray(timerange3)).toBe(false);

      checkTimerange(
        timerange3,
        dates.fourteenthOfJuly2018.berlinTimestamp,
        dates.eighteenthOfJuly2018.berlinTimestamp - 1,
        berlinTimezone
      );

      done();
    });
  });

  describe('Split', () => {
    describe('Split with same pace as split size', () => {
      it('Should split 2+ days in 1 hour Timeranges', done => {
        const timerange1 = new Timerange(
          dates.twelfthOfJuly2018.date,
          dates.fourteenthOfJuly2018.date,
          berlinTimezone
        );
        const splitted = timerange1.split(1, 'hour');

        expect(Array.isArray(splitted)).toBe(true);
        expect(splitted.length).toBe(51);
        checkTimerange(
          splitted[0],
          dates.twelfthOfJuly2018.berlinTimestamp,
          moment(dates.twelfthOfJuly2018.berlinTimestamp)
            .add(1, 'h')
            .subtract(1, 'ms')
            .valueOf(),
          berlinTimezone
        );

        const controlEndFrom = moment
          .tz(dates.fourteenthOfJuly2018.date, berlinTimezone)
          .subtract(1, 'hour')
          .valueOf();

        const controlEndTo = moment
          .tz(dates.fourteenthOfJuly2018.date, berlinTimezone)
          .subtract(1, 'millisecond')
          .valueOf();

        checkTimerange(splitted[50], controlEndFrom, controlEndTo, berlinTimezone);

        done();
      });

      it('Should not split a 2 days Timerange in 4 days Timeranges', done => {
        const timerange1 = new Timerange(
          dates.twelfthOfJuly2018.date,
          dates.fourteenthOfJuly2018.date,
          berlinTimezone
        );
        const splitted = timerange1.split(4, 'day');
        expect(Array.isArray(splitted)).toBe(true);
        expect(splitted.length).toBe(1);

        checkTimerange(
          splitted[0],
          dates.twelfthOfJuly2018.berlinTimestamp,
          dates.fourteenthOfJuly2018.berlinTimestamp - 1,
          berlinTimezone
        );

        done();
      });
    });

    describe('Split with pace different to split size', () => {
      it('Should split 2+ days in 1 hour Timeranges, with pace of 30 minutes', done => {
        const timerange1 = new Timerange(
          dates.twelfthOfJuly2018.date,
          dates.fourteenthOfJuly2018.date,
          berlinTimezone
        );
        const splitted = timerange1.split(1, 'hour', false, 30, 'minutes');

        expect(Array.isArray(splitted)).toBe(true);
        expect(splitted.length).toBe(102);

        const controlStartTo = moment
          .tz(dates.twelfthOfJuly2018.date, berlinTimezone)
          .add(1, 'hour')
          .subtract(1, 'millisecond')
          .valueOf();

        checkTimerange(
          splitted[0],
          dates.twelfthOfJuly2018.berlinTimestamp,
          controlStartTo,
          berlinTimezone
        );

        const controlStartSecondElement = moment
          .tz(dates.twelfthOfJuly2018.date, berlinTimezone)
          .add(30, 'minutes')
          .valueOf();

        const controlEndSecondElement = moment(controlStartSecondElement)
          .add(1, 'h')
          .subtract(1, 'ms')
          .valueOf();

        checkTimerange(
          splitted[1],
          controlStartSecondElement,
          controlEndSecondElement,
          berlinTimezone
        );

        const controlEndFrom = moment
          .tz(dates.fourteenthOfJuly2018.date, berlinTimezone)
          .subtract(30, 'minutes')
          .valueOf();

        const controlEndTo = moment
          .tz(dates.fourteenthOfJuly2018.date, berlinTimezone)
          .subtract(1, 'millisecond')
          .valueOf();

        checkTimerange(splitted[101], controlEndFrom, controlEndTo, berlinTimezone);

        done();
      });
    });
  });

  describe('Clone', () => {
    it('Should clone a Timerange object', done => {
      const timerange1 = new Timerange(
        dates.twelfthOfJuly2018.date,
        dates.fourteenthOfJuly2018.date,
        berlinTimezone
      );

      const timerange2 = timerange1.clone();

      // They are not the same objects
      expect(timerange2).not.toBe(timerange1);
      expect(timerange2.from).not.toBe(timerange1.from);
      expect(timerange2.to).not.toBe(timerange1.to);

      // They have the same value
      expect(Array.isArray(timerange2)).toBe(false);
      checkTimerange(
        timerange2,
        timerange1.from.valueOf(),
        timerange1.to.valueOf(),
        berlinTimezone
      );
      expect(timerange2.to.valueOf()).toEqual(dates.fourteenthOfJuly2018.berlinTimestamp - 1);

      done();
    });
  });
});

