import React from 'react';
import PageRuntime from '../legacy/PageRuntime.jsx';
import tree from '../legacy/blog-tree.js';

export default function BlogPage() {
  return <PageRuntime page="blog" tree={tree} />;
}
