const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

describe('LikeRepositoryPostgres', () => {
  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('verifyLikeExist function', () => {
    it('should return false when like does not exist', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const credentialId = 'user-123';

      // Action
      const result = await likeRepositoryPostgres.verifyLikeExist(
        threadId,
        commentId,
        credentialId,
      );

      // Assert
      expect(result).toBe(false);
    });

    it('should return true when like exists', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const credentialId = 'user-123';
      await UsersTableTestHelper.addUser({ id: credentialId, username: 'dicoding' });
      await LikesTableTestHelper.addLike({ threadId, commentId, owner: credentialId });

      // Action
      const result = await likeRepositoryPostgres.verifyLikeExist(
        threadId,
        commentId,
        credentialId,
      );

      // Assert
      expect(result).toBe(true);
      const likes = await LikesTableTestHelper.findLikesByCommentId(commentId);
      expect(likes).toHaveLength(1);
      expect(likes[0].thread_id).toEqual(threadId);
      expect(likes[0].comment_id).toEqual(commentId);
      expect(likes[0].owner).toEqual(credentialId);
    });
  });

  describe('addLike function', () => {
    it('should add like to database', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const credentialId = 'user-123';
      await UsersTableTestHelper.addUser({ id: credentialId, username: 'dicoding' });
      const fakeIdGenerator = () => '123'; // stub!
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.addLike(threadId, commentId, credentialId);

      // Assert
      const likes = await LikesTableTestHelper.findLikesByCommentId(commentId);
      expect(likes).toHaveLength(1);
      expect(likes[0].id).toEqual('like-123');
      expect(likes[0].thread_id).toEqual(threadId);
      expect(likes[0].comment_id).toEqual(commentId);
      expect(likes[0].owner).toEqual(credentialId);
    });
  });

  describe('deleteLike function', () => {
    it('should delete like from database', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const credentialId = 'user-123';
      await UsersTableTestHelper.addUser({ id: credentialId, username: 'dicoding' });
      await LikesTableTestHelper.addLike({ threadId, commentId, owner: credentialId });

      // Action
      await likeRepositoryPostgres.deleteLike(threadId, commentId, credentialId);

      // Assert
      const likes = await LikesTableTestHelper.findLikesByCommentId(commentId);
      expect(likes).toHaveLength(0);
    });
  });

  describe('getLikesByThreadId function', () => {
    it('should return likes based on thread id correctly', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const credentialId = 'user-123';
      await UsersTableTestHelper.addUser({ id: credentialId, username: 'dicoding' });
      await LikesTableTestHelper.addLike({ threadId, commentId, owner: credentialId });

      // Action
      const likes = await likeRepositoryPostgres.getLikesByThreadId(threadId);

      // Assert
      expect(likes).toHaveLength(1);
      expect(likes[0].comment_id).toEqual(commentId);
      expect(likes[0].like_count).toEqual(1);
    });
  });
});
