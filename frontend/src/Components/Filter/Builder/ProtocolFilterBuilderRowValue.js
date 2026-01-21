import React from 'react';
import FilterBuilderRowValue from './FilterBuilderRowValue';

const protocols = [
  { id: 'torrent', name: 'Torrent' },
  { id: 'usenet', name: 'Usenet' },
  { id: 'stacks', name: 'Stacks' }
];

function ProtocolFilterBuilderRowValue(props) {
  return (
    <FilterBuilderRowValue
      tagList={protocols}
      {...props}
    />
  );
}

export default ProtocolFilterBuilderRowValue;
