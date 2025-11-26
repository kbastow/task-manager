import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './domain/task.entity';
import { AuthModule } from 'src/modules/auth/auth.module';
import { CreateTaskService } from './commands/create-task/create-task.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), AuthModule],
  controllers: [TasksController],
  providers: [TasksService, CreateTaskService],
  exports: [TasksService],
})
export class TasksModule {}
