const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  _mapComment(comment) {
    const content = comment.is_delete ? '**komentar telah dihapus**' : comment.content;
    return {
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content,
    };
  }

  _mapReply(reply) {
    const content = reply.is_delete ? '**balasan telah dihapus**' : reply.content;
    return {
      id: reply.id,
      content,
      date: reply.date,
      username: reply.username,
    };
  }

  async execute(threadId) {
    await this._threadRepository.verifyThreadExist(threadId);
    const threadDetail = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const replies = await this._replyRepository.getRepliesByThreadId(threadId);

    const repliesByCommentId = replies.reduce((acc, reply) => {
      acc[reply.comment_id] = acc[reply.comment_id] || [];
      acc[reply.comment_id].push(reply);
      return acc;
    }, {});

    threadDetail.comments = comments.map((comment) => {
      const mappedComment = this._mapComment(comment);
      const mappedReplies = repliesByCommentId[comment.id]
        ? repliesByCommentId[comment.id].map(this._mapReply)
        : [];

      return {
        id: mappedComment.id,
        username: mappedComment.username,
        date: mappedComment.date,
        replies: mappedReplies,
        content: mappedComment.content,
      };
    });

    return new ThreadDetail({ ...threadDetail });
  }
}

module.exports = GetThreadDetailUseCase;
