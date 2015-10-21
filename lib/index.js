'use strict';
var Hoek = require('hoek');

var _defaults = {
  cardTypes: {
    VISA: {
      cardType: 'VISA',
      cardPattern: /^4[0-9]{12}(?:[0-9]{3})?$/,
      partialPattern: /^4/,
      cvvPattern: /^\d{3}$/
    },
    MASTERCARD: {
      cardType: 'MASTERCARD',
      cardPattern: /^5[1-5][0-9]{14}$/,
      partialPattern: /^5[1-5]/,
      cvvPattern: /^\d{3}$/
    },
    AMERICANEXPRESS: {
      cardType: 'AMERICANEXPRESS',
      cardPattern: /^3[47][0-9]{13}$/,
      partialPattern: /^3[47]/,
      cvvPattern: /^\d{4}$/
    },
    DINERSCLUB: {
      cardType: 'DINERSCLUB',
      cardPattern: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
      partialPattern: /^3(0[0-5]|[68])/,
      cvvPattern: /^\d{3}$/
    },
    DISCOVER: {
      cardType: 'DISCOVER',
      cardPattern: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
      partialPattern: /^6(011|5[0-9])/,
      cvvPattern: /^\d{3}$/
    },
    JCB: {
      cardType: 'JCB',
      cardPattern: /^(?:2131|1800|35\d{3})\d{11}$/,
      partialPattern: /^(2131|1800|35)/,
      cvvPattern: /^\d{3}$/
    }
  },
  expiryMonths: {
    min: 1,
    max: 12
  },
  expiryYears: {
    min: 1900,
    max: 2200
  },
  schema: {
    cardType: 'cardType',
    number: 'number',
    expiryMonth: 'expiryMonth',
    expiryYear: 'expiryYear',
    cvv: 'cvv'
  }
};

// Setup Aliases
_setupCardTypeAliases('VISA', ['vc', 'VC', 'visa']);
_setupCardTypeAliases('MASTERCARD', ['mc', 'MC', 'mastercard', 'master card', 'MASTER CARD']);
_setupCardTypeAliases('AMERICANEXPRESS', ['ae', 'AE', 'ax', 'AX', 'amex', 'AMEX', 'american express', 'AMERICAN EXPRESS']);
_setupCardTypeAliases('DINERSCLUB', ['dinersclub']);
_setupCardTypeAliases('DISCOVER', ['dc', 'DC', 'discover']);
_setupCardTypeAliases('JCB', ['jcb']);

// Store original defaults. This must happen after aliases are setup
var _originalDefaults = Hoek.clone(_defaults);

function validate (card, options) {
  card = card || {};

  var settings = Hoek.applyToDefaults(_defaults, options || {});
  var schema = settings.schema;
  var cardType = Hoek.reach(card, schema.cardType);
  var number = sanitizeNumberString(Hoek.reach(card, schema.number));
  var expiryMonth = Hoek.reach(card, schema.expiryMonth);
  var expiryYear = Hoek.reach(card, schema.expiryYear);
  var cvv = sanitizeNumberString(Hoek.reach(card, schema.cvv));
  var customValidationFn = settings.customValidation;
  var customValidation;

  // optional custom validation
  if (typeof customValidationFn === 'function') {
    customValidation = customValidationFn(card, settings);
  }

  return {
    card: card,
    validCardNumber: isValidCardNumber(number, cardType, settings.cardTypes),
    validExpiryMonth: isValidExpiryMonth(expiryMonth, settings.expiryMonths),
    validExpiryYear: isValidExpiryYear(expiryYear, settings.expiryYears),
    validCvv: doesCvvMatchType(cvv, cardType, settings.cardTypes),
    isExpired: isExpired(expiryMonth, expiryYear),
    customValidation: customValidation
  };
}

function determineCardType (number, options) {
  var settings = Hoek.applyToDefaults(_defaults, options || {});
  var cardTypes = settings.cardTypes;
  var keys = Object.keys(cardTypes);

  number = sanitizeNumberString(number);

  for (var i = 0, il = keys.length; i < il; ++i) {
    var key = keys[i];
    var type = cardTypes[key];

    if (type.cardPattern.test(number) ||
        (settings.allowPartial === true && type.partialPattern.test(number))) {
      return type.cardType;
    }
  }

  return null;
}

function isValidCardNumber (number, type, options) {
  return doesNumberMatchType(number, type, options) && luhn(number);
}

function isValidExpiryMonth (month, options) {
  var settings = Hoek.applyToDefaults(_defaults.expiryMonths, options || {});

  if (typeof month === 'string' && month.length > 2) {
    return false;
  }

  month = ~~month;
  return month >= settings.min && month <= settings.max;
}

function isValidExpiryYear (year, options) {
  var settings = Hoek.applyToDefaults(_defaults.expiryYears, options || {});

  if (typeof year === 'string' && year.length !== 4) {
    return false;
  }

  year = ~~year;
  return year >= settings.min && year <= settings.max;
}

function doesNumberMatchType (number, type, options) {
  var settings = Hoek.applyToDefaults(_defaults.cardTypes, options || {});
  var patterns = settings[type];

  if (!patterns) {
    return false;
  }

  return patterns.cardPattern.test(number);
}

function doesCvvMatchType (number, type, options) {
  var settings = Hoek.applyToDefaults(_defaults.cardTypes, options || {});
  var patterns = settings[type];

  if (!patterns) {
    return false;
  }

  return patterns.cvvPattern.test(number);
}

function isExpired (month, year) {
  month = ~~month;
  year = ~~year;

  // cards are good until the end of the month
  // http://stackoverflow.com/questions/54037/credit-card-expiration-dates-inclusive-or-exclusive
  var expiration = new Date(year, month);

  return Date.now() >= expiration;
}

function luhn (number) {
  // credit - https://gist.github.com/DiegoSalazar/4075533

  if (/[^\d]+/.test(number) || typeof number !== 'string' || !number) {
    return false;
  }

  var nCheck = 0;
  var bEven = false;
  var nDigit;

  for (var i = number.length - 1; i >= 0; --i) {
    nDigit = ~~number.charAt(i);

    if (bEven) {
      if ((nDigit *= 2) > 9) {
        nDigit -= 9;
      }
    }

    nCheck += nDigit;
    bEven = !bEven;
  }

  return (nCheck % 10) === 0;
}

function sanitizeNumberString (number) {
  if (typeof number !== 'string') {
    return '';
  }

  return number.replace(/[^\d]/g, '');
}

function defaults (options, overwrite) {
  options = options || {};

  if (overwrite === true) {
    _defaults = Hoek.clone(options);
  } else {
    _defaults = Hoek.applyToDefaults(_defaults, options);
  }

  return _defaults;
}

function reset () {
  _defaults = Hoek.clone(_originalDefaults);
  return _defaults;
}

function _setupCardTypeAliases (type, aliases) {
  for (var i = 0, il = aliases.length; i < il; ++i) {
    _defaults.cardTypes[aliases[i]] = _defaults.cardTypes[type];
  }
}

module.exports = {
  validate: validate,
  determineCardType: determineCardType,
  isValidCardNumber: isValidCardNumber,
  isValidExpiryMonth: isValidExpiryMonth,
  isValidExpiryYear: isValidExpiryYear,
  doesNumberMatchType: doesNumberMatchType,
  doesCvvMatchType: doesCvvMatchType,
  isExpired: isExpired,
  luhn: luhn,
  sanitizeNumberString: sanitizeNumberString,
  defaults: defaults,
  reset: reset
};
