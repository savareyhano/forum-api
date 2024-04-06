const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 401 when attempting to add thread without authentication', async () => {
      // Arrange
      const requestPayload = {
        title: 'test',
        body: 'testing',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when body request not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'test',
      };
      const server = await createServer(container);

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // login user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when body request not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 'test',
        body: 123,
      };
      const server = await createServer(container);

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // login user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'test',
        body: 'testing',
      };
      const server = await createServer(container);

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // login user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 404 when thread does not exist', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/xxx',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 200 and show thread detail', async () => {
      // Arrange
      const server = await createServer(container);

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // login user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // post thread
      const postThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'test',
          body: 'testing',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { data: { addedThread: { id } } } = JSON.parse(postThreadResponse.payload);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${id}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments.length).toBeLessThan(1);
      expect(responseJson.data.thread.comments).toEqual([]);
    });

    it('should handle deleted comments correctly', async () => {
      // Arrange
      const server = await createServer(container);

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // login user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // add thread
      const addThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'test',
          body: 'testing',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { data: { addedThread: { id: threadId } } } = JSON.parse(addThreadResponse.payload);

      // add comment
      const addCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'testing',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { data: { addedComment: { id: commentId } } } = JSON.parse(addCommentResponse.payload);

      // delete comment
      await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments.length).toBeGreaterThan(0);
      expect(responseJson.data.thread.comments[0].content).toEqual('**komentar telah dihapus**');
    });

    it('should handle non-deleted comments correctly', async () => {
      // Arrange
      const server = await createServer(container);

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // login user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // add thread
      const addThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'test',
          body: 'testing',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { data: { addedThread: { id } } } = JSON.parse(addThreadResponse.payload);

      // add comment
      await server.inject({
        method: 'POST',
        url: `/threads/${id}/comments`,
        payload: {
          content: 'testing',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${id}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments.length).toBeGreaterThan(0);
      expect(responseJson.data.thread.comments[0].content).toEqual('testing');
    });

    it('should handle deleted replies correctly', async () => {
      // Arrange
      const server = await createServer(container);

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // login user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // add thread
      const addThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'test',
          body: 'testing',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { data: { addedThread: { id: threadId } } } = JSON.parse(addThreadResponse.payload);

      // add comment
      const addCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'testing',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { data: { addedComment: { id: commentId } } } = JSON.parse(addCommentResponse.payload);

      // add reply
      const addReplyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: {
          content: 'testing',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { data: { addedReply: { id: replyId } } } = JSON.parse(addReplyResponse.payload);

      // delete reply
      await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments.length).toBeGreaterThan(0);
      expect(responseJson.data.thread.comments[0].content).toEqual('testing');
      expect(responseJson.data.thread.comments[0].replies.length).toBeGreaterThan(0);
      expect(responseJson.data.thread.comments[0].replies[0].content).toEqual('**balasan telah dihapus**');
    });

    it('should handle non-deleted replies correctly', async () => {
      // Arrange
      const server = await createServer(container);

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // login user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // add thread
      const addThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'test',
          body: 'testing',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { data: { addedThread: { id: threadId } } } = JSON.parse(addThreadResponse.payload);

      // add comment
      const addCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'testing',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { data: { addedComment: { id: commentId } } } = JSON.parse(addCommentResponse.payload);

      // add reply
      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: {
          content: 'testing',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments.length).toBeGreaterThan(0);
      expect(responseJson.data.thread.comments[0].content).toEqual('testing');
      expect(responseJson.data.thread.comments[0].replies.length).toBeGreaterThan(0);
      expect(responseJson.data.thread.comments[0].replies[0].content).toEqual('testing');
    });

    it('should handle likeCounts correctly', async () => {
      // Arrange
      const server = await createServer(container);

      // Add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // Login user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Post thread
      const postThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'test',
          body: 'testing',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { data: { addedThread: { id: threadId } } } = JSON.parse(postThreadResponse.payload);

      // Add comments
      const addCommentResponse1 = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'testing',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const {
        data: {
          addedComment: { id: commentId1 },
        },
      } = JSON.parse(addCommentResponse1.payload);

      const addCommentResponse2 = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'testing',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const {
        data: {
          addedComment: { id: commentId2 },
        },
      } = JSON.parse(addCommentResponse2.payload);

      // Like comments
      await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId1}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Unlike comments
      await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId2}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId2}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments.length).toBeGreaterThan(0);
      expect(responseJson.data.thread.comments[0].likeCount).toEqual(1);
      expect(responseJson.data.thread.comments[1].likeCount).toEqual(0);
    });
  });
});
