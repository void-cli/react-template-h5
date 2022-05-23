import MockAdapter from 'axios-mock-adapter';
import mockData from './mockData';

function mock(ax) {
  const mo = new MockAdapter(ax, {
    delayResponse: 200
  });

  Object.keys(mockData)
    .reduce((mo, key) => {
      let [method, pathname] = key.split('::');
      mo[method](pathname).reply(config => {
        const res =
          typeof mockData[key] === 'function'
            ? mockData[key](config.data || config.params)
            : mockData[key];
        console.log(
          '**mock**',
          method,
          pathname,
          config.data || config.params,
          res
        );
        return [200, res];
      });
      return mo;
    }, mo)
    .onAny()
    .passThrough();
}
export default mock;
