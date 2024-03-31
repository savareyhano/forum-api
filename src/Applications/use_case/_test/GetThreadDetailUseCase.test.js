const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrating the get thread detail action correctly', async () => {
    // Arrange
    const mockThreadDetail = new ThreadDetail({
      id: 'thread-123',
      title: 'test',
      body: 'testing',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [],
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThreadDetail));

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
    });

    const threadId = 'thread-123';

    // Action
    const getThreadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(mockThreadRepository.verifyThread).toBeCalledWith(threadId);
    expect(getThreadDetail).toStrictEqual(new ThreadDetail({
      id: 'thread-123',
      title: 'test',
      body: 'testing',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [],
    }));
  });
});
