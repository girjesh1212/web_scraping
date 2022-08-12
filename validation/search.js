const Validator = require('validator');
const isEmpty = require('./is-empty')

module.exports = function validateLoginInput(data) {
    let errors = {};

    data.query = !isEmpty(data.query) ? data.query : '';

    if (Validator.isEmpty(data.query)) {
        errors.query = 'query is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}