# credit-card

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

Determines if a value is a valid credit card expiry month. The month must fall between the defined minimum and maximum months. This range is 1 to 12 by default, but can be adjusted using the `options` input.

### `isValidExpiryYear(year [, options])`

  - Arguments
    - `year` (number or string) - Year value to be evaluated.
    - `options` (object) - An optional object used to define the minimum and maximum year values accepted.

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

The following example defines and validates a new card type known as `GIFT_CARD`. Notice that the `card` variable has its `cardType` set to `GIFT_CARD`, and a new `pin` field has been defined. The `options` variable is passed as the second argument to `validate()`. These options define the new `GIFT_CARD` type. The `cardPattern` is a regular expression that all gift card numbers should match. Similarly, `cvvPattern` is a regular expression that the CVV should match.

Also notice the `customValidation` function. This function is used when normal validation is not quite enough. This function is passed the `card` object and `settings` object used by `validate()`. This function can return any data, which will be added directly to the response.

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
