const AddOrRemoveLikeUseCase = require('../../../../Applications/use_case/AddOrRemoveLikeUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;
  }

  async putLikeHandler(request, h) {
    const addOrRemoveLikeUseCase = this._container.getInstance(AddOrRemoveLikeUseCase.name);
    await addOrRemoveLikeUseCase.execute(
      request.params.threadId,
      request.params.commentId,
      request.auth.credentials.id,
    );

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = LikesHandler;
