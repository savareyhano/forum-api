const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
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
    await UsersTableTestHelper.cleanTable();
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
      await expect(replyRepositoryPostgres.verifyReplyExist(threadId, commentId, replyId))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when reply does exist or valid', async () => {
      // Arrange
      const threadId = 'thread-456';
      const commentId = 'comment-123';
      const replyId = 'reply-321';
      const owner = 'user-123';
      await UsersTableTestHelper.addUser({ id: owner, username: 'dicoding' });
      await RepliesTableTestHelper.addReply({
        id: replyId, threadId, commentId, owner,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyExist(threadId, commentId, replyId))
        .resolves.not.toThrowError(NotFoundError);
      const replies = await RepliesTableTestHelper.findRepliesById(replyId);
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toEqual(replyId);
      expect(replies[0].thread_id).toEqual(threadId);
      expect(replies[0].comment_id).toEqual(commentId);
      expect(replies[0].owner).toEqual(owner);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError when the reply does not belong to the user', async () => {
      // Arrange
      const replyId = 'reply-123';
      const threadId = 'thread-456';
      const commentId = 'comment-123';
      const credentialId = 'user-123';
      const anotherUser = 'user-789';
      await UsersTableTestHelper.addUser({ id: credentialId, username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: anotherUser, username: 'johndoe' });
      await RepliesTableTestHelper.addReply({
        id: replyId, threadId, commentId, owner: anotherUser,
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
      await UsersTableTestHelper.addUser({ id: credentialId, username: 'dicoding' });
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
      const credentialId = 'user-123';
      await UsersTableTestHelper.addUser({ id: credentialId, username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: threadId, title: 'test' });
      await CommentsTableTestHelper.addComment({ id: commentId, content: 'testing' });
      const newReply = new NewReply({
        content: 'testing',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

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
      const credentialId = 'user-123';
      await UsersTableTestHelper.addUser({ id: credentialId, username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: threadId, title: 'test' });
      await CommentsTableTestHelper.addComment({ id: commentId, content: 'testing' });
      const newReply = new NewReply({
        content: 'testing',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

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
      const owner = 'user-123';
      await UsersTableTestHelper.addUser({ id: owner, username: 'dicoding' });
      await RepliesTableTestHelper.addReply({
        id: replyId, threadId, commentId, owner,
      });

      // Action
      await replyRepository.deleteReply(threadId, commentId, replyId);

      // Assert
      const replyIsDeleted = await RepliesTableTestHelper.findDeletedRepliesById(replyId);
      expect(replyIsDeleted).toHaveLength(1);
      expect(replyIsDeleted[0].is_delete).toBe(true);
    });
  });

  describe('getRepliesByThreadId function', () => {
    it('should return replies based on thread id correctly', async () => {
      // Arrange
      const owner = 'user-123';
      await UsersTableTestHelper.addUser({ id: owner, username: 'dicoding' });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123', threadId: 'thread-123', commentId: 'comment-123', content: 'testing', date: '2021-08-08T07:19:09.775Z', owner, isDelete: false,
      });
      const repliesRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await repliesRepositoryPostgres.getRepliesByThreadId('thread-123');

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toEqual('reply-123');
      expect(replies[0].content).toEqual('testing');
      expect(replies[0].date).toEqual('2021-08-08T07:19:09.775Z');
      expect(replies[0].username).toEqual('dicoding');
      expect(replies[0].is_delete).toEqual(false);
      expect(replies[0].comment_id).toEqual('comment-123');
    });
  });
});
