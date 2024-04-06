/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const LikesTableTestHelper = {
  async addLike({
    id = 'like-123', threadId = 'thread-123', commentId = 'comment-123', date = '2021-08-08T07:19:09.775Z', owner = 'user-123',
  }) {
    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3, $4, $5)',
      values: [id, threadId, commentId, date, owner],
    };

    await pool.query(query);
  },

  async findLikesByCommentId(id) {
    const query = {
      text: 'SELECT * FROM likes WHERE comment_id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM likes WHERE 1=1');
  },
};

module.exports = LikesTableTestHelper;
