const mapDBCommentToModel = (comment) => {
  const content = comment.is_delete ? '**komentar telah dihapus**' : comment.content;
  return {
    id: comment.id,
    username: comment.username,
    date: comment.date,
    content,
  };
};

const mapDBReplyToModel = (reply) => {
  const content = reply.is_delete ? '**balasan telah dihapus**' : reply.content;
  return {
    id: reply.id,
    content,
    date: reply.date,
    username: reply.username,
  };
};

const mapCommentsWithReplies = (comments, replies) => {
  // Group replies by comment_id
  const repliesByCommentId = replies.reduce((acc, reply) => {
    acc[reply.comment_id] = acc[reply.comment_id] || [];
    acc[reply.comment_id].push(reply);
    return acc;
  }, {});

  return comments.map((comment) => {
    const mappedComment = mapDBCommentToModel(comment);
    // Map replies for this comment, or use an empty array if none exist
    const mappedReplies = repliesByCommentId[comment.id]
      ? repliesByCommentId[comment.id].map(mapDBReplyToModel)
      : [];

    return {
      id: mappedComment.id,
      username: mappedComment.username,
      date: mappedComment.date,
      replies: mappedReplies,
      content: mappedComment.content,
    };
  });
};

module.exports = {
  mapDBCommentToModel,
  mapDBReplyToModel,
  mapCommentsWithReplies,
};
