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

  async verifyComment(threadId, commentId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND thread_id = $2',
      values: [commentId, threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }

    return result.rows[0];
  }

  async verifyCommentOwner(threadId, commentId, credentialId) {
    const comment = await this.verifyComment(threadId, commentId);

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
}

module.exports = CommentRepositoryPostgres;
