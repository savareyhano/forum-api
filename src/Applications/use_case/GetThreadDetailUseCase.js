/* eslint-disable camelcase */
const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');

class GetThreadDetailUseCase {
  constructor({
    threadRepository, commentRepository, replyRepository, likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(threadId) {
    await this._threadRepository.verifyThreadExist(threadId);
    const threadDetail = await this._threadRepository.getThreadById(threadId);
    let comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const replies = await this._replyRepository.getRepliesByThreadId(threadId);
    const likeCounts = await this._likeRepository.getLikesByThreadId(threadId);

    const likeCountsByCommentId = likeCounts.reduce((acc, { comment_id, like_count }) => {
      acc[comment_id] = like_count;
      return acc;
    }, {});

    comments = comments.map((comment) => {
      const mappedComment = this._mapComment(comment);
      return {
        ...mappedComment,
        likeCount: likeCountsByCommentId[comment.id] || 0,
      };
    });

    const repliesByCommentId = replies.reduce((acc, reply) => {
      acc[reply.comment_id] = acc[reply.comment_id] || [];
      acc[reply.comment_id].push(reply);
      return acc;
    }, {});

    threadDetail.comments = comments.map((comment) => {
      const mappedReplies = repliesByCommentId[comment.id]
        ? repliesByCommentId[comment.id].map(this._mapReply)
        : [];

      return {
        id: comment.id,
        username: comment.username,
        date: comment.date,
        replies: mappedReplies,
        content: comment.content,
        likeCount: comment.likeCount,
      };
    });

    return new ThreadDetail({ ...threadDetail });
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
}

module.exports = GetThreadDetailUseCase;
