const { mapCommentsWithReplies } = require('../../Commons/utils/mapDBToModel');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyThread(threadId) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }
  }

  async addThread(newThread, credentialId) {
    const { title, body } = newThread;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
      values: [id, title, body, date, credentialId],
    };

    const result = await this._pool.query(query);

    return new AddedThread({ ...result.rows[0] });
  }

  async getThreadById(threadId) {
    const query = {
      text: `SELECT threads.id, threads.title, threads.body, threads.date, users.username
             FROM threads
             LEFT JOIN users ON threads.owner = users.id
             WHERE threads.id = $1`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    const commentQuery = {
      text: `SELECT comments.id, users.username, comments.date, comments.content, comments.is_delete
             FROM comments
             LEFT JOIN users ON comments.owner = users.id
             WHERE comments.thread_id = $1
             ORDER BY comments.date ASC`,
      values: [threadId],
    };

    const commentResult = await this._pool.query(commentQuery);

    const replyQuery = {
      text: `SELECT replies.id, replies.content, replies.date, users.username, replies.is_delete, replies.comment_id
             FROM replies
             LEFT JOIN users ON replies.owner = users.id
             WHERE replies.thread_id = $1
             ORDER BY replies.date ASC`,
      values: [threadId],
    };

    const replyResult = await this._pool.query(replyQuery);

    // Use the utility function to map comments with their replies
    const threads = result.rows[0];
    threads.comments = mapCommentsWithReplies(commentResult.rows, replyResult.rows);

    return new ThreadDetail({ ...threads });
  }
}

module.exports = ThreadRepositoryPostgres;
