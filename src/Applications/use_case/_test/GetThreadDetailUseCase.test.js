const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
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
      const getThreadDetailUseCase = new GetThreadDetailUseCase({
        threadRepository: {},
        commentRepository: {},
        replyRepository: {},
        likeRepository: {},
      });

      // Action & Assert
      const mappedComment = getThreadDetailUseCase._mapComment(deletedComment);
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
      const getThreadDetailUseCase = new GetThreadDetailUseCase({
        threadRepository: {},
        commentRepository: {},
        replyRepository: {},
        likeRepository: {},
      });

      // Action & Assert
      const mappedComment = getThreadDetailUseCase._mapComment(notDeletedComment);
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
      const getThreadDetailUseCase = new GetThreadDetailUseCase({
        threadRepository: {},
        commentRepository: {},
        replyRepository: {},
        likeRepository: {},
      });

      // Action & Assert
      const mappedReply = getThreadDetailUseCase._mapReply(deletedReply);
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
      const getThreadDetailUseCase = new GetThreadDetailUseCase({
        threadRepository: {},
        commentRepository: {},
        replyRepository: {},
        likeRepository: {},
      });

      // Action & Assert
      const mappedReply = getThreadDetailUseCase._mapReply(notDeletedReply);
      expect(mappedReply.content).toBe('testing');
    });
  });

  it('should map comments for thread', async () => {
    // Arrange
    const mockThreadDetail = {
      id: 'thread-123',
      title: 'test',
      body: 'testing',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    const mockComments = [
      {
        id: 'comment-123',
        username: 'dicoding',
        date: '2021-08-08T07:19:09.775Z',
        content: 'testing',
        is_delete: false,
      },
      {
        id: 'comment-456',
        username: 'johndoe',
        date: '2021-08-09T07:19:09.775Z',
        content: 'another test',
        is_delete: false,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExist = jest.fn().mockResolvedValue();
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve(mockComments));
    mockReplyRepository.getRepliesByThreadId = jest.fn().mockResolvedValue([]);
    mockLikeRepository.getLikesByThreadId = jest.fn().mockResolvedValue([]);
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(mockThreadDetail));

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const getThreadDetail = await getThreadDetailUseCase.execute('thread-123');

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockReplyRepository.getRepliesByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockLikeRepository.getLikesByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith('thread-123');
    expect(getThreadDetail.comments).toStrictEqual([
      {
        id: 'comment-123',
        username: 'dicoding',
        date: '2021-08-08T07:19:09.775Z',
        replies: [],
        content: 'testing',
        likeCount: 0,
      },
      {
        id: 'comment-456',
        username: 'johndoe',
        date: '2021-08-09T07:19:09.775Z',
        replies: [],
        content: 'another test',
        likeCount: 0,
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
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExist = jest.fn().mockResolvedValue();
    mockCommentRepository.getCommentsByThreadId = jest.fn().mockResolvedValue([]);
    mockReplyRepository.getRepliesByThreadId = jest.fn().mockResolvedValue([]);
    mockLikeRepository.getLikesByThreadId = jest.fn().mockResolvedValue([]);
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(mockThreadDetail));

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const getThreadDetail = await getThreadDetailUseCase.execute('thread-123');

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockReplyRepository.getRepliesByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockLikeRepository.getLikesByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith('thread-123');
    expect(getThreadDetail.comments).toStrictEqual([]);
  });

  it('should map replies for each comment', async () => {
    // Arrange
    const mockThreadDetail = {
      id: 'thread-123',
      title: 'test',
      body: 'testing',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    const mockComments = [
      {
        id: 'comment-123',
        username: 'dicoding',
        date: '2021-08-08T07:19:09.775Z',
        content: 'testing',
        is_delete: false,
      },
    ];

    const mockReplies = [
      {
        id: 'reply-123',
        content: 'testing',
        date: '2021-08-08T07:19:09.775Z',
        username: 'johndoe',
        is_delete: false,
        comment_id: 'comment-123',
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExist = jest.fn().mockResolvedValue();
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve(mockComments));
    mockReplyRepository.getRepliesByThreadId = jest.fn(() => Promise.resolve(mockReplies));
    mockLikeRepository.getLikesByThreadId = jest.fn().mockResolvedValue([]);
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(mockThreadDetail));

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const getThreadDetail = await getThreadDetailUseCase.execute('thread-123');

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockReplyRepository.getRepliesByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockLikeRepository.getLikesByThreadId).toHaveBeenCalledWith('thread-123');
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
    const mockThreadDetail = {
      id: 'thread-123',
      title: 'test',
      body: 'testing',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    const mockComments = [
      {
        id: 'comment-123',
        username: 'dicoding',
        date: '2021-08-08T07:19:09.775Z',
        content: 'testing',
        is_delete: false,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExist = jest.fn().mockResolvedValue();
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve(mockComments));
    mockReplyRepository.getRepliesByThreadId = jest.fn().mockResolvedValue([]);
    mockLikeRepository.getLikesByThreadId = jest.fn().mockResolvedValue([]);
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(mockThreadDetail));

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const getThreadDetail = await getThreadDetailUseCase.execute('thread-123');

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockReplyRepository.getRepliesByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockLikeRepository.getLikesByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith('thread-123');
    expect(getThreadDetail.comments[0].replies).toStrictEqual([]);
  });

  it('should map likeCount for each comment', async () => {
    // Arrange
    const mockThreadDetail = {
      id: 'thread-123',
      title: 'test',
      body: 'testing',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    const mockComments = [
      {
        id: 'comment-123',
        username: 'dicoding',
        date: '2021-08-08T07:19:09.775Z',
        content: 'testing',
        is_delete: false,
      },
      {
        id: 'comment-456',
        username: 'johndoe',
        date: '2021-08-09T07:19:09.775Z',
        content: 'another test',
        is_delete: false,
      },
    ];

    const mockLikeCounts = [
      {
        comment_id: 'comment-123',
        like_count: 2,
      },
      {
        comment_id: 'comment-456',
        like_count: 5,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExist = jest.fn().mockResolvedValue();
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve(mockComments));
    mockReplyRepository.getRepliesByThreadId = jest.fn().mockResolvedValue([]);
    mockLikeRepository.getLikesByThreadId = jest.fn(() => Promise.resolve(mockLikeCounts));
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(mockThreadDetail));

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const getThreadDetail = await getThreadDetailUseCase.execute('thread-123');

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockReplyRepository.getRepliesByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockLikeRepository.getLikesByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith('thread-123');
    expect(getThreadDetail.comments[0].likeCount).toBe(2);
    expect(getThreadDetail.comments[1].likeCount).toBe(5);
  });

  it('should return 0 likeCount for comments that has not been liked yet', async () => {
    // Arrange
    const mockThreadDetail = {
      id: 'thread-123',
      title: 'test',
      body: 'testing',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    const mockComments = [
      {
        id: 'comment-123',
        username: 'dicoding',
        date: '2021-08-08T07:19:09.775Z',
        content: 'testing',
        is_delete: false,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExist = jest.fn().mockResolvedValue();
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve(mockComments));
    mockReplyRepository.getRepliesByThreadId = jest.fn().mockResolvedValue([]);
    mockLikeRepository.getLikesByThreadId = jest.fn().mockResolvedValue([]);
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(mockThreadDetail));

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const getThreadDetail = await getThreadDetailUseCase.execute('thread-123');

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockReplyRepository.getRepliesByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockLikeRepository.getLikesByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith('thread-123');
    expect(getThreadDetail.comments[0].likeCount).toBe(0);
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

    const mockComments = [
      {
        id: 'comment-123',
        username: 'dicoding',
        date: '2021-08-08T07:19:09.775Z',
        content: 'testing',
        is_delete: false,
      },
    ];

    const mockReplies = [
      {
        id: 'reply-123',
        content: 'testing',
        date: '2021-08-08T07:19:09.775Z',
        username: 'johndoe',
        is_delete: false,
        comment_id: 'comment-123',
      },
    ];

    const mockLikeCounts = [
      {
        comment_id: 'comment-123',
        like_count: 2,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadExist = jest.fn(() => Promise.resolve());
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve(mockComments));
    mockReplyRepository.getRepliesByThreadId = jest.fn(() => Promise.resolve(mockReplies));
    mockLikeRepository.getLikesByThreadId = jest.fn(() => Promise.resolve(mockLikeCounts));
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(mockThreadDetail));

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const getThreadDetail = await getThreadDetailUseCase.execute('thread-123');

    // Assert
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith('thread-123');
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith('thread-123');
    expect(mockLikeRepository.getLikesByThreadId).toHaveBeenCalledWith('thread-123');
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith('thread-123');
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
          likeCount: 2,
        },
      ],
    }));
  });
});
