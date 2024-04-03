const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'testing',
    };

    const mockAddedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: 'user-123',
    });

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed functions */
    mockThreadRepository.verifyThreadExist = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExist = jest.fn(() => Promise.resolve());
    mockReplyRepository.addReply = jest.fn(() => Promise.resolve(mockAddedReply));

    /** creating use case instance */
    const getAddReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const credentialId = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';

    // Action
    const addedReply = await getAddReplyUseCase.execute(
      threadId,
      commentId,
      useCasePayload,
      credentialId,
    );

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentExist).toBeCalledWith(threadId, commentId);
    expect(addedReply).toStrictEqual(new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: 'user-123',
    }));
    expect(mockReplyRepository.addReply).toBeCalledWith(threadId, commentId, new NewReply({
      content: useCasePayload.content,
    }), credentialId);
  });
});
