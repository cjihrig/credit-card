var Code = require('code');
var Lab = require('lab');
var CreditCard = require('../');

var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;


// a list of test credit cards is available at:
// http://www.paypalobjects.com/en_US/vhelp/paypalmanager_help/credit_card_numbers.htm


describe('CreditCard', function() {
  lab.beforeEach(function(done) {
    CreditCard.reset();
    done();
  });


  describe('#validate()', function() {
    it('no invalid responses on valid card', function(done) {
      var card = {
        cardType: 'VISA',
        number: '4111111111111111',
        expiryMonth: '03',
        expiryYear: '2100',
        cvv: '123'
      };
      var validation = CreditCard.validate(card);

      expect(validation.card).to.deep.equal(card);
      expect(validation.validCardNumber).to.equal(true);
      expect(validation.validExpiryMonth).to.equal(true);
      expect(validation.validExpiryYear).to.equal(true);
      expect(validation.validCvv).to.equal(true);
      expect(validation.isExpired).to.equal(false);
      expect(validation.customValidation).to.not.exist();
      done();
    });

    it('validates a card using a custom schema', function(done) {
      var schema = {
        cardType: 'type',
        number: 'number',
        expiryMonth: 'expire_month',
        expiryYear: 'expire_year',
        cvv: 'cvv2'
      };
      var card = {
        type: 'visa',
        number: '4111111111111111',
        expire_month: '03',
        expire_year: '2100',
        cvv2: '123'
      };
      var validation = CreditCard.validate(card, {
        schema: schema
      });

      expect(validation.card).to.deep.equal(card);
      expect(validation.validCardNumber).to.equal(true);
      expect(validation.validExpiryMonth).to.equal(true);
      expect(validation.validExpiryYear).to.equal(true);
      expect(validation.validCvv).to.equal(true);
      expect(validation.isExpired).to.equal(false);
      expect(validation.customValidation).to.not.exist();
      done();
    });

    it('no invalid responses on valid card by alias', function(done) {
      var card = {
        cardType: 'VC',
        number: '4111111111111111',
        expiryMonth: '03',
        expiryYear: '2100',
        cvv: '123'
      };
      var validation = CreditCard.validate(card);

      expect(validation.card).to.deep.equal(card);
      expect(validation.validCardNumber).to.equal(true);
      expect(validation.validExpiryMonth).to.equal(true);
      expect(validation.validExpiryYear).to.equal(true);
      expect(validation.validCvv).to.equal(true);
      expect(validation.isExpired).to.equal(false);
      expect(validation.customValidation).to.not.exist();
      done();
    });

    it('invalid responses on invalid card', function(done) {
      var card = {
        cardType: 'VISA',
        number: '4111111111111112',
        expiryMonth: '00',
        expiryYear: '2100',
        cvv: '123'
      };
      var validation = CreditCard.validate(card);

      expect(validation.card).to.deep.equal(card);
      expect(validation.validCardNumber).to.equal(false);
      expect(validation.validExpiryMonth).to.equal(false);
      expect(validation.validExpiryYear).to.equal(true);
      expect(validation.validCvv).to.equal(true);
      expect(validation.isExpired).to.equal(false);
      expect(validation.customValidation).to.not.exist();
      done();
    });

    it('invalid responses on no card', function(done) {
      var validation = CreditCard.validate();

      expect(validation.card).to.deep.equal({});
      expect(validation.validCardNumber).to.equal(false);
      expect(validation.validExpiryMonth).to.equal(false);
      expect(validation.validExpiryYear).to.equal(false);
      expect(validation.validCvv).to.equal(false);
      expect(validation.isExpired).to.equal(true);
      expect(validation.customValidation).to.not.exist();
      done();
    });

    it('provides custom validation function', function(done) {
      var card = {
        cardType: 'VISA',
        number: '4111111111111111',
        expiryMonth: '03',
        expiryYear: '2100',
        cvv: '123',
        pin: '7890'
      };
      var options = {
        customValidation: function(card, settings) {
          return card.pin === '7890';
        }
      };
      var validation = CreditCard.validate(card, options);

      expect(validation.card).to.deep.equal(card);
      expect(validation.validCardNumber).to.equal(true);
      expect(validation.validExpiryMonth).to.equal(true);
      expect(validation.validExpiryYear).to.equal(true);
      expect(validation.validCvv).to.equal(true);
      expect(validation.isExpired).to.equal(false);
      expect(validation.customValidation).to.equal(true);
      done();
    });

    it('defines a new card type', function(done) {
      var card1 = {
        cardType: 'VISA',
        number: '4111111111111111',
        expiryMonth: '03',
        expiryYear: '2100',
        cvv: '123'
      };
      var card2 = {
        cardType: 'GIFT_CARD',
        number: '4111111111111111',
        expiryMonth: '03',
        expiryYear: '2100',
        pin: '7890'
      };
      var options = {
        cardTypes: {
          GIFT_CARD: {
            cardPattern: /^4[0-9]{12}(?:[0-9]{3})?$/,
            cvvPattern: /.*/
          }
        },
        customValidation: function(card, settings) {
          if (card.cardType === 'GIFT_CARD') {
            return card.pin === '7890';
          }
        }
      };
      var validation1 = CreditCard.validate(card1, options);
      var validation2 = CreditCard.validate(card2, options);

      // verify that existing validation still works
      expect(validation1.card).to.deep.equal(card1);
      expect(validation1.validCardNumber).to.equal(true);
      expect(validation1.validExpiryMonth).to.equal(true);
      expect(validation1.validExpiryYear).to.equal(true);
      expect(validation1.validCvv).to.equal(true);
      expect(validation1.isExpired).to.equal(false);
      expect(validation1.customValidation).to.not.exist();

      // verify that custom type validation works
      expect(validation2.card).to.deep.equal(card2);
      expect(validation2.validCardNumber).to.equal(true);
      expect(validation2.validExpiryMonth).to.equal(true);
      expect(validation2.validExpiryYear).to.equal(true);
      expect(validation2.validCvv).to.equal(true);
      expect(validation2.isExpired).to.equal(false);
      expect(validation2.customValidation).to.equal(true);

      done();
    });
  });


  describe('#determineCardType()', function() {
    it('successfully detects full numbers', function(done) {
      expect(CreditCard.determineCardType('378282246310005')).to.equal('AMERICANEXPRESS');
      expect(CreditCard.determineCardType('371449635398431')).to.equal('AMERICANEXPRESS');
      expect(CreditCard.determineCardType('378734493671000')).to.equal('AMERICANEXPRESS');
      expect(CreditCard.determineCardType('30569309025904')).to.equal('DINERSCLUB');
      expect(CreditCard.determineCardType('38520000023237')).to.equal('DINERSCLUB');
      expect(CreditCard.determineCardType('6011111111111117')).to.equal('DISCOVER');
      expect(CreditCard.determineCardType('6011000990139424')).to.equal('DISCOVER');
      expect(CreditCard.determineCardType('3530111333300000')).to.equal('JCB');
      expect(CreditCard.determineCardType('3566002020360505')).to.equal('JCB');
      expect(CreditCard.determineCardType('5555555555554444')).to.equal('MASTERCARD');
      expect(CreditCard.determineCardType('5105105105105100')).to.equal('MASTERCARD');
      expect(CreditCard.determineCardType('4111111111111111')).to.equal('VISA');
      expect(CreditCard.determineCardType('4012888888881881')).to.equal('VISA');
      expect(CreditCard.determineCardType('4222222222222')).to.equal('VISA');
      expect(CreditCard.determineCardType('0000000000000000')).to.equal(null);
      done();
    });

    it('successfully detects partial numbers if allowPartial is true', function(done) {
      expect(CreditCard.determineCardType('37', {allowPartial: true})).to.equal('AMERICANEXPRESS');
      expect(CreditCard.determineCardType('34', {allowPartial: true})).to.equal('AMERICANEXPRESS');
      expect(CreditCard.determineCardType('3787344', {allowPartial: true})).to.equal('AMERICANEXPRESS');
      expect(CreditCard.determineCardType('305', {allowPartial: true})).to.equal('DINERSCLUB');
      expect(CreditCard.determineCardType('38', {allowPartial: true})).to.equal('DINERSCLUB');
      expect(CreditCard.determineCardType('6011', {allowPartial: true})).to.equal('DISCOVER');
      expect(CreditCard.determineCardType('601100099013', {allowPartial: true})).to.equal('DISCOVER');
      expect(CreditCard.determineCardType('35', {allowPartial: true})).to.equal('JCB');
      expect(CreditCard.determineCardType('3566002020360505', {allowPartial: true})).to.equal('JCB');
      expect(CreditCard.determineCardType('5555555', {allowPartial: true})).to.equal('MASTERCARD');
      expect(CreditCard.determineCardType('51', {allowPartial: true})).to.equal('MASTERCARD');
      expect(CreditCard.determineCardType('411', {allowPartial: true})).to.equal('VISA');
      expect(CreditCard.determineCardType('4', {allowPartial: true})).to.equal('VISA');
      expect(CreditCard.determineCardType('42222222222', {allowPartial: true})).to.equal('VISA');
      done();
    });

    it('does not allow partial matches if allowPartial is false', function(done) {
      expect(CreditCard.determineCardType('5555555')).to.equal(null);
      expect(CreditCard.determineCardType('4', {allowPartial: false})).to.equal(null);
      done();
    });
  });


  describe('#isValidCardNumber()', function() {
    it('returns true for valid cards', function(done) {
      expect(CreditCard.isValidCardNumber('378282246310005', 'AMERICANEXPRESS')).to.equal(true);
      expect(CreditCard.isValidCardNumber('371449635398431', 'AMERICANEXPRESS')).to.equal(true);
      expect(CreditCard.isValidCardNumber('378734493671000', 'AMERICANEXPRESS')).to.equal(true);
      expect(CreditCard.isValidCardNumber('30569309025904', 'DINERSCLUB')).to.equal(true);
      expect(CreditCard.isValidCardNumber('38520000023237', 'DINERSCLUB')).to.equal(true);
      expect(CreditCard.isValidCardNumber('6011111111111117', 'DISCOVER')).to.equal(true);
      expect(CreditCard.isValidCardNumber('6011000990139424', 'DISCOVER')).to.equal(true);
      expect(CreditCard.isValidCardNumber('3530111333300000', 'JCB')).to.equal(true);
      expect(CreditCard.isValidCardNumber('3566002020360505', 'JCB')).to.equal(true);
      expect(CreditCard.isValidCardNumber('5555555555554444', 'MASTERCARD')).to.equal(true);
      expect(CreditCard.isValidCardNumber('5105105105105100', 'MASTERCARD')).to.equal(true);
      expect(CreditCard.isValidCardNumber('4111111111111111', 'VISA')).to.equal(true);
      expect(CreditCard.isValidCardNumber('4012888888881881', 'VISA')).to.equal(true);
      expect(CreditCard.isValidCardNumber('4222222222222', 'VISA')).to.equal(true);
      done();
    });

    it('returns false for numbers that pass luhn but fail are invalid', function(done) {
      expect(CreditCard.isValidCardNumber('123', 'AMERICANEXPRESS')).to.equal(false);
      done();
    });
  });


  describe('#doesNumberMatchType()', function() {
    it('returns true for valid card matches', function(done) {
      expect(CreditCard.doesNumberMatchType('378282246310005', 'AMERICANEXPRESS')).to.equal(true);
      expect(CreditCard.doesNumberMatchType('371449635398431', 'AMERICANEXPRESS')).to.equal(true);
      expect(CreditCard.doesNumberMatchType('378734493671000', 'AMERICANEXPRESS')).to.equal(true);
      expect(CreditCard.doesNumberMatchType('30569309025904', 'DINERSCLUB')).to.equal(true);
      expect(CreditCard.doesNumberMatchType('38520000023237', 'DINERSCLUB')).to.equal(true);
      expect(CreditCard.doesNumberMatchType('6011111111111117', 'DISCOVER')).to.equal(true);
      expect(CreditCard.doesNumberMatchType('6011000990139424', 'DISCOVER')).to.equal(true);
      expect(CreditCard.doesNumberMatchType('3530111333300000', 'JCB')).to.equal(true);
      expect(CreditCard.doesNumberMatchType('3566002020360505', 'JCB')).to.equal(true);
      expect(CreditCard.doesNumberMatchType('5555555555554444', 'MASTERCARD')).to.equal(true);
      expect(CreditCard.doesNumberMatchType('5105105105105100', 'MASTERCARD')).to.equal(true);
      expect(CreditCard.doesNumberMatchType('4111111111111111', 'VISA')).to.equal(true);
      expect(CreditCard.doesNumberMatchType('4012888888881881', 'VISA')).to.equal(true);
      expect(CreditCard.doesNumberMatchType('4222222222222', 'VISA')).to.equal(true);
      done();
    });

    it('returns false for invalid cards', function(done) {
      expect(CreditCard.doesNumberMatchType('4111111111111111', 'AMERICANEXPRESS')).to.equal(false);
      expect(CreditCard.doesNumberMatchType('5555555555554444', 'DINERSCLUB')).to.equal(false);
      expect(CreditCard.doesNumberMatchType('3530111333300000', 'DISCOVER')).to.equal(false);
      expect(CreditCard.doesNumberMatchType('6011111111111117', 'JCB')).to.equal(false);
      expect(CreditCard.doesNumberMatchType('30569309025904', 'MASTERCARD')).to.equal(false);
      expect(CreditCard.doesNumberMatchType('378282246310005', 'VISA')).to.equal(false);
      done();
    });

    it('returns false for unknown card types', function(done) {
      expect(CreditCard.doesNumberMatchType('4111111111111111', '')).to.equal(false);
      expect(CreditCard.doesNumberMatchType('378282246310005', 'foo')).to.equal(false);
      done();
    });

    it('returns true for custom card types', function(done) {
      expect(CreditCard.doesNumberMatchType('911', 'foo', {
        foo: {
          cardPattern: /^91*$/,
          cvvPattern: /.*/
        }
      })).to.equal(true);
      done();
    });
  });


  describe('#doesCvvMatchType()', function() {
    it('returns true for valid cvv matches', function(done) {
      expect(CreditCard.doesCvvMatchType('1234', 'AMERICANEXPRESS')).to.equal(true);
      expect(CreditCard.doesCvvMatchType('123', 'DINERSCLUB')).to.equal(true);
      expect(CreditCard.doesCvvMatchType('456', 'DISCOVER')).to.equal(true);
      expect(CreditCard.doesCvvMatchType('789', 'JCB')).to.equal(true);
      expect(CreditCard.doesCvvMatchType('012', 'MASTERCARD')).to.equal(true);
      expect(CreditCard.doesCvvMatchType('333', 'VISA')).to.equal(true);
      done();
    });

    it('returns false for invalid cvvs', function(done) {
      expect(CreditCard.doesCvvMatchType('123', 'AMERICANEXPRESS')).to.equal(false);
      expect(CreditCard.doesCvvMatchType('1234', 'DINERSCLUB')).to.equal(false);
      expect(CreditCard.doesCvvMatchType('1', 'DISCOVER')).to.equal(false);
      expect(CreditCard.doesCvvMatchType('', 'JCB')).to.equal(false);
      expect(CreditCard.doesCvvMatchType(null, 'MASTERCARD')).to.equal(false);
      expect(CreditCard.doesCvvMatchType({}, 'VISA')).to.equal(false);
      done();
    });

    it('returns false for unknown card types', function(done) {
      expect(CreditCard.doesCvvMatchType('999', '')).to.equal(false);
      expect(CreditCard.doesCvvMatchType('x', 'foo')).to.equal(false);
      done();
    });

    it('returns true for custom card types', function(done) {
      expect(CreditCard.doesCvvMatchType('abc', 'foo', {
        foo: {
          cardPattern: /.*/,
          cvvPattern: /^[a-c]{3}$/
        }
      })).to.equal(true);
      done();
    });
  });


  describe('#isValidExpiryMonth()', function() {
    it('returns true for valid month', function(done) {
      expect(CreditCard.isValidExpiryMonth('01')).to.equal(true);
      expect(CreditCard.isValidExpiryMonth('02')).to.equal(true);
      expect(CreditCard.isValidExpiryMonth('3')).to.equal(true);
      expect(CreditCard.isValidExpiryMonth(4)).to.equal(true);
      expect(CreditCard.isValidExpiryMonth(5)).to.equal(true);
      expect(CreditCard.isValidExpiryMonth(6)).to.equal(true);
      expect(CreditCard.isValidExpiryMonth(7)).to.equal(true);
      expect(CreditCard.isValidExpiryMonth(8)).to.equal(true);
      expect(CreditCard.isValidExpiryMonth(9)).to.equal(true);
      expect(CreditCard.isValidExpiryMonth('10')).to.equal(true);
      expect(CreditCard.isValidExpiryMonth(11)).to.equal(true);
      expect(CreditCard.isValidExpiryMonth(12)).to.equal(true);
      done();
    });

    it('returns false for invalid month', function(done) {
      expect(CreditCard.isValidExpiryMonth('001')).to.equal(false);
      expect(CreditCard.isValidExpiryMonth(0)).to.equal(false);
      expect(CreditCard.isValidExpiryMonth(13)).to.equal(false);
      done();
    });

    it('returns true for month in specified range', function(done) {
      var valid = CreditCard.isValidExpiryMonth(13, {
        min: 13,
        max: 13
      });

      expect(valid).to.equal(true);
      done();
    });
  });


  describe('#isValidExpiryYear()', function() {
    it('returns true for valid year', function(done) {
      expect(CreditCard.isValidExpiryYear('2014')).to.equal(true);
      expect(CreditCard.isValidExpiryYear(1990)).to.equal(true);
      expect(CreditCard.isValidExpiryYear(1991)).to.equal(true);
      expect(CreditCard.isValidExpiryYear(2199)).to.equal(true);
      expect(CreditCard.isValidExpiryYear(2200)).to.equal(true);
      done();
    });

    it('returns false for invalid year', function(done) {
      expect(CreditCard.isValidExpiryYear('100')).to.equal(false);
      expect(CreditCard.isValidExpiryYear(1899)).to.equal(false);
      expect(CreditCard.isValidExpiryYear(2201)).to.equal(false);
      done();
    });

    it('returns true for year in specified range', function(done) {
      var valid = CreditCard.isValidExpiryYear(1800, {
        min: 1800,
        max: 1800
      });

      expect(valid).to.equal(true);
      done();
    });
  });


  describe('#isExpired()', function() {
    it('returns true for an expired card', function(done) {
      expect(CreditCard.isExpired(12, 2013)).to.equal(true);
      done();
    });

    it('returns false for non-expired card', function(done) {
      expect(CreditCard.isExpired(1, 2100)).to.equal(false);
      done();
    });

    it('returns true when card expired last month', function(done) {
      var date = new Date();

      date.setMonth(date.getMonth() - 1); // last month
      expect(CreditCard.isExpired(date.getMonth() + 1, date.getFullYear())).to.equal(true);
      done();
    });

    it('returns false when card expires this month', function(done) {
      var date = new Date();

      expect(CreditCard.isExpired(date.getMonth() + 1, date.getFullYear())).to.equal(false);
      done();
    });
  });


  describe('#luhn()', function() {
    it('returns true for valid cards', function(done) {
      expect(CreditCard.luhn('378282246310005')).to.equal(true);
      expect(CreditCard.luhn('371449635398431')).to.equal(true);
      expect(CreditCard.luhn('378734493671000')).to.equal(true);
      expect(CreditCard.luhn('5610591081018250')).to.equal(true);
      expect(CreditCard.luhn('30569309025904')).to.equal(true);
      expect(CreditCard.luhn('38520000023237')).to.equal(true);
      expect(CreditCard.luhn('6011111111111117')).to.equal(true);
      expect(CreditCard.luhn('6011000990139424')).to.equal(true);
      expect(CreditCard.luhn('3530111333300000')).to.equal(true);
      expect(CreditCard.luhn('3566002020360505')).to.equal(true);
      expect(CreditCard.luhn('5555555555554444')).to.equal(true);
      expect(CreditCard.luhn('5105105105105100')).to.equal(true);
      expect(CreditCard.luhn('4111111111111111')).to.equal(true);
      expect(CreditCard.luhn('4012888888881881')).to.equal(true);
      expect(CreditCard.luhn('4222222222222')).to.equal(true);
      expect(CreditCard.luhn('5019717010103742')).to.equal(true);
      expect(CreditCard.luhn('6331101999990016')).to.equal(true);
      done();
    });

    it('returns false for invalid cards', function(done) {
      expect(CreditCard.luhn('5105105105105101')).to.equal(false);
      expect(CreditCard.luhn('4111111111111112')).to.equal(false);
      expect(CreditCard.luhn('')).to.equal(false);
      expect(CreditCard.luhn(' ')).to.equal(false);
      expect(CreditCard.luhn(undefined)).to.equal(false);
      expect(CreditCard.luhn([])).to.equal(false);
      expect(CreditCard.luhn('abc')).to.equal(false);
      done();
    });
  });


  describe('#sanitizeNumberString()', function() {
    it('returns a string stripped of all non-numeric characters', function(done) {
      var str = CreditCard.sanitizeNumberString('4111-1111-1111-1111');

      expect(str).to.equal('4111111111111111');
      done();
    });

    it('returns empty string for non-string input', function(done) {
      expect(CreditCard.sanitizeNumberString()).to.equal('');
      expect(CreditCard.sanitizeNumberString(undefined)).to.equal('');
      expect(CreditCard.sanitizeNumberString(null)).to.equal('');
      expect(CreditCard.sanitizeNumberString(false)).to.equal('');
      expect(CreditCard.sanitizeNumberString([])).to.equal('');
      expect(CreditCard.sanitizeNumberString({})).to.equal('');
      done();
    });
  });


  describe('#defaults()', function() {
    it('adds to defaults', function(done) {
      var original = CreditCard.reset();
      var updated = CreditCard.defaults({
        cardTypes: {
          foo: {
            bar: 'baz'
          }
        }
      });

      expect(original.cardTypes.foo).to.not.exist();
      expect(updated.cardTypes.foo).to.deep.equal({ bar: 'baz' });
      done();
    });

    it('makes no changes without arguments', function(done) {
      var original = CreditCard.reset();
      var updated = CreditCard.defaults();

      expect(original).to.deep.equal(updated);
      done();
    });

    it('does not overwrite by default', function(done) {
      var original = CreditCard.reset();
      var updated = CreditCard.defaults({});

      expect(original).to.deep.equal(updated);
      done();
    });

    it('overwrites when second argument is true', function(done) {
      var updated = CreditCard.defaults({}, true);

      expect(updated).to.deep.equal({});
      done();
    });

    it('does not overwrite when second argument is false', function(done) {
      var original = CreditCard.reset();
      var updated = CreditCard.defaults({}, false);

      expect(original).to.deep.equal(updated);
      done();
    });

    it('sets a custom schema', function(done) {
      var schema = {
        cardType: 'type',
        number: 'number',
        expiryMonth: 'expire_month',
        expiryYear: 'expire_year',
        cvv: 'cvv2'
      };
      var card = {
        type: 'visa',
        number: '4111111111111111',
        expire_month: '03',
        expire_year: '2100',
        cvv2: '123'
      };
      var validation;

      CreditCard.defaults({
        schema: schema
      });
      validation = CreditCard.validate(card);

      expect(validation.card).to.deep.equal(card);
      expect(validation.validCardNumber).to.equal(true);
      expect(validation.validExpiryMonth).to.equal(true);
      expect(validation.validExpiryYear).to.equal(true);
      expect(validation.validCvv).to.equal(true);
      expect(validation.isExpired).to.equal(false);
      expect(validation.customValidation).to.not.exist();
      done();
    });
  });


  describe('#reset()', function() {
    it('resets to original defaults', function(done) {
      var original = CreditCard.reset();
      var updated = CreditCard.defaults({}, true);
      var reset = CreditCard.reset();

      expect(updated).to.deep.equal({});
      expect(original).to.deep.equal(reset);
      expect(reset.cardTypes).to.exist();
      expect(reset.expiryMonths).to.exist();
      expect(reset.expiryYears).to.exist();
      done();
    });
  });
});
