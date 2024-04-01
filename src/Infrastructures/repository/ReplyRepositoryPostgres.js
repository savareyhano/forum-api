const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyReply(threadId, commentId, replyId) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1 AND comment_id = $2 AND thread_id = $3',
      values: [replyId, commentId, threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('reply tidak ditemukan');
    }

    return result.rows[0];
  }

  async verifyReplyOwner(threadId, commentId, replyId, credentialId) {
    const reply = await this.verifyReply(threadId, commentId, replyId);

    if (reply.owner !== credentialId) {
      throw new AuthorizationError('tidak sah');
    }
  }

  async addReply(threadId, commentId, newReply, credentialId) {
    const { content } = newReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const isDelete = false;

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id, content, owner',
      values: [id, threadId, commentId, content, date, credentialId, isDelete],
    };

    const result = await this._pool.query(query);

    return new AddedReply({ ...result.rows[0] });
  }

  async deleteReply(threadId, commentId, replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = $1 WHERE id = $2 AND thread_id = $3 AND comment_id = $4',
      values: [true, replyId, threadId, commentId],
    };

    await this._pool.query(query);
  }

  async getRepliesByThreadId(threadId) {
    const query = {
      text: `SELECT replies.id, replies.content, replies.date, users.username, replies.is_delete, replies.comment_id
             FROM replies
             LEFT JOIN users ON replies.owner = users.id
             WHERE replies.thread_id = $1
             ORDER BY replies.date ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = ReplyRepositoryPostgres;
