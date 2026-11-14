import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BookRepairsService } from './book-repairs.service';
import { CreateBookRepairDto } from './dto/create-book-repair.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('book-repairs')
export class BookRepairsController {
  constructor(private readonly bookRepairsService: BookRepairsService) {}

  // Anyone can book a repair (guest or logged in)
  @Post()
  create(@Req() req: any, @Body() createBookRepairDto: CreateBookRepairDto) {
    // If we have a custom middleware that attaches user even without guard, we can use it.
    // Otherwise, assume guest if no token. Let's just use the DTO for now.
    return this.bookRepairsService.create(createBookRepairDto, req.user?.id);
  }

  // Admin: Get all queries
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  findAll() {
    return this.bookRepairsService.findAll();
  }

  // User: Get their own queries
  @Get('my-repairs')
  @UseGuards(AuthGuard('jwt'))
  getUserQueries(@Req() req: any) {
    return this.bookRepairsService.getUserQueries(req.user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    return this.bookRepairsService.findOne(id);
  }

  // Admin: Update status/notes
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateDto: any,
  ) {
    return this.bookRepairsService.update(id, updateDto);
  }

  // Admin: Delete
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.bookRepairsService.remove(id);
  }
}
