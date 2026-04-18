'use strict';

class AppError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.isAppError = true;
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 'VALIDATION');
    this.name = 'ValidationError';
  }
}

class BusinessRuleError extends AppError {
  constructor(message) {
    super(message, 'BUSINESS_RULE');
    this.name = 'BusinessRuleError';
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

module.exports = { AppError, ValidationError, BusinessRuleError, NotFoundError };
