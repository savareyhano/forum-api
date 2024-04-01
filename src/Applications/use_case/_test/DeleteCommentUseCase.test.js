const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const credentialId = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyThreadExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act
    await deleteCommentUseCase.execute(threadId, commentId, credentialId);

    // Assert
    expect(mockThreadRepository.verifyThreadExist)
      .toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentExist)
      .toHaveBeenCalledWith(threadId, commentId);
    expect(mockCommentRepository.verifyCommentOwner)
      .toHaveBeenCalledWith(threadId, commentId, credentialId);
    expect(mockCommentRepository.deleteComment)
      .toHaveBeenCalledWith(threadId, commentId);
  });
});
