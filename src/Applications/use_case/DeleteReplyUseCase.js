class DeleteReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(threadId, commentId, replyId, credentialId) {
    await this._threadRepository.verifyThread(threadId);
    await this._commentRepository.verifyComment(threadId, commentId);
    await this._replyRepository.verifyReplyOwner(threadId, commentId, replyId, credentialId);
    return this._replyRepository.deleteReply(threadId, commentId, replyId);
  }
}

module.exports = DeleteReplyUseCase;
