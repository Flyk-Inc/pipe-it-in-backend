import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { SignedInRequest } from '../../infrastructure/auth/strategies/jwt.strategy';
import { UsersService } from '../../domain/users/service/users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: SignedInRequest) {
    return this.usersService.getUserByEmail(req.user.email);
  }
}
