const ThreadDetail = require('../ThreadDetail');

describe('ThreadDetail entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'test',
    };

    // Action & Assert
    expect(() => new ThreadDetail(payload)).toThrowError('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 123,
      body: true,
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [],
    };

    // Action & Assert
    expect(() => new ThreadDetail(payload)).toThrowError('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when payload comments is not an array', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'test',
      body: 'testing',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: 'not an array',
    };

    // Action & Assert
    expect(() => new ThreadDetail(payload)).toThrowError('THREAD_DETAIL.COMMENTS_NOT_ARRAY');
  });

  it('should create threadDetail entities correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'test',
      body: 'testing',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [],
    };

    // Action
    const threadDetail = new ThreadDetail(payload);

    // Assert
    expect(threadDetail).toBeInstanceOf(ThreadDetail);
    expect(threadDetail.id).toEqual(payload.id);
    expect(threadDetail.title).toEqual(payload.title);
    expect(threadDetail.body).toEqual(payload.body);
    expect(threadDetail.date).toEqual(payload.date);
    expect(threadDetail.username).toEqual(payload.username);
    expect(threadDetail.comments).toBeInstanceOf(Array);
    expect(threadDetail.comments).toEqual(payload.comments);
  });
});
