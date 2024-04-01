class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(threadId, commentId, credentialId) {
    await this._threadRepository.verifyThreadExist(threadId);
    await this._commentRepository.verifyCommentExist(threadId, commentId);
    await this._commentRepository.verifyCommentOwner(threadId, commentId, credentialId);
    return this._commentRepository.deleteComment(threadId, commentId);
  }
}

module.exports = DeleteCommentUseCase;
