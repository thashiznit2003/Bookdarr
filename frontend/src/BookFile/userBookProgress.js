import createAjaxRequest from 'Utilities/createAjaxRequest';

export function fetchUserBookProgress(bookFileId) {
  return createAjaxRequest({
    url: `/user/progress?bookFileId=${bookFileId}`,
    method: 'GET',
    dataType: 'json'
  }).request;
}

export function saveUserBookProgress(payload) {
  return createAjaxRequest({
    url: '/user/progress',
    method: 'PUT',
    dataType: 'json',
    data: JSON.stringify(payload)
  }).request;
}
