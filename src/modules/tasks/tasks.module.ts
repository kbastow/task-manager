import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './domain/task.entity';
import { AuthModule } from 'src/modules/auth/auth.module';
import { CreateTaskService } from './commands/create-task/create-task.service';
import { UpdateTaskStatusService } from './commands/update-task-status/update-task-status.service';
import { DeleteTaskService } from './commands/delete-task/delete-task.service';
import { GetTasksService } from './queries/get-tasks/get-tasks.service';
import { GetTaskByIdService } from './queries/get-tasks/get-task-by-id.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), AuthModule],
  controllers: [TasksController],
  providers: [
    TasksService,
    CreateTaskService,
    UpdateTaskStatusService,
    DeleteTaskService,
    GetTasksService,
    GetTaskByIdService,
  ],
  exports: [TasksService],
})
export class TasksModule {}
