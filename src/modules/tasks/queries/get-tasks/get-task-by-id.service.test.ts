import { Test, TestingModule } from '@nestjs/testing';
import { GetTaskByIdService } from './get-task-by-id.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from '../../domain/task.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { GetTaskByIdQuery } from './get-task-by-id.query';

describe('GetTaskByIdService', () => {
  let service: GetTaskByIdService;
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
        GetTaskByIdService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GetTaskByIdService>(GetTaskByIdService);
    repo = module.get(getRepositoryToken(Task));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the found task', async () => {
    const query = new GetTaskByIdQuery('123', mockUser);
    const foundTask = { id: '123', user: mockUser } as Task;

    repo.findOne.mockResolvedValue(foundTask);

    const result = await service.execute(query);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: '123', user: mockUser },
    });
    expect(result).toEqual(foundTask);
  });

  it('should throw NotFoundException if task not found', async () => {
    const query = new GetTaskByIdQuery('123', mockUser);

    repo.findOne.mockResolvedValue(undefined);

    await expect(service.execute(query)).rejects.toThrow(NotFoundException);
  });

  it('should propagate unexpected errors', async () => {
    const query = new GetTaskByIdQuery('123', mockUser);

    repo.findOne.mockRejectedValue(new Error('DB error'));

    await expect(service.execute(query)).rejects.toThrow('DB error');
  });
});
