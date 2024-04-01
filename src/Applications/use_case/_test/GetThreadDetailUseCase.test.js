const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrating the get thread detail action correctly', async () => {
    // Arrange
    const mockThreadDetail = {
      id: 'thread-123',
      title: 'test',
      body: 'testing',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    const mockComments = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T07:19:09.775Z',
      content: 'testing',
      is_delete: false,
    };

    const mockReplies = {
      id: 'reply-123',
      content: 'testing',
      date: '2021-08-08T07:19:09.775Z',
      username: 'johndoe',
      is_delete: false,
      comment_id: 'comment-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([mockComments]));
    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([mockReplies]));
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThreadDetail));

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const threadId = 'thread-123';

    // Action
    const getThreadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(threadId);
    expect(getThreadDetail).toStrictEqual(new ThreadDetail({
      id: 'thread-123',
      title: 'test',
      body: 'testing',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'dicoding',
          date: '2021-08-08T07:19:09.775Z',
          replies: [
            {
              id: 'reply-123',
              content: 'testing',
              date: '2021-08-08T07:19:09.775Z',
              username: 'johndoe',
            },
          ],
          content: 'testing',
        },
      ],
    }));
  });
});
