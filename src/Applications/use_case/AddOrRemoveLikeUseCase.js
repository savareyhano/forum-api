class AddLikeUseCase {
  constructor({ likeRepository, commentRepository, threadRepository }) {
    this._likeRepository = likeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(threadId, commentId, credentialId) {
    await this._threadRepository.verifyThreadExist(threadId);
    await this._commentRepository.verifyCommentExist(threadId, commentId);
    const like = await this._likeRepository.verifyLikeExist(threadId, commentId, credentialId);
    if (like) {
      await this._likeRepository.deleteLike(threadId, commentId, credentialId);
    } else {
      await this._likeRepository.addLike(threadId, commentId, credentialId);
    }
  }
}

module.exports = AddLikeUseCase;
