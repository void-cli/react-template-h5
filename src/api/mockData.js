let _data = [
  { id: 1, name: 'abc' },
  { id: 2, name: 'def' },
  { id: 3, name: 'ghi' }
];
const mockData = {
  'onPost::/test': data => {
    _data.push({
      ...JSON.parse(data)
    });
    return {
      ok: true,
      message: 'ok',
      result: {
        data
      }
    };
  },
  'onGet::/test': { ok: true, message: 'ok', result: _data }
};

export default mockData;
