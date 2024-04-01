const { mapCommentsWithReplies } = require('../../Commons/utils/mapDBToModel');
const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    await this._threadRepository.verifyThreadExist(threadId);
    const threadDetail = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const replies = await this._replyRepository.getRepliesByThreadId(threadId);

    threadDetail.comments = mapCommentsWithReplies(comments, replies);

    return new ThreadDetail({ ...threadDetail });
  }
}

module.exports = GetThreadDetailUseCase;
