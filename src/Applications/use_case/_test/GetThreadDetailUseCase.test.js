const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
  describe('_mapComment', () => {
    it('should modify content if comment is marked as deleted', () => {
      // Arrange
      const deletedComment = {
        id: 'comment-123',
        username: 'dicoding',
        date: '2021-08-08T07:19:09.775Z',
        content: 'testing',
        is_delete: true,
      };

      /** creating use case instance */
      const useCase = new GetThreadDetailUseCase({
        threadRepository: {},
        commentRepository: {},
        replyRepository: {},
      });

      // Action & Assert
      const mappedComment = useCase._mapComment(deletedComment);
      expect(mappedComment.content).toBe('**komentar telah dihapus**');
    });

    it('should not modify content if comment is not marked as deleted', () => {
      // Arrange
      const notDeletedComment = {
        id: 'comment-123',
        username: 'dicoding',
        date: '2021-08-08T07:19:09.775Z',
        content: 'testing',
        is_delete: false,
      };

      /** creating use case instance */
      const useCase = new GetThreadDetailUseCase({
        threadRepository: {},
        commentRepository: {},
        replyRepository: {},
      });

      // Action & Assert
      const mappedComment = useCase._mapComment(notDeletedComment);
      expect(mappedComment.content).toBe('testing');
    });
  });

  describe('_mapReply', () => {
    it('should modify content if reply is marked as deleted', () => {
      // Arrange
      const deletedReply = {
        id: 'reply-123',
        content: 'testing',
        date: '2021-08-08T07:19:09.775Z',
        username: 'johndoe',
        is_delete: true,
      };

      /** creating use case instance */
      const useCase = new GetThreadDetailUseCase({
        threadRepository: {},
        commentRepository: {},
        replyRepository: {},
      });

      // Action & Assert
      const mappedReply = useCase._mapReply(deletedReply);
      expect(mappedReply.content).toBe('**balasan telah dihapus**');
    });

    it('should not modify content if reply is not marked as deleted', () => {
      // Arrange
      const notDeletedReply = {
        id: 'reply-123',
        content: 'testing',
        date: '2021-08-08T07:19:09.775Z',
        username: 'johndoe',
        is_delete: false,
      };

      /** creating use case instance */
      const useCase = new GetThreadDetailUseCase({
        threadRepository: {},
        commentRepository: {},
        replyRepository: {},
      });

      // Action & Assert
      const mappedReply = useCase._mapReply(notDeletedReply);
      expect(mappedReply.content).toBe('testing');
    });
  });

  it('should map comments for thread', async () => {
    // Arrange
    const mockCommentDicoding = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T07:19:09.775Z',
      content: 'testing',
      is_delete: false,
    };

    const mockCommentJohnDoe = {
      id: 'comment-456',
      username: 'johndoe',
      date: '2021-08-09T07:19:09.775Z',
      content: 'another test',
      is_delete: false,
    };

    const mockThreadDetail = {
      id: 'thread-123',
      title: 'test',
      body: 'testing',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExist = jest.fn().mockResolvedValue();
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockResolvedValue([
      mockCommentDicoding,
      mockCommentJohnDoe,
    ]);
    mockReplyRepository.getRepliesByThreadId = jest.fn().mockResolvedValue([]);
    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue(mockThreadDetail);

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const getThreadDetail = await getThreadDetailUseCase.execute('thread-123');

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockReplyRepository.getRepliesByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith('thread-123');
    expect(getThreadDetail.comments).toEqual([
      {
        id: 'comment-123',
        username: 'dicoding',
        date: '2021-08-08T07:19:09.775Z',
        content: 'testing',
        replies: [],
      },
      {
        id: 'comment-456',
        username: 'johndoe',
        date: '2021-08-09T07:19:09.775Z',
        content: 'another test',
        replies: [],
      },
    ]);
  });

  it('should return an empty array for thread with no comments', async () => {
    // Arrange
    const mockThreadDetail = {
      id: 'thread-123',
      title: 'test',
      body: 'testing',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExist = jest.fn().mockResolvedValue();
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockResolvedValue([]);
    mockReplyRepository.getRepliesByThreadId = jest.fn().mockResolvedValue([]);
    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue(mockThreadDetail);

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const getThreadDetail = await getThreadDetailUseCase.execute('thread-123');

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockReplyRepository.getRepliesByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith('thread-123');
    expect(getThreadDetail.comments).toEqual([]);
  });

  it('should map replies for each comment', async () => {
    // Arrange
    const mockComment = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T07:19:09.775Z',
      content: 'testing',
      is_delete: false,
    };

    const mockReply = {
      id: 'reply-123',
      content: 'testing',
      date: '2021-08-08T07:19:09.775Z',
      username: 'johndoe',
      is_delete: false,
      comment_id: 'comment-123',
    };

    const mockThreadDetail = {
      id: 'thread-123',
      title: 'test',
      body: 'testing',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExist = jest.fn().mockResolvedValue();
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockResolvedValue([mockComment]);
    mockReplyRepository.getRepliesByThreadId = jest.fn().mockResolvedValue([mockReply]);
    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue(mockThreadDetail);

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const getThreadDetail = await getThreadDetailUseCase.execute('thread-123');

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockReplyRepository.getRepliesByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith('thread-123');
    expect(getThreadDetail.comments[0].replies[0]).toStrictEqual({
      id: 'reply-123',
      content: 'testing',
      date: '2021-08-08T07:19:09.775Z',
      username: 'johndoe',
    });
  });

  it('should return an empty array for comments with no replies', async () => {
    // Arrange
    const mockComment = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T07:19:09.775Z',
      content: 'testing',
      is_delete: false,
    };

    const mockThreadDetail = {
      id: 'thread-123',
      title: 'test',
      body: 'testing',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExist = jest.fn().mockResolvedValue();
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockResolvedValue([mockComment]);
    mockReplyRepository.getRepliesByThreadId = jest.fn().mockResolvedValue([]);
    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue(mockThreadDetail);

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const getThreadDetail = await getThreadDetailUseCase.execute('thread-123');

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockReplyRepository.getRepliesByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith('thread-123');
    expect(getThreadDetail.comments[0].replies).toEqual([]);
  });

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
    const expectedComment = {
      ...getThreadDetailUseCase._mapComment(mockComments),
      replies: [getThreadDetailUseCase._mapReply(mockReplies)],
    };
    expect(getThreadDetail.comments[0]).toStrictEqual(expectedComment);
    expect(getThreadDetail.comments[0].replies[0])
      .toStrictEqual(getThreadDetailUseCase._mapReply(mockReplies));
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
