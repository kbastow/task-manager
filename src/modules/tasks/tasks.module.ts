import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './domain/task.entity';
import { AuthModule } from 'src/modules/auth/auth.module';
import { CreateTaskService } from './commands/create-task/create-task.service';
import { UpdateTaskStatusService } from './commands/update-task-status/update-task-status.service';
import { DeleteTaskService } from './commands/delete-task/delete-task.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), AuthModule],
  controllers: [TasksController],
  providers: [
    TasksService,
    CreateTaskService,
    UpdateTaskStatusService,
    DeleteTaskService,
  ],
  exports: [TasksService],
})
export class TasksModule {}
