const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('verifyReply function', () => {
    it('should throw NotFoundError when reply does not exist or invalid', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReply(threadId, commentId, replyId))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when reply does exist or valid', async () => {
      // Arrange
      const threadId = 'thread-456';
      const commentId = 'comment-123';
      const replyId = 'reply-321';
      await RepliesTableTestHelper.addReply({ id: replyId, threadId, commentId });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReply(threadId, commentId, replyId))
        .resolves.not.toThrowError(NotFoundError);
      const replies = await RepliesTableTestHelper.findRepliesById(replyId);
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toEqual(replyId);
      expect(replies[0].thread_id).toEqual(threadId);
      expect(replies[0].comment_id).toEqual(commentId);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError when the reply does not belong to the user', async () => {
      // Arrange
      const replyId = 'reply-123';
      const threadId = 'thread-456';
      const commentId = 'comment-123';
      const credentialId = 'user-123';
      await RepliesTableTestHelper.addReply({
        id: replyId, threadId, commentId, owner: 'user-789',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwner(threadId, commentId, replyId, credentialId),
      ).rejects.toThrowError(AuthorizationError);
      const replies = await RepliesTableTestHelper.findRepliesById(replyId);
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toEqual(replyId);
      expect(replies[0].thread_id).toEqual(threadId);
      expect(replies[0].comment_id).toEqual(commentId);
      expect(replies[0].owner).toEqual('user-789');
    });

    it('should not throw AuthorizationError when the reply does belong to the user', async () => {
      // Arrange
      const replyId = 'reply-123';
      const threadId = 'thread-456';
      const commentId = 'comment-123';
      const credentialId = 'user-123';
      await RepliesTableTestHelper.addReply({
        id: replyId, threadId, commentId, owner: credentialId,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwner(threadId, commentId, replyId, credentialId),
      ).resolves.not.toThrowError(AuthorizationError);
      const replies = await RepliesTableTestHelper.findRepliesById(replyId);
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toEqual(replyId);
      expect(replies[0].thread_id).toEqual(threadId);
      expect(replies[0].comment_id).toEqual(commentId);
      expect(replies[0].owner).toEqual(credentialId);
    });
  });

  describe('addReply function', () => {
    it('should persist new reply and return added reply correctly', async () => {
      // Arrange
      const threadId = 'thread-234';
      const commentId = 'comment-234';
      await ThreadsTableTestHelper.addThread({ id: threadId, title: 'test' });
      await CommentsTableTestHelper.addComment({ id: commentId, content: 'testing' });
      const newReply = new NewReply({
        content: 'testing',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      const credentialId = 'user-123';

      // Action
      await replyRepositoryPostgres.addReply(threadId, commentId, newReply, credentialId);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toEqual('reply-123');
      expect(replies[0].thread_id).toEqual(threadId);
      expect(replies[0].comment_id).toEqual(commentId);
      expect(replies[0].owner).toEqual(credentialId);
      expect(replies[0].content).toEqual('testing');
    });

    it('should return added reply correctly', async () => {
      // Arrange
      const threadId = 'thread-234';
      const commentId = 'comment-234';
      await ThreadsTableTestHelper.addThread({ id: threadId, title: 'test' });
      await CommentsTableTestHelper.addComment({ id: commentId, content: 'testing' });
      const newReply = new NewReply({
        content: 'testing',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      const credentialId = 'user-123';

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(
        threadId,
        commentId,
        newReply,
        credentialId,
      );

      // Assert
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: 'testing',
        owner: 'user-123',
      }));
    });
  });

  describe('deleteReply function', () => {
    it('should set column is_delete to true from database', async () => {
      // Arrange
      const replyRepository = new ReplyRepositoryPostgres(pool);
      const threadId = 'thread-234';
      const commentId = 'comment-234';
      const replyId = 'reply-234';
      await RepliesTableTestHelper.addReply({ id: replyId, threadId, commentId });

      // Action
      await replyRepository.deleteReply(threadId, commentId, replyId);

      // Assert
      const replyIsDeleted = await RepliesTableTestHelper.findDeletedRepliesById(replyId);
      expect(replyIsDeleted).toHaveLength(1);
      expect(replyIsDeleted[0].is_delete).toBe(true);
    });
  });
});
