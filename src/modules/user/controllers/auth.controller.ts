import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ValidationPipe } from '../../common/providers/validation.pipe';
import { AuthService } from '../providers/auth.service';
import { GetTokenPayload, TokenResponse } from '../types/auth.type';
import { TokenSchema } from '../validators/token.schema';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('token')
  @UsePipes(new ValidationPipe<GetTokenPayload>(TokenSchema))
  async token(@Body() getTokenDto: GetTokenPayload): Promise<TokenResponse> {
    return await this.authService.token(getTokenDto);
  }
}
