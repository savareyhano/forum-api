const ThreadRepository = require('../ThreadRepository');

describe('Thread repository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const threadRepository = new ThreadRepository();

    // Action and Assert
    await expect(threadRepository.addThread({}, '')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(threadRepository.verifyThread('')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(threadRepository.getThreadById('')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
