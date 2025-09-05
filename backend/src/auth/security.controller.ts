import { Controller, Get, Post, Put, Delete, HttpStatus } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UseGuards } from '@nestjs/common';
import { HttpCode } from '@nestjs/common';

@Controller('login')
@UseGuards(ThrottlerGuard)
export class SecurityController {
  // Bloquer tous les accès GET à /login
  @Get()
  @HttpCode(HttpStatus.METHOD_NOT_ALLOWED)
  blockGet() {
    throw new Error('GET method not allowed for /login');
  }

  @Post()
  @HttpCode(HttpStatus.METHOD_NOT_ALLOWED)
  blockPost() {
    throw new Error('POST method not allowed for /login - use /auth/login');
  }

  @Put()
  @HttpCode(HttpStatus.METHOD_NOT_ALLOWED)
  blockPut() {
    throw new Error('PUT method not allowed for /login');
  }

  @Delete()
  @HttpCode(HttpStatus.METHOD_NOT_ALLOWED)
  blockDelete() {
    throw new Error('DELETE method not allowed for /login');
  }
}

@Controller('admin')
@UseGuards(ThrottlerGuard)
export class AdminSecurityController {
  // Bloquer tous les accès non-GET à /admin (seul GET /admin/system/status est autorisé)
  @Get()
  @HttpCode(HttpStatus.METHOD_NOT_ALLOWED)
  blockGet() {
    throw new Error('GET method not allowed for /admin - use /admin/system/status');
  }

  @Post()
  @HttpCode(HttpStatus.METHOD_NOT_ALLOWED)
  blockPost() {
    throw new Error('POST method not allowed for /admin');
  }

  @Put()
  @HttpCode(HttpStatus.METHOD_NOT_ALLOWED)
  blockPut() {
    throw new Error('PUT method not allowed for /admin');
  }

  @Delete()
  @HttpCode(HttpStatus.METHOD_NOT_ALLOWED)
  blockDelete() {
    throw new Error('DELETE method not allowed for /admin');
  }
}