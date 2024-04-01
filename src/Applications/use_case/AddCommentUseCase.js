const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(threadId, useCasePayload, credentialId) {
    await this._threadRepository.verifyThreadExist(threadId);
    const newComment = new NewComment(useCasePayload);
    return this._commentRepository.addComment(threadId, newComment, credentialId);
  }
}

module.exports = AddCommentUseCase;
