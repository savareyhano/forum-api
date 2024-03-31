const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'testing',
    };

    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: 'user-123',
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed functions */
    mockThreadRepository.verifyThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));

    /** creating use case instance */
    const getAddCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const credentialId = 'user-123';
    const threadId = 'thread-123';

    // Action
    const addedComment = await getAddCommentUseCase.execute(threadId, useCasePayload, credentialId);

    // Assert
    expect(mockThreadRepository.verifyThread).toBeCalledWith(threadId);
    expect(addedComment).toStrictEqual(new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: 'user-123',
    }));
    expect(mockCommentRepository.addComment).toBeCalledWith(threadId, new NewComment({
      content: useCasePayload.content,
    }), credentialId);
  });
});
