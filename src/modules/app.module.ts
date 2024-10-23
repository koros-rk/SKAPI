import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { CommonModule } from './common/common.module';
import { HttpExceptionFilter } from './common/providers/http-exception.filter';
import { UserModule } from './user/user.module';

@Module({
  imports: [ConfigModule.forRoot(), CommonModule, UserModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
