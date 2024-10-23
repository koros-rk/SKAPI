import {
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ObjectSchema } from 'yup';

@Injectable()
export class ValidationPipe<T> implements PipeTransform {
  constructor(private schema: ObjectSchema<T>) {}
  async transform(value: T) {
    try {
      return await this.schema.validate(value, { abortEarly: false });
    } catch (errors) {
      throw new HttpException(
        {
          message: 'Validation error'.toUpperCase(),
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          details: errors.inner.reduce(
            (allErrors, currentError) => [
              ...allErrors,
              {
                field: currentError.path,
                type: currentError.type ?? 'validation',
                message: currentError.message,
              },
            ],
            [],
          ),
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
