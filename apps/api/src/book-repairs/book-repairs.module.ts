import { Module } from '@nestjs/common';
import { BookRepairsService } from './book-repairs.service';
import { BookRepairsController } from './book-repairs.controller';

@Module({
  controllers: [BookRepairsController],
  providers: [BookRepairsService],
})
export class BookRepairsModule {}
