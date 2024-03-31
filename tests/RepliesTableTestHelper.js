/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123', threadId = 'thread-123', commentId = 'comment-123', content = 'testing', date = '2021-08-08T07:19:09.775Z', owner = 'user-123', isDelete = false,
  }) {
    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6, $7)',
      values: [id, threadId, commentId, content, date, owner, isDelete],
    };

    await pool.query(query);
  },

  async findRepliesById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findDeletedRepliesById(id) {
    const query = {
      text: 'SELECT is_delete FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;
