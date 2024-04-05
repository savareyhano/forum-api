const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('verifyThreadExist function', () => {
    it('should throw NotFoundError when thread does not exist or invalid', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const threadId = 'thread-123';

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadExist(threadId))
        .rejects
        .toThrowError(NotFoundError);
    });
    it('should not throw NotFoundError when thread does exist or valid', async () => {
      // Arrange
      const threadId = 'thread-234';
      const owner = 'user-123';
      await UsersTableTestHelper.addUser({ id: owner, username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadExist(threadId))
        .resolves.not.toThrowError(NotFoundError);
      const threads = await ThreadsTableTestHelper.findThreadsById(threadId);
      expect(threads).toHaveLength(1);
      expect(threads[0].id).toEqual(threadId);
      expect(threads[0].owner).toEqual(owner);
    });
  });

  describe('addThread function', () => {
    it('should persist new thread and return added thread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'test',
        body: 'testing',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const credentialId = 'user-123';
      await UsersTableTestHelper.addUser({ id: credentialId, username: 'dicoding' });

      // Action
      await threadRepositoryPostgres.addThread(newThread, credentialId);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(threads).toHaveLength(1);
      expect(threads[0].id).toEqual('thread-123');
      expect(threads[0].owner).toEqual(credentialId);
      expect(threads[0].title).toEqual('test');
      expect(threads[0].body).toEqual('testing');
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'test',
        body: 'testing',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const credentialId = 'user-123';
      await UsersTableTestHelper.addUser({ id: credentialId, username: 'dicoding' });

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread, credentialId);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'test',
        owner: 'user-123',
      }));
    });
  });

  describe('getThreadById function', () => {
    it('should return thread detail based on thread id correctly', async () => {
      // Arrange
      const owner = 'user-123';
      await UsersTableTestHelper.addUser({ id: owner, username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123', title: 'test', body: 'testing', date: '2021-08-08T07:19:09.775Z', owner,
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const threadDetail = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(threadDetail.id).toEqual('thread-123');
      expect(threadDetail.title).toEqual('test');
      expect(threadDetail.body).toEqual('testing');
      expect(threadDetail.date).toEqual('2021-08-08T07:19:09.775Z');
      expect(threadDetail.username).toEqual('dicoding');
    });
  });
});
