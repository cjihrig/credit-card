# credit-card

[![Current Version](https://img.shields.io/npm/v/credit-card.svg)](https://www.npmjs.org/package/credit-card)
[![Build Status via Travis CI](https://travis-ci.org/continuationlabs/credit-card.svg?branch=master)](https://travis-ci.org/continuationlabs/credit-card)
![Dependencies](http://img.shields.io/david/continuationlabs/credit-card.svg)

[![belly-button-style](https://cdn.rawgit.com/continuationlabs/belly-button/master/badge.svg)](https://github.com/continuationlabs/belly-button)

Module for performing credit card validation.

## Basic Usage

Pass credit card information to the `validate()` method. In the following example, the credit card information is stored in `card`.

```javascript
var CreditCard = require('credit-card');
var card = {
  cardType: 'VISA',
  number: '4111111111111111',
  expiryMonth: '03',
  expiryYear: '2100',
  cvv: '123'
};
var validation = CreditCard.validate(card);
```

The `validation` object returned by `validate()` will look like this:

```javascript
{
  card: {
    cardType: 'VISA',
    number: '4111111111111111',
    expiryMonth: '03',
    expiryYear: '2100',
    cvv: '123'
  },
  validCardNumber: true,
  validExpiryMonth: true,
  validExpiryYear: true,
  validCvv: true,
  isExpired: false
}
```

## Methods

### `validate(card [, options])`

  - Arguments
    - `card` (object) - An object containing credit card information. Should be of the following format:
        - `cardType` (string) - One of the supported card types.
        - `number` (string) - Credit card number.
        - `expiryMonth` (string or number) - Credit card expiration month.
        - `expiryYear` (string or number) - Credit card expiration year.
        - `cvv` (string) - Credit card CVV code.
    - `options` (object) - An optional object used to define custom card types and default values. Can define the following fields:
        - `cardTypes` (object) - An object used to validate credit card types. This allows new types, such as custom gift cards, to be defined.
        - `expiryMonths` (object) - An object used to override default values related to expiry months.
        - `expiryYears` (object) - An object used to override default values related to expiry years.
        - `schema` (object) - An object defining the names of the expected card property names. This is useful for supporting card data in a slightly different format. This can define `cardType`, `number`, `expiryMonth`, `expiryYear`, and `cvv` names.
  - Returns
    - object - An object containing the input card data and the results of validation. Should adhere to the following schema:
        - `card` (object) - This holds the value of the `card` argument.
        - `validCardNumber` (boolean) - The result of calling `isValidCardNumber()`.
        - `validExpiryMonth` (boolean) - The result of calling `isValidExpiryMonth()`.
        - `validExpiryYear` (boolean) - The result of calling `isValidExpiryYear()`.
        - `validCvv` (boolean) - The result of calling `doesCvvMatchType()`.
        - `isExpired` (boolean) - The result of calling `isExpired()`.
        - `customValidation` (any) - The result of custom validation. Can be any data type.

Performs several validation checks on credit card data.

### `determineCardType(number [, options])`

  - Arguments
    - `number` (string) - Credit card number string. This value is passed to `sanitizeNumberString()` prior to classification.
    - `options` (object) - An optional object used to pass in additional options. The following options are supported.
        - `allowPartial` (boolean) - If `true`, then partial matches are accepted. Otherwise, only full length credit card numbers are accepted. Defaults to `false`.
  - Returns
    - string - a string representing the card type. If no type matches the `number`, then `null` is returned.

Given a credit card number, this function attempts to determine the card type.

### `isValidCardNumber(number, type [, options])`

  - Arguments
    - `number` (string) - Credit card number string.
    - `type` (string) - Credit card type.
    - `options` (object) - An optional object used to define additional card types.
  - Returns
    - boolean - `true` if the number is valid for the credit card type and passes the Luhn algorithm, `false` otherwise.

Determines if a credit card number is valid for a given credit card type. Also verifies that the credit card number passes the Luhn algorithm.

### `isValidExpiryMonth(month [, options])`

  - Arguments
    - `month` (number or string) - Month value to be evaluated.
    - `options` (object) - An optional object used to define the minimum and maximum month values accepted.
  - Returns
    - boolean - `true` if `month` is a valid expiry month, `false` otherwise.

Determines if a value is a valid credit card expiry month. The month must fall between the defined minimum and maximum months. This range is 1 to 12 by default, but can be adjusted using the `options` input.

### `isValidExpiryYear(year [, options])`

  - Arguments
    - `year` (number or string) - Year value to be evaluated.
    - `options` (object) - An optional object used to define the minimum and maximum year values accepted.
  - Returns
    - boolean - `true` if `year` is a valid expiry month, `false` otherwise.

Determines if a value is a valid credit card expiry year. The year must fall between the defined minimum and maximum years. This range is 1900 to 2200 by default, but can be adjusted using the `options` input.

### `doesNumberMatchType(number, type [, options])`

  - Arguments
    - `number` (string) - Credit card number string.
    - `type` (string) - Credit card type.
    - `options` (object) - An optional object used to define additional card types.
  - Returns
    - boolean - `true` if the number is valid for the credit card type, `false` otherwise.

Determines if a credit card number is valid for a given credit card type.

### `doesCvvMatchType(number, type [, options])`

  - Arguments
    - `number` (string) - CVV string.
    - `type` (string) - Credit card type.
    - `options` (object) - An optional object used to define additional card types.
  - Returns
    - boolean - `true` if the CVV is valid for the credit card type, `false` otherwise.

Determines if a CVV is valid for a given credit card type. For example, American Express requires a four digit CVV, while Visa and Mastercard require a three digit CVV.

### `isExpired(month, year)`

  - Arguments
    - `month` (number) - Expiry month of card.
    - `year` (number) - Expiry year of card.
  - Returns
    - boolean - `true` if the expiration date has been reached, `false` otherwise.

Determines if a credit card's expiration date has been reached.

### `luhn(number)`

  - Arguments
    - `number` (string) - The number string to check.
  - Returns
    - boolean - `true` if the number passes, `false` otherwise.

Executes the [Luhn algorithm](http://en.wikipedia.org/wiki/Luhn_algorithm) on a string to determine if it is a valid credit card number.

### `sanitizeNumberString(number)`

  - Arguments
    - `number` (string) - The number string to be sanitized.
  - Returns
    - string - The sanitized string.

Strips all non-numeric characters from `number`. If `number` is not a string, an empty string is returned.

### `defaults([options [, overwrite]])`

  - Arguments
    - `options` (object) - New default values.
    - `overwrite` (boolean) - If `true`, `options` completely overwrites the current defaults. Otherwise, `options` is merged into the current defaults.
  - Returns
    - object - The module's default settings following the update.

Sets module level default values. The existing defaults can be augmented or overwritten completely based on the value of `overwrite`. To restore the original default values, call `reset()`.

### `reset()`

  - Arguments
    - None
  - Returns
    - object - The module's original default settings.

Resets the module's default settings to their original values. This can be useful for undoing the effects of `defaults()`.

## Supported Credit Card Types

This module supports a variety of credit cards. To better accommodate a wider range of clients, the card types have been aliased to other names as well.

  - `VISA` - Aliased to `vc`, `VC`, and `visa`.
  - `MASTERCARD` - Aliased to `mc`, `MC`, `mastercard`, `master card`, and `MASTER CARD`.
  - `AMERICANEXPRESS` - Aliased to `ae`, `AE`, `ax`, `AX`, `amex`, `AMEX`, `american express`, and `AMERICAN EXPRESS`.
  - `DINERSCLUB` - Aliased to `dinersclub`.
  - `DISCOVER` - Aliased to `dc`, `DC`, and `discover`.
  - `JCB` - Aliased to `jcb`.

## Defining Custom Card Types

The following example defines and validates a new card type known as `GIFT_CARD`. Notice that the `card` variable has its `cardType` set to `GIFT_CARD`, and a new `pin` field has been defined. The `options` variable is passed as the second argument to `validate()`. These options define the new `GIFT_CARD` type. The `cardPattern` is a regular expression that all complete gift card numbers should match. `partialPattern` is the minimal regular expression that can be used to detect a gift card. `cvvPattern` is a regular expression that the complete CVV should match.

Also notice the `customValidation` function. This function is used when normal validation is not quite enough. This function is passed the `card` object and `settings` object used by `validate()`. This function can return any data, which will be added directly to the response.

This can be done globally, or on a per validation call basis. This example shows how it is done on a per call basis. To achieve the same thing globally, use the `defaults()` methods.

```javascript
var CreditCard = require('credit-card');
var card = {
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
      partialPattern: /^4/,
      cvvPattern: /.*/
    }
  },
  customValidation: function(card, settings) {
    if (card.cardType === 'GIFT_CARD') {
      return card.pin === '7890';
    }
  }
};
var validation = CreditCard.validate(card, options);
```

The value of `validation` is shown below.

```javascript
{
  card: {
    cardType: 'GIFT_CARD',
    number: '4111111111111111',
    expiryMonth: '03',
    expiryYear: '2100',
    pin: '7890'
  },
  validCardNumber: true,
  validExpiryMonth: true,
  validExpiryYear: true,
  validCvv: true,
  isExpired: false,
  customValidation: true
}
```

## Defining a Custom Card Schema

By default, the `validate()` method expects the credit card object to contain the fields `cardType`, `number`, `expiryMonth`, `expiryYear`, and `cvv`. However, for convenience when working with other APIs, the module can be configured to use different field names. These overrides can be applied globally using `defaults()`, or on a per validation call using the `options` argument.

The following example shows how `CreditCard` can be configured to work with the [PayPal schema](https://developer.paypal.com/docs/api/) by default. Notice that the fields in the `schema` passed to `defaults()` correspond to the fields in the `card` object.

```javascript
var card = {
  type: 'visa',
  number: '4111111111111111',
  expire_month: '03',
  expire_year: '2100',
  cvv2: '123'
};
var validation;

CreditCard.defaults({
  schema: {
    cardType: 'type',
    number: 'number',
    expiryMonth: 'expire_month',
    expiryYear: 'expire_year',
    cvv: 'cvv2'
  }
});
validation = CreditCard.validate(card);
```

## Test Card Numbers

A list of test credit cards is available from [PayPal](http://www.paypalobjects.com/en_US/vhelp/paypalmanager_help/credit_card_numbers.htm).
