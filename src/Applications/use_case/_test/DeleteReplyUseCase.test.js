const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete reply action correctly', async () => {
    // Arrange
    const credentialId = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const replyId = 'reply-123';

    const mockReplyRepository = new ReplyRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    mockThreadRepository.verifyThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReply = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act
    await deleteReplyUseCase.execute(threadId, commentId, replyId, credentialId);

    // Assert
    expect(mockReplyRepository.verifyReplyOwner)
      .toHaveBeenCalledWith(threadId, commentId, replyId, credentialId);
    expect(mockReplyRepository.deleteReply)
      .toHaveBeenCalledWith(threadId, commentId, replyId);
  });
});
