import createAjaxRequest from 'Utilities/createAjaxRequest';

export function fetchUserBookProgress(bookFileId) {
  return createAjaxRequest({
    url: `/user/progress?bookFileId=${bookFileId}`,
    method: 'GET',
    dataType: 'json'
  }).request;
}

export function saveUserBookProgress(payload) {
  const data = {
    ...payload
  };

  if (!data.id && data.bookFileId) {
    data.id = data.bookFileId;
  }

  return createAjaxRequest({
    url: '/user/progress',
    method: 'PUT',
    dataType: 'json',
    data: JSON.stringify(data)
  }).request;
}
