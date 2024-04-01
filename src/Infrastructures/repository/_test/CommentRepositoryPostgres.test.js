const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('verifyComment function', () => {
    it('should throw NotFoundError when comment does not exist or invalid', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyComment(threadId, commentId))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment does exist or valid', async () => {
      // Arrange
      const threadId = 'thread-456';
      const commentId = 'comment-321';
      await CommentsTableTestHelper.addComment({ id: commentId, threadId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyComment(threadId, commentId))
        .resolves.not.toThrowError(NotFoundError);
      const comments = await CommentsTableTestHelper.findCommentsById(commentId);
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toEqual(commentId);
      expect(comments[0].thread_id).toEqual(threadId);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError when the comment does not belong to the user', async () => {
      // Arrange
      const commentId = 'comment-123';
      const threadId = 'thread-456';
      const credentialId = 'user-123';
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: 'user-789' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(threadId, commentId, credentialId))
        .rejects.toThrowError(AuthorizationError);
      const comments = await CommentsTableTestHelper.findCommentsById(commentId);
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toEqual(commentId);
      expect(comments[0].thread_id).toEqual(threadId);
      expect(comments[0].owner).toEqual('user-789');
    });

    it('should not throw AuthorizationError when the comment does belong to the user', async () => {
      // Arrange
      const commentId = 'comment-123';
      const threadId = 'thread-456';
      const credentialId = 'user-123';
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: credentialId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(threadId, commentId, credentialId))
        .resolves.not.toThrowError(AuthorizationError);
      const comments = await CommentsTableTestHelper.findCommentsById(commentId);
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toEqual(commentId);
      expect(comments[0].thread_id).toEqual(threadId);
      expect(comments[0].owner).toEqual(credentialId);
    });
  });

  describe('addComment function', () => {
    it('should persist new comment and return added comment correctly', async () => {
      // Arrange
      const threadId = 'thread-234';
      await ThreadsTableTestHelper.addThread({ id: threadId, title: 'test' });
      const newComment = new NewComment({
        content: 'testing',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      const credentialId = 'user-123';

      // Action
      await commentRepositoryPostgres.addComment(threadId, newComment, credentialId);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toEqual('comment-123');
      expect(comments[0].thread_id).toEqual(threadId);
      expect(comments[0].owner).toEqual(credentialId);
      expect(comments[0].content).toEqual('testing');
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const threadId = 'thread-234';
      await ThreadsTableTestHelper.addThread({ id: threadId, title: 'test' });
      const newComment = new NewComment({
        content: 'testing',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      const credentialId = 'user-123';

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(
        threadId,
        newComment,
        credentialId,
      );

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'testing',
        owner: 'user-123',
      }));
    });
  });

  describe('deleteComment function', () => {
    it('should set column is_delete to true from database', async () => {
      // Arrange
      const commentRepository = new CommentRepositoryPostgres(pool);
      const threadId = 'thread-234';
      const commentId = 'comment-234';
      await CommentsTableTestHelper.addComment({ id: commentId, threadId });

      // Action
      await commentRepository.deleteComment(threadId, commentId);

      // Assert
      const commentIsDeleted = await CommentsTableTestHelper.findDeletedCommentsById(commentId);
      expect(commentIsDeleted).toHaveLength(1);
      expect(commentIsDeleted[0].is_delete).toBe(true);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return comments based on thread id correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123', threadId: 'thread-123', owner: 'user-123', date: '2021-08-08T07:19:09.775Z', content: 'testing', isDelete: false,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toStrictEqual([{
        id: 'comment-123',
        username: 'dicoding',
        date: '2021-08-08T07:19:09.775Z',
        content: 'testing',
        is_delete: false,
      }]);
    });
  });
});
