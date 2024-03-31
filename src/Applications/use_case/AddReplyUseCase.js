const NewReply = require('../../Domains/replies/entities/NewReply');

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(threadId, commentId, useCasePayload, credentialId) {
    await this._threadRepository.verifyThread(threadId);
    await this._commentRepository.verifyComment(threadId, commentId);
    const newReply = new NewReply(useCasePayload);
    return this._replyRepository.addReply(threadId, commentId, newReply, credentialId);
  }
}

module.exports = AddReplyUseCase;
