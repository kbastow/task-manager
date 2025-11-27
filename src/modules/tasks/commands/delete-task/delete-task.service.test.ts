import { Test, TestingModule } from '@nestjs/testing';
import { DeleteTaskService } from './delete-task.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from '../../domain/task.entity';
import { Repository } from 'typeorm';
import {
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DeleteTaskCommand } from './delete-task.command';

describe('DeleteTaskService', () => {
  let service: DeleteTaskService;
  let tasksRepository: jest.Mocked<Repository<Task>>;

  const mockUser = {
    id: '1',
    username: 'testuser',
    password: 'testpass',
    tasks: [],
  };
  const mockCommand: DeleteTaskCommand = { id: '123', user: mockUser };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteTaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DeleteTaskService>(DeleteTaskService);
    tasksRepository = module.get(getRepositoryToken(Task));
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a task successfully', async () => {
    tasksRepository.delete.mockResolvedValue({ raw: {}, affected: 1 });

    await expect(service.execute(mockCommand)).resolves.toBeUndefined();
    expect(tasksRepository.delete).toHaveBeenCalledWith({
      id: mockCommand.id,
      user: mockUser,
    });
    expect(Logger.prototype.log).toHaveBeenCalledWith(
      `Task with ID '${mockCommand.id}' deleted for user '${mockUser.username}'`,
    );
  });

  it('should throw NotFoundException if no task is deleted', async () => {
    tasksRepository.delete.mockResolvedValue({ raw: {}, affected: 0 });
    await expect(service.execute(mockCommand)).rejects.toThrow(
      NotFoundException,
    );
    expect(Logger.prototype.warn).toHaveBeenCalledWith(
      `Task with ID '${mockCommand.id}' not found for user '${mockUser.username}'`,
    );
  });

  it('should throw InternalServerErrorException on repository error', async () => {
    tasksRepository.delete.mockRejectedValue(new Error('DB error'));

    await expect(service.execute(mockCommand)).rejects.toThrow(
      InternalServerErrorException,
    );
    expect(Logger.prototype.error).toHaveBeenCalledWith(
      `Failed to delete task with ID '${mockCommand.id}' for user '${mockUser.username}'`,
      expect.any(String),
    );
  });
});
