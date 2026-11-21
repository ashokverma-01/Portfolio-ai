import React from 'react';
import PageRuntime from '../legacy/PageRuntime.jsx';
import tree from '../legacy/home-tree.js';

export default function HomePage() {
  return <PageRuntime page="home" tree={tree} />;
}
