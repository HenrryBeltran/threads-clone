import { HttpException, HttpStatus } from '@nestjs/common';

export class NoContentException extends HttpException {
    constructor() {
        super('', HttpStatus.NO_CONTENT);
    }
}
