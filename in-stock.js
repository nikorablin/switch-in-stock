import axios from 'axios';
import notifier from 'node-notifier';

const vendors = [
  {
    name: 'Target',
    skus: ['77464001', '77464002'],
    unavailableKeys: ['OUT_OF_STOCK', 'UNAVAILABLE'],
    client: axios.create({
      baseURL: 'https://api.target.com/fulfillment_aggregator/v1/fiats/'
    }),
    params: {
      key: 'eb2551e4accc14f38cc42d32fbc2b2ea',
      nearby: ZIP,
      radius,
    }
  }
]

const TARGET_BLUE_RED = '77464001';
const TARGET_BLACK = '77464002';

const ZIP = '17543';
const radius = '15';


const TARGET_OUT_OF_STOCK = 'OUT_OF_STOCK';
const TARGET_UNAVAILABLE = 'UNAVAILABLE';

const getLocationStatuses = location => {
  const options = ['order_pickup', 'curbside', 'ship_to_store', 'in_store_only'];
  return options.map(option => location[option] ? location[option].availability_status : TARGET_OUT_OF_STOCK);
};

const run = async () => {
  try {
    const locations = await Promise.all([
      targetClient.get(TARGET_BLUE_RED, { params: targetParams }).then(res => res.data),
      targetClient.get(TARGET_BLACK, { params: targetParams }).then(res => res.data),
    ]).then(items => items.reduce((list, item) => ([...list, ...item.products[0].locations]), []));
    const available = locations
      .filter(
        location => getLocationStatuses(location).some(status => status !== TARGET_OUT_OF_STOCK && status !== TARGET_UNAVAILABLE)
      ).map(location => location.store_name);
    if (available.length > 0) {
      const availableStr = available.join(', ');
      notifier.notify({
        title: 'Nintendo Switch',
        message: `Found a Switch at these locations: ${availableStr}`,
        open: 'https://www.target.com/s?searchTerm=nintendo+switch',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

run();

