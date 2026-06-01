import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../auth/types/auth-user.type';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  list(@Request() req: { user: AuthUser }) {
    return this.favoritesService.list(req.user.id);
  }

  @Get(':productId')
  status(
    @Request() req: { user: AuthUser },
    @Param('productId') productId: string,
  ) {
    return this.favoritesService.status(req.user.id, productId);
  }

  @Post(':productId')
  add(
    @Request() req: { user: AuthUser },
    @Param('productId') productId: string,
  ) {
    return this.favoritesService.add(req.user.id, productId);
  }

  @Delete(':productId')
  remove(
    @Request() req: { user: AuthUser },
    @Param('productId') productId: string,
  ) {
    return this.favoritesService.remove(req.user.id, productId);
  }

  @Patch(':productId/toggle')
  toggle(
    @Request() req: { user: AuthUser },
    @Param('productId') productId: string,
  ) {
    return this.favoritesService.toggle(req.user.id, productId);
  }
}
