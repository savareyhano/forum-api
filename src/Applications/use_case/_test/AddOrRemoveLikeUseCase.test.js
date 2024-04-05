const LikeRepository = require('../../../Domains/likes/LikeRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddOrRemoveLikeUseCase = require('../AddOrRemoveLikeUseCase');

describe('AddOrRemoveLikeUseCase', () => {
  it('should add a like if it does not exist', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const credentialId = 'user-123';

    const mockLikeRepository = new LikeRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExist = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExist = jest.fn(() => Promise.resolve());
    mockLikeRepository.verifyLikeExist = jest.fn(() => Promise.resolve(false));
    mockLikeRepository.addLike = jest.fn(() => Promise.resolve());

    const addOrRemoveLikeUseCase = new AddOrRemoveLikeUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await addOrRemoveLikeUseCase.execute(threadId, commentId, credentialId);

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentExist).toHaveBeenCalledWith(threadId, commentId);
    expect(mockLikeRepository.verifyLikeExist)
      .toHaveBeenCalledWith(threadId, commentId, credentialId);
    expect(mockLikeRepository.addLike).toHaveBeenCalledWith(threadId, commentId, credentialId);
  });

  it('should remove a like if it exists', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const credentialId = 'user-123';

    const mockLikeRepository = new LikeRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExist = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExist = jest.fn(() => Promise.resolve());
    mockLikeRepository.verifyLikeExist = jest.fn(() => Promise.resolve(true));
    mockLikeRepository.deleteLike = jest.fn(() => Promise.resolve());

    const addOrRemoveLikeUseCase = new AddOrRemoveLikeUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await addOrRemoveLikeUseCase.execute(threadId, commentId, credentialId);

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentExist).toHaveBeenCalledWith(threadId, commentId);
    expect(mockLikeRepository.verifyLikeExist)
      .toHaveBeenCalledWith(threadId, commentId, credentialId);
    expect(mockLikeRepository.deleteLike).toHaveBeenCalledWith(threadId, commentId, credentialId);
  });
});
