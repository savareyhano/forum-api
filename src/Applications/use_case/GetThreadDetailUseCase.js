class GetThreadDetailUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(threadId) {
    await this._threadRepository.verifyThread(threadId);
    return this._threadRepository.getThreadById(threadId);
  }
}

module.exports = GetThreadDetailUseCase;
