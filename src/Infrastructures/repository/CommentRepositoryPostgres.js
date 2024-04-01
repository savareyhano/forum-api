const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyCommentExist(threadId, commentId) {
    const query = {
      text: 'SELECT 1 FROM comments WHERE id = $1 AND thread_id = $2',
      values: [commentId, threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async verifyCommentOwner(threadId, commentId, credentialId) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1 AND thread_id = $2',
      values: [commentId, threadId],
    };

    const result = await this._pool.query(query);

    const comment = result.rows[0];

    if (comment.owner !== credentialId) {
      throw new AuthorizationError('tidak sah');
    }
  }

  async addComment(threadId, newComment, credentialId) {
    const { content } = newComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const isDelete = false;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, threadId, credentialId, date, content, isDelete],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async deleteComment(threadId, commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = $1 WHERE id = $2 AND thread_id = $3',
      values: [true, commentId, threadId],
    };

    await this._pool.query(query);
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT comments.id, users.username, comments.date, comments.content, comments.is_delete
             FROM comments
             LEFT JOIN users ON comments.owner = users.id
             WHERE comments.thread_id = $1
             ORDER BY comments.date ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = CommentRepositoryPostgres;
