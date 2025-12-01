import { Test, TestingModule } from '@nestjs/testing';
import { UpdateTaskStatusService } from './update-task-status.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from '../../domain/task.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UpdateTaskStatusCommand } from './update-task-status.command';
import { TaskStatus } from '../../domain/task-status.enum';

describe('UpdateTaskStatusService', () => {
  let service: UpdateTaskStatusService;
  let repo: jest.Mocked<Repository<Task>>;

  const mockUser = {
    id: '1',
    username: 'testuser',
    password: 'testpass',
    tasks: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTaskStatusService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UpdateTaskStatusService>(UpdateTaskStatusService);
    repo = module.get(getRepositoryToken(Task));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update task status successfully', async () => {
    const command = new UpdateTaskStatusCommand(
      '123',
      TaskStatus.IN_PROGRESS,
      mockUser,
    );
    const foundTask = {
      id: '123',
      status: TaskStatus.OPEN,
      user: mockUser,
    } as Task;
    const savedTask = { ...foundTask, status: TaskStatus.IN_PROGRESS } as Task;

    repo.findOne.mockResolvedValue(foundTask);
    repo.save.mockResolvedValue(savedTask);

    const result = await service.execute(command);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: '123', user: mockUser },
    });
    expect(repo.save).toHaveBeenCalledWith(savedTask);
    expect(result).toEqual(savedTask);
  });

  it('should throw NotFoundException if task not found', async () => {
    const command = new UpdateTaskStatusCommand(
      '123',
      TaskStatus.IN_PROGRESS,
      mockUser,
    );
    repo.findOne.mockResolvedValue(undefined);

    await expect(service.execute(command)).rejects.toThrow(NotFoundException);
  });
});
