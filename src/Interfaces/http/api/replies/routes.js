const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads/{threadId}/comments/{commentId}/replies',
    handler: (request, h) => handler.postReplyHandler(request, h),
    options: {
      auth: 'forum_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}/replies/{replyId}',
    handler: (request, h) => handler.deleteReplyHandler(request, h),
    options: {
      auth: 'forum_jwt',
    },
  },
]);

module.exports = routes;
