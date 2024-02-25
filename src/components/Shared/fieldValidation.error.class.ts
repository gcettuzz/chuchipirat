export interface FormValidationFieldError {
  priority: number;
  fieldName: string;
  errorMessage: string;
  errorObject?: any;
}

export default class FieldValidationError extends Error {
  formValidation: FormValidationFieldError[];
  constructor(message?: string, formValidation?: FormValidationFieldError[]) {
    super(message);
    this.formValidation = formValidation ? formValidation : [];
  }
}

export class FormValidatorUtil {
  static isFieldErroneous(
    formValidation: FormValidationFieldError[],
    fieldName: string
  ) {
    return Boolean(
      formValidation?.find((field) => field.fieldName == fieldName)
    );
  }
  static getHelperText(
    formValidation: FormValidationFieldError[],
    fieldName: string,
    defaultHelpertext: string
  ) {
    const formField = formValidation?.find(
      (field) => field.fieldName == fieldName
    );

    if (formField) {
      return formField.errorMessage;
    } else {
      return defaultHelpertext;
    }
  }
}
